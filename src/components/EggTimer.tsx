import { useEffect, useRef, useState } from "react";

export const MAX_MINUTES = 30;
export const clampMinutes = (m: number) => Math.max(0, Math.min(MAX_MINUTES, Math.round(m)));

export function EggTimer() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("Stå upp");
  const [minutes, setMinutes] = useState(5);
  const [left, setLeft] = useState(0);
  const [done, setDone] = useState(false);
  const dial = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => {
      setLeft(left - 1);
      if (left === 1) setDone(true);
    }, 1000);
    return () => clearTimeout(t);
  }, [left]);

  const fromPointer = (e: React.PointerEvent) => {
    const r = dial.current!.getBoundingClientRect();
    const a = Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2)));
    const deg = ((a * 180) / Math.PI + 360) % 360;
    setMinutes(clampMinutes((deg / 360) * MAX_MINUTES) || 1);
  };

  const running = left > 0;
  const shownMin = running ? left / 60 : minutes;
  const angle = (shownMin / MAX_MINUTES) * 360;
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col items-end gap-2">
      {open && (
        <div className="w-60 space-y-3 rounded-xl bg-card p-4 shadow-xl">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Påminnelse, t.ex. Stå upp"
            className="w-full rounded-md bg-secondary px-3 py-2 text-sm outline-none"
          />
          <div className="text-center text-xs text-muted-foreground">Vrid klockan (max {MAX_MINUTES} min)</div>
          <div
            ref={dial}
            onPointerDown={(e) => { if (running) return; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
            onPointerMove={(e) => dragging.current && fromPointer(e)}
            onPointerUp={() => (dragging.current = false)}
            className="relative mx-auto h-36 w-36 cursor-grab touch-none select-none rounded-full shadow-inner"
            style={{ background: `conic-gradient(var(--c1) ${angle}deg, var(--secondary) ${angle}deg)` }}
          >
            <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-card">
              <div className="text-2xl font-bold">{running ? `${mm}:${ss}` : `${minutes} min`}</div>
              <div className="max-w-[6rem] truncate text-xs text-muted-foreground">{text}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setDone(false); setLeft(minutes * 60); }} disabled={running} className="flex-1 rounded-full bg-primary py-1 text-sm text-primary-foreground disabled:opacity-40">Starta</button>
            <button onClick={() => { setLeft(0); setDone(false); }} className="flex-1 rounded-full border border-primary py-1 text-sm">Stoppa</button>
          </div>
        </div>
      )}
      {done && <div className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground shadow-xl">⏰ {text || "Tiden är ute!"}</div>}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Äggklocka"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-xs font-bold shadow-xl"
        style={{ background: `conic-gradient(var(--c1) ${angle}deg, var(--card) ${angle}deg)` }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card">{running ? `${mm}:${ss}` : "⏱"}</span>
      </button>
    </div>
  );
}
