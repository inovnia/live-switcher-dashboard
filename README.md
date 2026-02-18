# live-switcher-dashboard
# Live Switcher Control Panel (React + TS + WebSockets)

Real-time web UI inspired by production switcher control panels.  
Focus: low-latency updates, typed messages, resilient WebSocket connection.

## Features
- WebSocket real-time updates (program/preview, tallies, meters)
- Connection status + auto-reconnect
- Typed message model (TypeScript interfaces + runtime guards)
- Event log and replay
- Performance: throttled meter updates, memoized UI components

## Tech Stack
- React, TypeScript
- WebSocket (ws)
- Vite
- (Optional) Redux Toolkit / Zustand

## Architecture (high level)
- `server/` simulates a switcher sending state updates every X ms
- `client/` subscribes via WebSocket and renders a control-panel UI
- Messages follow a typed schema to prevent runtime surprises

## Getting Started
```bash
git clone ...
cd server && npm i && npm run dev
cd ../client && npm i && npm run dev
