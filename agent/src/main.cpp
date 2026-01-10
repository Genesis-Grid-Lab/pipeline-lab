#include <iostream>
#include "Logger.h"
#include "Agent.h"

int main() {
  Log::Init();
  LOG_INFO("Log init");
  Agent agent;
  agent.Start();

  while (agent.isRunning()) {
    sleep(100);
  }
  return 0;  
}
