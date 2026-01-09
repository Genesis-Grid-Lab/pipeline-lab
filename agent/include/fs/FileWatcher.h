#pragma once

#include "Logger.h"
#include "FileEvent.h"
#include <functional>
#include <string>

class FileWatcher {
public:
  using Callback = std::function<void(const FileEvent &)>;

  virtual ~FileWatcher() = default;

  virtual bool Start(const std::string &path, Callback callback) = 0;
  virtual void Stop() = 0;

  static Scope<FileWatcher> Create();
};
