#include "http/HttpServer.h"
#include "assets/AssetIndex.h"

#include <httplib.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

struct HttpServer::Impl {
  httplib::Server server;
};

HttpServer::HttpServer(AssetIndex &assets, EventStream& events)
  : m_assets(assets),m_events(events), m_impl(CreateScope<Impl>()) {}

HttpServer::~HttpServer() { Stop(); }

bool HttpServer::Start(int port) {
  auto &svr = m_impl->server;

  svr.Get("/assets", [this](const httplib::Request &, httplib::Response &res) {
    auto assets = m_assets.ListAssets();
    json j = json::array();
    for(auto& a : assets){
      j.push_back({
          {"id", a.id},
          {"path", a.path},
          {"type", a.type},
          {"size", a.size},
	  {"modified", a.modified}
	});
    }
    res.set_content(j.dump(2), "application/json");
  });

  svr.Get(R"(/assets/(.+))",
          [this](const httplib::Request &req, httplib::Response &res) {
            Asset a;
	    if(!m_assets.GetAsset(req.matches[1], a)){
              res.status = 404;
	      return;
            }

            json j = {{"id", a.id},
                      {"path", a.id},
                      {"type", a.type},
                      {"size", a.size},
                      {"modified", a.modified}};

	    res.set_content(j.dump(2), "application/json");
          });

  svr.Get("/events", [this](const httplib::Request&, httplib::Response& res) {
    res.set_header("Cache-Control", "no-cache");
    res.set_header("Connection", "keep-alive");

    auto sinkPtr = Ref<httplib::DataSink *>();

    res.set_chunked_content_provider(
        "text/event-stream",
        [this, sinkPtr](size_t, httplib::DataSink &sink) {
          *sinkPtr = &sink;

          m_events.Subscribe([sinkPtr](const FileEvent &e) {
            if (!*sinkPtr)
              return;
            
            json j = {{"type", static_cast<int>(e.type)},
                      {"path", e.path},
                      {"oldPath", e.oldPath}};

            std::string msg = "data: " + j.dump() + "\n\n";
            (*sinkPtr)->write(msg.data(), msg.size());
          });

          return true;
        },
        [this, sinkPtr](bool) {
          *sinkPtr = nullptr;
	}
        );    
    
  });

  m_thread = std::thread([this, port]() {
    LOG_INFO("HTTP server listening on localhost:{}", port);
    m_impl->server.listen("127.0.0.1", port);
  });

  return true;
}

void HttpServer::Stop(){
  if (m_impl)
    m_impl->server.stop();

  if (m_thread.joinable())
    m_thread.join();
}
