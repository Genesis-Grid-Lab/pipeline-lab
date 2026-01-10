#pragma once

#include "fs/FileEvent.h"

class EventStream {
public:
  using Listener = std::function<void(const FileEvent &)>;

  void Subscribe(Listener listener);
  void Publish(const FileEvent &event);

private:
  std::mutex m_mutex;
  std::vector<Listener> m_listeners;
};

