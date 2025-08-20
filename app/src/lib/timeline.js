// Pure helpers for time/timeline math (minutes-based)

export function sumMinutes(tasks) {
  return tasks.reduce((s, t) => s + (t.minutes ?? t.duration ?? 0), 0);
}

// Locate which task index the elapsed minutes falls into.
// Tasks can have .minutes or .duration; prefers .minutes.
export function locateTask(elapsedMinutes, tasks) {
  const getM = (t) => (t.minutes ?? t.duration ?? 0);
  const total = tasks.reduce((s, t) => s + getM(t), 0);
  const clamp = Math.max(0, Math.min(total, elapsedMinutes));
  let acc = 0;
  for (let i = 0; i < tasks.length; i++) {
    const d = getM(tasks[i]);
    if (clamp < acc + d) {
      return { index: i, inTaskElapsed: clamp - acc, clampedElapsed: clamp, totalMinutes: total };
    }
    acc += d;
  }
  const last = Math.max(0, tasks.length - 1);
  return { index: last, inTaskElapsed: getM(tasks[last] || { duration: 0 }), clampedElapsed: total, totalMinutes: total };
}

// Compute elapsed minutes and routine end time based on mode.
export function computeElapsed({ mode, startTime, deadline, now, totalMinutes }) {
  const nowMs = now.getTime();
  if (mode === 'deadline') {
    const dl = new Date(deadline.getTime());
    if (dl.getTime() < nowMs) dl.setDate(dl.getDate() + 1); // tomorrow if in the past
    const remaining = clampNum((dl.getTime() - nowMs) / 60000, 0, totalMinutes);
    return { elapsed: totalMinutes - remaining, endsAt: dl };
  }
  const elapsed = Math.max(0, (nowMs - startTime.getTime()) / 60000);
  const endsAt = new Date(startTime.getTime() + totalMinutes * 60000);
  return { elapsed, endsAt };
}

export function clampNum(x, a, b) {
  return Math.max(a, Math.min(b, x));
}

export function toToday(hhmmStr) {
  const [h, m] = String(hhmmStr || '00:00').split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function hhmm(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

