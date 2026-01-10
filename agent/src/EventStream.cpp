#include "http/EventStream.h"

void EventStream::Subscribe(Listener listener) {
  std::lock_guard lock(m_mutex);
  m_listeners.push_back(std::move(listener));
}

void EventStream::Publish(const FileEvent &event) {
  std::lock_guard lock(m_mutex);
  for (auto &l : m_listeners)
    l(event);
}
