# Live Switcher Dashboard

A lightweight real-time switcher control demo with a React frontend and a Node.js WebSocket server.

## What It Does

- Shows current `Program` and `Preview` inputs
- Supports `PVW`, `CUT`, `TAKE`, and `AUTO` actions
- Streams live audio meter values
- Syncs state across connected clients via WebSocket

## Tech Stack

- React + TypeScript (client)
- Vite
- Node.js
- `ws` (WebSocket server library)

## Project Structure

```text
live-switcher-dashboard/
├─ client/   # React + Vite UI
└─ server/   # WebSocket server
```

## Local Development

1. Start the WebSocket server:
```bash
cd server
npm install
npm start
```

2. Start the frontend:
```bash
cd client
npm install
npm run dev
```

3. Open:
`http://localhost:5173`

Server default WebSocket endpoint:
`ws://localhost:3001`
