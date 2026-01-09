#pragma once
#include <atomic>
#include <thread>
#include "fs/FileWatcher.h"

class FileWatcherLinux : public FileWatcher {
public:
  bool Start(const std::string &path, Callback callback) override;
  void Stop() override;

private:
  void run();

  std::atomic<bool> m_running{false};
  std::thread m_thread;
  Callback m_callback;
  std::string m_root;
};
