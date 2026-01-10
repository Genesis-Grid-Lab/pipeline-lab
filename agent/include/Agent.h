#pragma once
#include "fs/FileWatcher.h"
#include "assets/AssetIndex.h"
#include "http/HttpServer.h"

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
  Scope<HttpServer> m_http;
  AssetIndex m_assets;
  EventStream m_events;
  
};
