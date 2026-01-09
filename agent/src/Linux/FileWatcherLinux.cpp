#include "fs/FileWatcherLinux.h"
#include "Logger.h"
#include "fs/FileEvent.h"

#include <sys/inotify.h>
#include <unistd.h>
#include <limits.h>
#include <cstring>

bool FileWatcherLinux::Start(const std::string &path, Callback callback) {
  if (m_running)
    return false;

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


void FileWatcherLinux::run() {
  int fd = inotify_init1(IN_NONBLOCK);
  if(fd < 0){
    LOG_ERROR("inotify_init failed");
    return;
  }

  int wd = inotify_add_watch(fd, m_root.c_str(),
                             IN_CREATE | IN_MODIFY | IN_DELETE | IN_MOVED_FROM |
                                 IN_MOVED_TO);

  if (wd < 0) {
    LOG_ERROR("Failed to watch directory: {}", m_root);
    close(fd);
    return;
  }

  constexpr size_t BufferSize = 1024 * (sizeof(inotify_event) + NAME_MAX + 1);

  char buffer[BufferSize];


  while (m_running) {
    int length = read(fd, buffer, BufferSize);
    if (length <= 0) {
      usleep(10000);
      continue;
    }

    int i = 0;
    while (i < length){
      auto *event = reinterpret_cast<inotify_event *>(&buffer[i]);

      if(event->len > 0){
        FileEvent fe;
        fe.path = m_root + "/" + event->name;

        if (event->mask & IN_CREATE)
          fe.type = FileEventType::Added;
        else if (event->mask & IN_MODIFY)
          fe.type = FileEventType::Modified;
        else if (event->mask & IN_DELETE)
          fe.type = FileEventType::Removed;
        else if (event->mask & IN_MOVED_FROM)
          fe.type = FileEventType::Renamed;
        else if (event->mask & IN_MOVED_TO)
          fe.type = FileEventType::Added;

        if (m_callback)
          m_callback(fe);

      }

      i += sizeof(inotify_event) + event->len;
    }
  }

  inotify_rm_watch(fd, wd);
  close(fd);
}
