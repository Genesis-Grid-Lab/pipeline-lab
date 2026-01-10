#include "fs/FileWatcherLinux.h"
#include "Logger.h"
#include "fs/FileEvent.h"

#include <filesystem>
#include <sys/inotify.h>
#include <unistd.h>
#include <limits.h>
#include <cstring>

bool FileWatcherLinux::Start(const std::string &path, Callback callback) {
  if (m_running)
    return false;

  if (!std::filesystem::exists(path)){
    LOG_ERROR("Asset path {} does not exists", path);
    return false;
  }

  m_fd = inotify_init1(IN_NONBLOCK);
  if(m_fd < 0){
    LOG_ERROR("Failed to init inotify");
    return false;
  }

  watchRecursive(path);

  m_root = path;
  m_callback = callback;
  m_running = true;

  m_thread = std::thread(&FileWatcherLinux::run, this);

  LOG_INFO("FileWatcherLinux started on {}", path);

  return true;
}

void FileWatcherLinux::Stop(){
  if (!m_running)
    return;

  m_running = false;
  if (m_thread.joinable())
    m_thread.join();

  LOG_INFO("FileWatcherLinux stopped");
}

void FileWatcherLinux::watchRecursive(const std::string &root) {
  addWatch(root);

  for (auto &e : std::filesystem::recursive_directory_iterator(root)) {
    if (e.is_directory()) {
      addWatch(e.path().string());
    }
  }
}

void FileWatcherLinux::addWatch(const std::string& path){
  int wd = inotify_add_watch(m_fd, path.c_str(),
                             IN_CREATE | IN_DELETE | IN_MODIFY | IN_MOVED_FROM |
                                 IN_MOVED_TO);

  if (wd < 0) {
    LOG_ERROR("Failed to watch directory: {}", path);
    perror("inotify_add_watch");
    close(m_fd);
    return;
  }

  m_watchToPath[wd] = path;
}

void FileWatcherLinux::run() {

  constexpr size_t BufferSize = 1024 * (sizeof(inotify_event) + NAME_MAX + 1);

  char buffer[BufferSize];


  while (m_running) {
    int length = read(m_fd, buffer, BufferSize);
    if (length <= 0) {
      usleep(10000);
      continue;
    }

    int i = 0;
    while (i < length){
      auto *event = reinterpret_cast<inotify_event *>(&buffer[i]);

      std::string base = m_watchToPath[event->wd];
      std::string full = base + "/" + event->name;

      bool isDir = event->mask & IN_ISDIR;

      // --- RENAME (pairing) ---
      if (event->mask & IN_MOVED_FROM)
        m_pendingMoveFrom = full;
      else if (event->mask & IN_MOVED_TO){
	if(m_pendingMoveFrom){
          emit({FileEventType::Renamed, full, *m_pendingMoveFrom, isDir});

          if (isDir) {
            removeWatchByPath(*m_pendingMoveFrom);
	    addWatch(full);
          }

	  m_pendingMoveFrom.reset();
	  
	}
      }

      // --- CREATE ---
      else if (event->mask & IN_CREATE) {
        emit({FileEventType::Added, full, "", isDir});

        if (isDir)
	  addWatch(full);
      }

      // --- DELETE ---
      else if (event->mask & IN_DELETE) {
        emit({FileEventType::Removed, full, "", isDir});

        if (isDir)
	  removeWatchByPath(full);
      }

      // --- MODIFY ---
      else if (event->mask & IN_MODIFY) {
        emit({FileEventType::Modified, full, "", isDir});
      }

      i += sizeof(inotify_event) + event->len;
    }
  }

}

void FileWatcherLinux::removeWatchByPath(const std::string &path) {

  for (auto it = m_watchToPath.begin(); it != m_watchToPath.end(); ++it) {
    if (it->second == path) {
      inotify_rm_watch(m_fd, it->first);
      m_watchToPath.erase(it);
      break;
    }
  }
}

void FileWatcherLinux::emit(const FileEvent &e) {

  if (m_callback)
    m_callback(e);
}
