# Ver o Tempo — UI-Only Handoff (New Timeline Layout)

**Scope:** This branch updates only the **user-facing UI** to the new layout (as shown in the Canvas prototype). **No server/API/Admin work** is included here so it’s safe to demo from the original repo. Keep current data-loading behavior (whatever the app currently uses).

---

## Goals (UI-only)

1. **Header at top:** `Rotina da Nina ✨` + **Manhã/Noite** toggle.
2. **Timeline first (full-width, taller):**
   - Legend **above** the timeline.
   - **Icon centered over text** in each block; **labels wrap** (no ellipsis).
   - **Horário limite** control (optional deadline mode): user sets an end time for the routine; the “now marker” moves so the routine ends at that time.
   - **Click** a block to jump to that task.
3. **Agora** card centered under the timeline:
   - Progress bar **height fixed**.
   - Progress bar **width scales** with task duration (clamped **5→20 min = 1×→4×**).
4. Hide the **“A seguir”** card for now.
5. Full-screen/TV friendly, responsive, accessible.

---

## Branching

- Create a branch in the original repo:  
  `git checkout -b feature/new-ui-timeline`
- Keep all changes isolated to **app/** (no server files).

---

## Acceptance Criteria

- Header shows **Rotina da Nina ✨** and a working **Manhã/Noite** toggle.
- Timeline is the **top section**, **full width** (stretches on large screens), **height ~2×** current blocks.
- Legend appears **above** the timeline.
- Timeline blocks: icon **centered**, text wraps to multiple lines (e.g., “Lavar” / “as mãos”). No ellipses.
- **Now marker** shows progress; clicking any block **jumps** to that task.
- **Horário limite** input: when enabled, the app computes the current position so the routine **ends at that time**.
- The **Agora** (current task) card is centered below the timeline and its progress bar has **fixed height** and **width scaled by minutes** (5→1×, 20→4×), with clamping.
- “A seguir” is hidden.
- Page behaves well on mobile/desktop/TV (large hit targets, visible focus).

---

## Implementation Plan

### 1) File structure (UI only)
Create/extract the following (names can vary; keep all inside **app/src/**):
```
components/
  Header.tsx
  Timeline.tsx
  AgoraCard.tsx
lib/
  time.ts               // time math helpers
  timeline.ts           // locateTask, computeElapsed helpers
hooks/
  useRoutineState.ts    // isPlaying, mode (start|deadline), startTime, deadline, etc.
pages/
  Home.tsx              // compose the screen with sections in the right order
```

> Keep existing data-loading as is. If the app currently imports a JSON, continue to do so in this branch.

### 2) Header (top of page)
- Title: **Rotina da Nina ✨**
- Toggle: Manhã / Noite (switches the in-memory routine).

```tsx
export function Header({ routineId, setRoutineId }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
        Rotina da Nina ✨
      </h1>
      <div className="flex rounded-2xl bg-slate-100 p-1 shadow-inner">
        {[{id:"manha",label:"Manhã"},{id:"noite",label:"Noite"}].map(opt => (
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
  );
}
```

### 3) Timeline section (first; full width; taller)
- Place in a **full-width** section outside the max-w container (e.g., `w-full px-3 md:px-6`), so it can stretch on TVs.
- **Legend** above timeline.
- **Horário limite** control (time input + enable checkbox). When enabled, compute elapsed so the routine ends at that time.

```tsx
export function Timeline({ tasks, totalMinutes, currentIdx, totalPct, onJump, deadlineStr, setDeadlineStr, useDeadline, setUseDeadline, startTime, endsAt }) {
  return (
    <section className="w-full px-3 md:px-6 pt-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">

        {/* Legend ABOVE */}
        <div className="mb-3 flex flex-wrap gap-3 text-xs justify-center">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="inline-block size-3 rounded" style={{ backgroundColor: t.color }} />
              <span className="text-slate-600">{t.icon} {t.name}</span>
            </div>
          ))}
        </div>

        {/* Header + deadline control */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-500 text-xs uppercase tracking-wide">Linha do tempo</div>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-600">Horário limite:</label>
            <input type="time" className="rounded-lg border border-slate-300 px-2 py-1 text-slate-700" value={deadlineStr} onChange={e => setDeadlineStr(e.target.value)} />
            <label className="inline-flex items-center gap-1 text-slate-700">
              <input type="checkbox" checked={useDeadline} onChange={e => setUseDeadline(e.target.checked)} />
              Ativar
            </label>
          </div>
        </div>

        {/* Taller blocks; full-bleed width */}
        <div className="relative w-full overflow-hidden rounded-2xl">
          <div className="flex w-full">
            {tasks.map((t, i) => {
              const widthPct = (t.minutes / totalMinutes) * 100;
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={i}
                  onClick={() => onJump(i)}
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
          <div className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow [filter:drop-shadow(0_0_4px_rgba(0,0,0,0.4))]" style={{ left: `${totalPct * 100}%` }} />
        </div>

        {/* Start/End labels */}
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>Início: {/* render computed start */}</span>
          <span>Previsto: {/* render computed end */}</span>
        </div>
      </div>
    </section>
  );
}
```

### 4) Agora card (progress bar width scales by duration)
- Fixed height, width scales with clamped minutes.

```tsx
const widthScale = clamp(current.minutes / 5, 1, 4); // 5→1×, 20→4×
const barBasePx = 220; // px for 5 min
const barWidthPx = Math.round(barBasePx * widthScale);
const barHeightPx = 30; // fixed height

export function AgoraCard({ current, currentPct, endsAt, inTaskRemaining }) {
  return (
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
              Faltam <span className="font-semibold">{inTaskRemaining} min</span> desta tarefa
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="mx-auto" style={{ width: barWidthPx + "px", maxWidth: "100%" }}>
            <div className="w-full rounded-full bg-slate-100 overflow-hidden" style={{ height: `${barHeightPx}px` }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${currentPct * 100}%`, backgroundColor: current.color }} />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Rotina termina: {/* {hhmm(endsAt)} */}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### 5) Time & timeline helpers
Implement pure helpers and unit tests (edge cases: midnight/DST). Prefer **minute arithmetic**:
```ts
// lib/timeline.ts
export function locateTask(elapsedMinutes: number, tasks: {minutes: number}[]) {
  let acc = 0;
  const total = tasks.reduce((s,t) => s + t.minutes, 0);
  const clamp = Math.min(Math.max(0, elapsedMinutes), total);
  for (let i = 0; i < tasks.length; i++) {
    const d = tasks[i].minutes;
    if (clamp < acc + d) return { index: i, inTaskElapsed: clamp - acc, clampedElapsed: clamp, total };
    acc += d;
  }
  const last = tasks.length - 1;
  return { index: last, inTaskElapsed: tasks[last].minutes, clampedElapsed: total, total };
}

export function computeElapsed({ mode, startTime, deadline, now, totalMinutes }:{
  mode: "start" | "deadline";
  startTime: Date; deadline: Date; now: Date; totalMinutes: number;
}) {
  if (mode === "deadline") {
    // If deadline < now, treat as tomorrow
    const dl = new Date(deadline);
    if (dl < now) dl.setDate(dl.getDate() + 1);
    const remaining = Math.max(0, Math.min(totalMinutes, (dl.getTime() - now.getTime()) / 60000));
    return { elapsed: totalMinutes - remaining, endsAt: dl };
  } else {
    const elapsed = Math.max(0, (now.getTime() - startTime.getTime()) / 60000);
    const endsAt = new Date(startTime.getTime() + totalMinutes * 60000);
    return { elapsed, endsAt };
  }
}
```

### 6) Accessibility & TV
- Add `tabIndex`, keyboard handlers (Left/Right = move, Enter = select).
- Strong focus style (`focus-visible:ring-4 ring-offset-2`).
- Large hit targets (`min-h` on blocks, generous padding).
- Avoid `position: fixed` UI that could be hard to reach with remotes.

---

## Manual QA Checklist

- [ ] Desktop, mobile, and TV widths (timeline stretches fully; text wraps nicely).
- [ ] Deadline earlier/later than now → marker adjusts and routine ends at selected time.
- [ ] Click-to-jump moves to the correct task in both modes.
- [ ] Agora bar width scales correctly for 5, 10, 15, 20+ minutes (clamped).
- [ ] Names like “Lavar as mãos” wrap to two lines gracefully.
- [ ] Focus ring and keyboard control work on timeline blocks.

---

## Rollback

If anything looks off in demo, `git checkout main` or revert the branch. This UI-only branch doesn’t change storage or APIs, so rollback is instant.

---

## Notes

- Keep color tokens consistent; avoid near-duplicate hues for adjacent tasks.
- If you need a distinctive color for **Fazer cocô**, use **#8B5E3C** (cocoa brown) for good contrast.
