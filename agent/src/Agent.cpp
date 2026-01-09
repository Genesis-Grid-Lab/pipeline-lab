#include "Agent.h"
#include <chrono>
#include <thread>

Agent::Agent() = default;

Agent::~Agent() { Stop(); }

bool Agent::Start() {

  if (m_running)
    return false;

  m_running = true;
  m_thread = std::thread(&Agent::run, this);

  m_watcher = FileWatcher::Create();

  m_watcher->Start("/home/nephilim/Assets", [this](const FileEvent &e) {
 
    m_assets.OnFileEvent(e);
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
