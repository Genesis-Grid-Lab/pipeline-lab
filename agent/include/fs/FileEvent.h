#pragma once
#include "Logger.h"
#include <string>

enum class FileEventType {
  Added,
  Modified,
  Removed,
  Renamed      
};


struct FileEvent {
  FileEventType type;
  std::string path;
  std::string oldPath;
  bool isDirectory = false;
};
