#include "assets/AssetIndex.h"
#include "Logger.h"
#include <bits/chrono.h>
#include <filesystem>
#include <chrono>

namespace fs = std::filesystem;

static std::string makeId(const std::string& path){
  return std::to_string(std::hash<std::string>{}(path));
}

void AssetIndex::OnFileEvent(const FileEvent &e){
  switch(e.type){
  case FileEventType::Added:
  case FileEventType::Modified:
    addOrUpdate(e.path);
    break;
  case FileEventType::Removed:
    remove(e.path);
    break;
  case FileEventType::Renamed:
    if (!e.oldPath.empty())
      remove(e.oldPath);
    addOrUpdate(e.path);    
    break;
  }
}

void AssetIndex::addOrUpdate(const std::string& path){
  std::lock_guard lock(m_mutex);

  if (!fs::exists(path) || fs::is_directory(path))
    return;

  Asset a;
  a.path = path;
  a.id = makeId(path);
  a.type = fs::path(path).extension().string();
  a.size = fs::file_size(path);

  auto ftime = fs::last_write_time(path);
  a.modified =
      std::chrono::duration_cast<std::chrono::seconds>(ftime.time_since_epoch())
          .count();

  m_assets[a.id] = a;

  LOG_INFO("Indexed asset: {}", path);
}

void AssetIndex::remove(const std::string &path) {
  std::lock_guard lock(m_mutex);

  auto id = makeId(path);
  auto it = m_assets.find(id);
  if (it != m_assets.end()) {
    LOG_INFO("Removed asset: {}", path);
    m_assets.erase(it);
  }
}

std::vector<Asset> AssetIndex::ListAssets() const {
  std::lock_guard lock(m_mutex);
  std::vector<Asset> out;
  out.reserve(m_assets.size());
  for (auto &[_, a] : m_assets)
    out.push_back(a);

  return out;
}
