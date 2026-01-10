#pragma once

#include "http/EventStream.h"
#include "assets/AssetIndex.h"
#include <thread>

class HttpServer {
public:
  explicit HttpServer(AssetIndex &assets, EventStream& events);
  ~HttpServer();

  bool Start(int port);
  void Stop();

private:
  AssetIndex &m_assets;
  EventStream &m_events;
  struct Impl;
  Scope<Impl> m_impl;

  std::thread m_thread;
};

