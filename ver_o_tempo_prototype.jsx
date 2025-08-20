import React, { useEffect, useMemo, useState } from "react";

// Ver o Tempo — Latest Prototype
// UI highlights:
// • Header at top: "Rotina da Nina ✨" + Manhã/Noite toggle
// • Timeline on top, full-width, taller blocks; legend above
// • Deadline (Horário limite) mode aligns "now" so routine ends at chosen time
// • Click block to jump
// • Agora card centered; progress bar height fixed, width scales with task duration (5→20min = 1×→4×)
// • TV-friendly: big touch targets; labels wrap and icons centered

export default function VerOTempoPrototype() {
  const ROUTINES = useMemo(
    () => ({
      manha: {
        id: "manha",
        label: "Manhã",
        startDefault: "07:30",
        tasks: [
          { name: "Acordar", icon: "🌞", color: "#06b6d4", minutes: 10 },
          { name: "Café da manhã", icon: "☕️", color: "#f97316", minutes: 20 },
          { name: "Lavar as mãos", icon: "🧼", color: "#34d399", minutes: 5 },
          { name: "Escovar os dentes", icon: "🪥", color: "#a855f7", minutes: 5 },
          { name: "Trocar de roupa", icon: "👕", color: "#22c55e", minutes: 10 },
          { name: "Arrumar mochila", icon: "🎒", color: "#0ea5e9", minutes: 5 },
          { name: "Xixi tático", icon: "🚽", color: "#f472b6", minutes: 5 },
          { name: "Tênis e sair", icon: "👟", color: "#ef4444", minutes: 5 },
        ],
      },
      noite: {
        id: "noite",
        label: "Noite",
        startDefault: "21:00",
        tasks: [
          { name: "Banho", icon: "🛁", color: "#38bdf8", minutes: 15 },
          { name: "Jantar", icon: "🍽️", color: "#fb923c", minutes: 20 },
          { name: "Fazer cocô", icon: "💩", color: "#8B5E3C", minutes: 7 }, // cocoa brown
          { name: "Lavar as mãos", icon: "🧼", color: "#34d399", minutes: 5 },
          { name: "Escovar os dentes", icon: "🪥", color: "#a78bfa", minutes: 5 },
          { name: "Xixi tático", icon: "🚽", color: "#f472b6", minutes: 5 },
          { name: "Dormir", icon: "😴", color: "#60a5fa", minutes: 5 },
        ],
      },
    }),
    []
  );

  const [routineId, setRoutineId] = useState("manha");
  const routine = ROUTINES[routineId];

  const totalMinutes = useMemo(
    () => routine.tasks.reduce((s, t) => s + t.minutes, 0),
    [routine.tasks]
  );

  // Clock
  const [isPlaying, setIsPlaying] = useState(true);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Start mode + Deadline mode
  const [startTime, setStartTime] = useState(() => toToday(routine.startDefault));
  const [useDeadline, setUseDeadline] = useState(false);
  const [deadlineStr, setDeadlineStr] = useState(() => hhmm(addMinutes(toToday(routine.startDefault), totalMinutes)));

  useEffect(() => {
    setStartTime(toToday(routine.startDefault));
    setUseDeadline(false);
    setDeadlineStr(hhmm(addMinutes(toToday(routine.startDefault), totalMinutes)));
    setIsPlaying(true);
    setNow(new Date());
  }, [routineId, routine.startDefault, totalMinutes]);

  // Compute elapsed/endsAt
  const { elapsed, endsAt } = useMemo(() => {
    if (useDeadline) {
      const dl = toToday(deadlineStr);
      const dlAdj = dl < now ? addDays(dl, 1) : dl; // tomorrow if deadline earlier than now
      const remaining = clampNum((dlAdj.getTime() - now.getTime()) / 60000, 0, totalMinutes);
      return { elapsed: totalMinutes - remaining, endsAt: dlAdj };
    } else {
      const e = Math.max(0, (now.getTime() - startTime.getTime()) / 60000);
      return { elapsed: e, endsAt: addMinutes(startTime, totalMinutes) };
    }
  }, [useDeadline, deadlineStr, now, totalMinutes, startTime]);

  const { index: currentIdx, inTaskElapsed, clampedElapsed } = useMemo(() => locateTask(elapsed, routine.tasks), [elapsed, routine.tasks]);

  const current = routine.tasks[currentIdx];
  const currentPct = Math.min(1, inTaskElapsed / current.minutes);
  const totalPct = Math.min(1, clampedElapsed / totalMinutes);

  function jumpToTask(i) {
    const minsBefore = routine.tasks.slice(0, i).reduce((s, t) => s + t.minutes, 0);
    if (useDeadline) {
      const dl = new Date(now.getTime() + (totalMinutes - minsBefore) * 60000);
      setDeadlineStr(hhmm(dl));
    } else {
      const t = new Date();
      setStartTime(new Date(t.getTime() - minsBefore * 60000));
    }
    setIsPlaying(true);
  }

  // Agora bar size: fixed height, width scales 1×..4× (5..20 min clamp)
  const widthScale = clampNum(current.minutes / 5, 1, 4);
  const barBasePx = 220; // width for a 5-min task
  const barWidthPx = Math.round(barBasePx * widthScale);
  const barHeightPx = 30; // fixed height

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 text-slate-800">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Rotina da Nina ✨</h1>
          <div className="flex rounded-2xl bg-slate-100 p-1 shadow-inner">
            {[
              { id: "manha", label: "Manhã" },
              { id: "noite", label: "Noite" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRoutineId(opt.id)}
                className={
                  "px-4 py-2 text-sm md:text-base rounded-2xl transition " +
                  (routineId === opt.id ? "bg-white shadow font-semibold" : "text-slate-600 hover:text-slate-800")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* Timeline TOP — full width */}
      <section className="w-full px-3 md:px-6 pt-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          {/* Legend ABOVE */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs justify-center">
            {routine.tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="inline-block size-3 rounded" style={{ backgroundColor: t.color }} />
                <span className="text-slate-600">{t.icon} {t.name}</span>
              </div>
            ))}
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-slate-500 text-xs uppercase tracking-wide">Linha do tempo</div>
            {/* Deadline controls */}
            <div className="flex items-center gap-2 text-xs">
              <label className="text-slate-600">Horário limite:</label>
              <input
                type="time"
                className="rounded-lg border border-slate-300 px-2 py-1 text-slate-700"
                value={deadlineStr}
                onChange={(e) => setDeadlineStr(e.target.value)}
              />
              <label className="inline-flex items-center gap-1 text-slate-700">
                <input type="checkbox" checked={useDeadline} onChange={(e) => setUseDeadline(e.target.checked)} />
                Ativar
              </label>
          </div>
          </div>

          {/* Proportional bar — taller, click-to-jump */}
          <div className="relative w-full overflow-hidden rounded-2xl">
            <div className="flex w-full">
              {routine.tasks.map((t, i) => {
                const widthPct = (t.minutes / totalMinutes) * 100;
                const isCurrent = i === currentIdx;
                return (
                  <button
                    key={i}
                    onClick={() => jumpToTask(i)}
                    className="relative flex-none h-40 md:h-48 focus:outline-none transition active:scale-[0.99]"
                    style={{ width: `${widthPct}%`, backgroundColor: t.color }}
                    title={`${t.name} — ${t.minutes} min`}
                    aria-label={`Pular para ${t.name}`}
                  >
                    <div className="absolute inset-0 p-2 md:p-4">
                      <div className="flex h-full w-full flex-col items-center justify-center text-white/95 drop-shadow-sm text-center">
                        <div className="text-2xl md:text-3xl leading-none">{t.icon}</div>
                        <div className="w-full">
                          <div className="text-[11px] md:text-sm font-semibold leading-tight whitespace-normal break-words">{t.name}</div>
                          <div className="text-[10px] md:text-xs opacity-90">{t.minutes} min</div>
                        </div>
                      </div>
                    </div>
                    {isCurrent && <div className="absolute inset-0 ring-4 ring-white/70 pointer-events-none" />}
                  </button>
                );
              })}
            </div>
            {/* Now marker */}
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow [filter:drop-shadow(0_0_4px_rgba(0,0,0,0.4))]"
              style={{ left: `${totalPct * 100}%` }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Início: {useDeadline ? hhmm(addMinutes(endsAt, -totalMinutes)) : hhmm(startTime)}</span>
            <span>Previsto: {hhmm(endsAt)}</span>
          </div>
        </div>
      </section>

      {/* Agora card — centered */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <section className="mt-2">
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="size-16 md:size-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl" style={{ backgroundColor: current.color + "22" }}>
                <span>{current.icon}</span>
              </div>
              <div className="min-w-0">
                <div className="text-slate-500 text-xs uppercase tracking-wide">Agora</div>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight">{current.name}</h2>
                <div className="mt-1 text-sm text-slate-600">
                  Faltam <span className="font-semibold">{Math.max(0, Math.round(current.minutes - inTaskElapsed))} min</span> desta tarefa
                </div>
              </div>
            </div>

            {/* Scaled-WIDTH progress bar (fixed height) */}
            <div className="mt-4">
              <div className="mx-auto" style={{ width: barWidthPx + "px", maxWidth: "100%" }}>
                <div className="w-full rounded-full bg-slate-100 overflow-hidden" style={{ height: `${barHeightPx}px` }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${currentPct * 100}%`, backgroundColor: current.color }} />
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Agora: {hhmm(now)}</span>
                <span>Rotina termina: {hhmm(endsAt)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => setIsPlaying((p) => !p)} className="rounded-full px-4 py-2 text-sm font-semibold shadow bg-slate-900 text-white hover:bg-slate-800">
                {isPlaying ? "Pausar" : "Retomar"}
              </button>
              <button onClick={() => { setStartTime(new Date()); setUseDeadline(false); setIsPlaying(true); }} className="rounded-full px-4 py-2 text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50">
                Começar agora
              </button>
              <button onClick={() => { setStartTime(toToday(routine.startDefault)); setUseDeadline(false); setIsPlaying(true); }} className="rounded-full px-4 py-2 text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50">
                Começar às {routine.startDefault}
              </button>
              <div className="ml-auto text-sm text-slate-600">
                Progresso total: <span className="font-semibold">{(totalPct * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </section>

        {/* TV tip small at the bottom */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-amber-50 p-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <span>📺</span>
            <p>Use tela cheia. Toque na linha do tempo para pular para uma tarefa. Ative o "Horário limite" para sincronizar o término.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ---- helpers ----
function toToday(hhmmStr) {
  const [h, m] = hhmmStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}
function addMinutes(date, m) { return new Date(date.getTime() + m * 60000); }
function addDays(date, n) { return new Date(date.getTime() + n * 86400000); }
function hhmm(d) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }); }
function clampNum(x, a, b) { return Math.max(a, Math.min(b, x)); }
function locateTask(elapsedMinutes, tasks) {
  const total = tasks.reduce((s, t) => s + t.minutes, 0);
  const clamp = clampNum(elapsedMinutes, 0, total);
  let acc = 0;
  for (let i = 0; i < tasks.length; i++) {
    const d = tasks[i].minutes;
    if (clamp < acc + d) return { index: i, inTaskElapsed: clamp - acc, clampedElapsed: clamp };
    acc += d;
  }
  const last = tasks.length - 1;
  return { index: last, inTaskElapsed: tasks[last].minutes, clampedElapsed: total };
}
