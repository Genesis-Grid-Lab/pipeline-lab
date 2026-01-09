# Pipeline-Lab – System Architecture

This document describes the **high-level architecture** of Pipeline-Lab, covering the **Local Agent**, **UI clients**, and their interaction.

This architecture is designed to be:

* Local-first
* Extensible
* Engine-agnostic
* Stable over long-term evolution

---

## 1. High-Level Overview

Pipeline-Lab is composed of three major parts:

```
┌──────────────────────────┐
│        UI Clients        │
│  (Web / Desktop / CLI)   │
└────────────┬─────────────┘
             │ HTTP / WS
┌────────────▼─────────────┐
│ Local Pipeline-Lab Agent │  ← C++ native service
└────────────┬─────────────┘
             │ Native FS
┌────────────▼─────────────┐
│   User Asset Workspace   │
│   + .dam metadata cache  │
└──────────────────────────┘
```

The **Local Pipeline-Lab Agent** is the authoritative component. All filesystem access and asset logic flows through it.

---

## 2. Design Principles

### 2.1 Filesystem as Source of Truth

* Assets are regular files on disk
* The agent never "imports" assets
* External changes are detected and reconciled
* Deleting `.pipe/` fully resets the index

### 2.2 Agent Authority

* UI clients never access the filesystem directly
* All mutations go through the agent
* The agent validates, executes, and broadcasts changes

### 2.3 Event-Driven System

* Changes are pushed via WebSockets
* No polling loops
* UI state is derived from events + queries

### 2.4 Replaceable UI

* UI is stateless with respect to the filesystem
* Multiple clients may connect simultaneously
* UI can be rewritten without touching agent logic

---

## 3. Component Breakdown

### 3.1 Local Pipeline-Lab Agent (C++)

The agent is a **long-running native service** responsible for all core functionality.

Responsibilities:

* Workspace ownership
* Folder watching
* Asset indexing
* Metadata storage
* Preview generation
* Plugin loading
* API exposure

The agent can run:

* Standalone (development)
* Bundled with desktop app
* As a background service

---

### 3.2 UI Clients (React)

UI clients are thin presentation layers.

Responsibilities:

* Rendering asset views
* User interaction
* Sending commands to agent
* Reacting to real-time events

UI clients do **not**:

* Access filesystem
* Cache asset truth
* Generate previews

---

## 4. Agent Internal Architecture

```
Agent Process
│
├─ Core
│  ├─ Config
│  ├─ Logging
│  └─ Lifecycle
│
├─ API Layer
│  ├─ HTTP Server
│  ├─ WebSocket Server
│  └─ Auth / Tokens
│
├─ Event Bus
│
├─ Workspace Manager
│
├─ File Watcher
│
├─ Asset Indexer
│
├─ Preview System
│
├─ Plugin Manager
│
└─ Storage (SQLite)
```

Each subsystem communicates via an **internal event bus**, not direct coupling.

---

## 5. Threading Model

The agent uses a **multi-threaded, message-driven** model.

Recommended threads:

* Main thread (startup/shutdown)
* API thread(s)
* File watcher thread
* Indexer worker pool
* Preview worker pool

Rules:

* Filesystem operations are serialized per asset
* Database access is synchronized
* Events are immutable

---

## 6. Workspace Lifecycle

### 6.1 Open Workspace

1. UI requests `/workspace/open`
2. Agent validates path
3. `.pipe/` directory initialized
4. Initial scan performed
5. File watcher starts
6. `workspace.opened` event emitted

### 6.2 Runtime Operation

* External file change → watcher event
* Indexer reconciles state
* DB updated
* Preview invalidated if needed
* Event broadcast to clients

---

## 7. Asset Lifecycle

### Creation

* Detected via watcher OR created via agent
* Asset ID assigned
* Metadata stored

### Modification

* Hash recalculated
* Metadata updated
* Preview regenerated

### Deletion

* Asset removed from DB
* Preview cache cleared
* Event broadcast

Asset IDs remain stable across renames.

---

## 8. Preview Architecture

* Previews are **derived data**
* Stored in `.pipe/previews/`
* Generated asynchronously
* UI requests previews by asset ID

Failure to generate a preview does NOT block asset availability.

---

## 9. Plugin Architecture (Phase 1+)

Plugins extend the agent.

Initial design:

* Native dynamic libraries
* Stable C ABI
* Versioned interface

Plugins can:

* Register file formats
* Extract metadata
* Generate previews
* Add asset actions

Plugins never access UI directly.

---

## 10. Desktop vs Web

### Desktop

* Agent bundled with app
* UI connects via localhost
* Agent auto-started

### Web

* UI hosted remotely
* Connects to local agent
* Requires explicit pairing

Both use the **same API**.

---

## 11. Security Model (High-Level)

* Agent binds to `127.0.0.1`
* Token-based authentication
* Capability-based operations
* No raw filesystem paths exposed

Detailed rules are defined in `SECURITY.md`.

---

## 12. Evolution Strategy

* API-first changes
* Backward compatibility
* Versioned plugins
* Clear migration paths

This architecture is designed to scale from **solo developer** to **team-based workflows** without rewrites.

---

**This document defines how the system is built.**
Implementation must follow these constraints.
