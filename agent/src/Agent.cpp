#include "Agent.h"
#include "http/HttpServer.h"
#include <chrono>
#include <thread>

Agent::Agent() = default;

Agent::~Agent() { Stop(); }

bool Agent::Start() {

  if (m_running)
    return false;

  m_running = true;
  m_thread = std::thread(&Agent::run, this);

  m_http = CreateScope<HttpServer>(m_assets, m_events);
  m_http->Start(4848);

  m_watcher = FileWatcher::Create();

  m_assets.InitialScan("/home/nephilim/Assets");

  m_watcher->Start("/home/nephilim/Assets", [this](const FileEvent &e) {
    m_assets.OnFileEvent(e);
    m_events.Publish(e);
    // TODO:
    // notify API clients
  });
  
  LOG_INFO("Agent started");

  return true;
}

void Agent::Stop(){
  if (!m_running)
    return;

  m_running = false;

  if (m_http)
    m_http->Stop();

  if (m_thread.joinable())
    m_thread.join();

  LOG_INFO("Agent stopped");
}

bool Agent::isRunning() const { return m_running; }

void Agent::run() {
  while (m_running) {

    // TODO: folder watching, indexing, IPC server
    std::this_thread::sleep_for(std::chrono::milliseconds(500));
  }  
}
