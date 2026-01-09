# Pipeline-Lab – Agent API (Phase 0)

This document defines the **stable contract** between the Local DAM Agent (C++) and all clients (Web UI, Desktop UI).

This API is **authoritative**. UI and plugins must adapt to it.

---

## Core Principles

* The **filesystem is the source of truth**
* The agent owns all filesystem access
* UIs NEVER touch the filesystem directly
* All changes flow through the agent
* Events are pushed, not polled

---

## Terminology

* **Workspace**: A user-selected root folder containing assets
* **Asset**: A file inside a workspace tracked by the agent
* **Agent**: Local native service that watches and indexes assets
* **Client**: Web UI or Desktop UI

---

## Identity Model

### Workspace

```json
{
  "id": "uuid",
  "rootPath": "/absolute/path/to/assets",
  "createdAt": "iso8601"
}
```

### Asset

Assets are identified by a **stable ID**, not paths.

```json
{
  "id": "asset_uuid",
  "workspaceId": "uuid",
  "path": "textures/brick.png",
  "absolutePath": "/assets/textures/brick.png",
  "size": 123456,
  "hash": "sha256",
  "type": "image",
  "modifiedAt": "iso8601",
  "createdAt": "iso8601"
}
```

* `path` is always relative to workspace root
* `id` remains stable across renames

---

## HTTP API

### GET /status

Returns agent status.

```json
{
  "running": true,
  "version": "0.1.0",
  "uptime": 12345
}
```

---

### POST /workspace/open

Opens or switches the active workspace.

```json
{
  "path": "/absolute/path/to/assets"
}
```

Response:

```json
{
  "workspaceId": "uuid"
}
```

---

### GET /workspace

Returns current workspace.

```json
{
  "id": "uuid",
  "rootPath": "/absolute/path"
}
```

---

### GET /assets

Returns all indexed assets.

```json
[
  {
    "id": "asset_uuid",
    "path": "textures/brick.png",
    "type": "image",
    "size": 123456
  }
]
```

---

### GET /assets/{id}

Returns full asset metadata.

---

### POST /assets/{id}/rename

```json
{
  "newPath": "textures/brick_wall.png"
}
```

---

### DELETE /assets/{id}

Deletes the asset from disk.

---

### GET /previews/{id}

Returns preview binary or URL.

---

## WebSocket API

### Connection

```
ws://localhost:{port}/ws
```

---

### Event Envelope

```json
{
  "type": "event.type",
  "payload": {}
}
```

---

### Events

#### workspace.opened

```json
{
  "workspaceId": "uuid"
}
```

---

#### asset.added

```json
{
  "asset": { "id": "uuid", "path": "..." }
}
```

---

#### asset.modified

```json
{
  "assetId": "uuid"
}
```

---

#### asset.removed

```json
{
  "assetId": "uuid"
}
```

---

## Error Format

```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset does not exist"
  }
}
```

---

## Security (Phase 0)

* Agent binds to `127.0.0.1`
* Token-based auth (added Phase 1)
* No raw path access exposed

---

## Stability Promise

* Asset IDs are stable
* Events are additive
* Breaking changes require major version bump

---

**This document is the contract.**
UI, agent, and plugins must conform to it.
