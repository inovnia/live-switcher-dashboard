const { WebSocketServer } = require("ws");

const port = Number(process.env.PORT) || 3001;
const wss = new WebSocketServer({ port });
const INPUT_MIN = 1;
const INPUT_MAX = 8;

const state = {
  program: 1,
  preview: 2,
  meters: [0, 0, 0, 0],
  transitioning: false,
};

function isValidInput(value) {
  return Number.isInteger(value) && value >= INPUT_MIN && value <= INPUT_MAX;
}

function send(socket, payload) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function broadcast(payload) {
  for (const client of wss.clients) {
    send(client, payload);
  }
}

function broadcastState() {
  broadcast({
    type: "state",
    program: state.program,
    preview: state.preview,
    meters: state.meters,
    transitioning: state.transitioning,
    ts: Date.now(),
  });
}

function pushError(socket, message) {
  send(socket, { type: "error", message, ts: Date.now() });
}

function handleCommand(socket, msg) {
  if (msg.type === "preview") {
    if (!isValidInput(msg.input)) return pushError(socket, "Invalid preview input");
    state.preview = msg.input;
    broadcastState();
    return;
  }

  if (msg.type === "cut") {
    if (!isValidInput(msg.input)) return pushError(socket, "Invalid cut input");
    state.program = msg.input;
    broadcastState();
    return;
  }

  if (msg.type === "take") {
    const previousProgram = state.program;
    state.program = state.preview;
    state.preview = previousProgram;
    broadcastState();
    return;
  }

  if (msg.type === "auto") {
    if (state.transitioning) return;
    const durationMs = Number.isInteger(msg.durationMs)
      ? Math.max(100, Math.min(msg.durationMs, 5000))
      : 700;

    state.transitioning = true;
    broadcastState();

    setTimeout(() => {
      const previousProgram = state.program;
      state.program = state.preview;
      state.preview = previousProgram;
      state.transitioning = false;
      broadcastState();
    }, durationMs);
    return;
  }

  pushError(socket, `Unknown command: ${String(msg.type)}`);
}

setInterval(() => {
  state.meters = state.meters.map(() => Number(Math.random().toFixed(2)));
  broadcast({ type: "meters", meters: state.meters, ts: Date.now() });
}, 120);

wss.on("connection", (socket) => {
  socket.send(JSON.stringify({ type: "connected", message: "WebSocket ready" }));
  send(socket, {
    type: "state",
    program: state.program,
    preview: state.preview,
    meters: state.meters,
    transitioning: state.transitioning,
    ts: Date.now(),
  });

  socket.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      handleCommand(socket, msg);
    } catch {
      pushError(socket, "Invalid JSON message");
    }
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
