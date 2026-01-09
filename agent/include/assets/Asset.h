#pragma once

#include <cstdint>
#include <string>

struct Asset {
  std::string id; // stable id (hash of path for nowq)
  std::string path; // absolute path
  std::string type; // extension-based for phase 0
  uint64_t size = 0;
  uint64_t modified = 0; // unix timestamp  
};
