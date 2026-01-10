#pragma once
#include <atomic>
#include <thread>
#include <unordered_map>
#include "fs/FileWatcher.h"

class FileWatcherLinux : public FileWatcher {
public:
  bool Start(const std::string &path, Callback callback) override;
  void Stop() override;

private:
  void run();
  void watchRecursive(const std::string &root);
  void addWatch(const std::string &path);
  void removeWatchByPath(const std::string &path);
  void emit(const FileEvent& e);
private:
  std::atomic<bool> m_running{false};
  int m_fd = -1;
  std::thread m_thread;
  std::unordered_map<int, std::string> m_watchToPath;
  Callback m_callback;
  std::string m_root;

  std::optional<std::string> m_pendingMoveFrom;
};
