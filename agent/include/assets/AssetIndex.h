#pragma once

#include "Asset.h"
#include "fs/FileEvent.h"

#include <unordered_map>
#include <mutex>
#include <vector>

class AssetIndex {
public:
  void OnFileEvent(const FileEvent &e);
  void InitialScan(const std::string& root);
  std::vector<Asset> ListAssets() const;
  bool GetAsset(const std::string &id, Asset &out) const;

private:
  void addOrUpdate(const std::string &path);
  void remove(const std::string &path);

private:
  mutable std::mutex m_mutex;
  std::unordered_map<std::string, Asset> m_assets; // id -> Asset
  
};
