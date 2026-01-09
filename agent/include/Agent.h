#pragma once
#include <atomic>
#include <memory>
#include <thread>
#include "fs/FileWatcher.h"
#include "assets/AssetIndex.h"

class Agent {
public:
  Agent();
  ~Agent();

  bool Start();
  void Stop();

  bool isRunning() const;

private:
  void run();

private:
  std::atomic<bool> m_running{false};
  std::thread m_thread;
  Scope<FileWatcher> m_watcher;
  AssetIndex m_assets;
};
