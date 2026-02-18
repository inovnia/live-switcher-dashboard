import { useEffect, useMemo, useRef, useState } from "react";

type ServerMsg =
  | { type: "state"; program: number; preview: number; ts: number; meters?: number[]; transitioning?: boolean }
  | { type: "meters"; meters: number[]; ts: number }
  | { type: "connected"; message: string }
  | { type: "error"; message: string; ts: number };

export default function App() {
  const [program, setProgram] = useState<number>(1);
  const [preview, setPreview] = useState<number>(2);
  const [meters, setMeters] = useState<number[]>([0, 0, 0, 0]);
  const [status, setStatus] = useState<string>("disconnected");
  const [transitioning, setTransitioning] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");
    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("error");

    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data) as ServerMsg;

      if (msg.type === "state") {
        setProgram(msg.program);
        setPreview(msg.preview);
        setTransitioning(Boolean(msg.transitioning));
        if (msg.meters) setMeters(msg.meters);
      }

      if (msg.type === "meters") {
        setMeters(msg.meters);
      }

      if (msg.type === "error") {
        console.error(msg.message);
      }
    };

    return () => ws.close();
  }, []);

  const inputs = useMemo(() => Array.from({ length: 8 }, (_, i) => i + 1), []);

  function send(payload: object) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }

  function cutTo(input: number) {
    send({ type: "cut", input });
  }

  function setPreviewInput(input: number) {
    send({ type: "preview", input });
  }

  function take() {
    send({ type: "take" });
  }

  function autoTake() {
    send({ type: "auto", durationMs: 700 });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h2>Live Switcher Control Panel</h2>
      <p>Status: <b>{status}</b></p>

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          Program: <b>{program}</b>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          Preview: <b>{preview}</b>
        </div>
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          Transition: <b>{transitioning ? "AUTO..." : "idle"}</b>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button
          onClick={take}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          TAKE
        </button>
        <button
          onClick={autoTake}
          disabled={transitioning}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ccc",
            fontWeight: 700,
            cursor: transitioning ? "not-allowed" : "pointer",
            opacity: transitioning ? 0.6 : 1,
          }}
        >
          AUTO
        </button>
      </div>

      <h3>Inputs</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {inputs.map((n) => {
          const isPgm = n === program;
          const isPrv = n === preview;

          return (
            <div
              key={n}
              style={{
                padding: "10px",
                borderRadius: 12,
                border: "1px solid #ccc",
                fontWeight: 700,
                background: isPgm ? "#ffd6d6" : isPrv ? "#d6ffe0" : "#fff",
              }}
            >
              <div style={{ marginBottom: 8 }}>
                IN {n} {isPgm ? "(PGM)" : isPrv ? "(PVW)" : ""}
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                <button
                  onClick={() => setPreviewInput(n)}
                  style={{
                    border: "1px solid #bbb",
                    borderRadius: 8,
                    padding: "6px 8px",
                    background: isPrv ? "#bff3cd" : "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  PVW
                </button>
                <button
                  onClick={() => cutTo(n)}
                  style={{
                    border: "1px solid #bbb",
                    borderRadius: 8,
                    padding: "6px 8px",
                    background: isPgm ? "#ffc9c9" : "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  CUT
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={{ marginTop: 18 }}>Audio meters</h3>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 140 }}>
        {meters.map((v, i) => (
          <div key={i} style={{ width: 40, border: "1px solid #ccc", borderRadius: 10, padding: 6 }}>
            <div
              style={{
                height: `${Math.round(v * 100)}%`,
                background: "#ddd",
                borderRadius: 8,
                transition: "height 80ms linear",
              }}
            />
            <div style={{ textAlign: "center", marginTop: 6, fontSize: 12 }}>
              CH {i + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
