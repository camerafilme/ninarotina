import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import TimelineNew from '../components/TimelineNew';
import AgoraCard from '../components/AgoraCard';
import { computeElapsed, locateTask, sumMinutes, toToday } from '../lib/timeline';

export default function Home({ routines, currentTime }) {
  // Map routines to morning/evening for today (using 'monday' as in current data)
  const todayKey = 'monday';
  const available = routines?.[todayKey] || {};

  const [routineId, setRoutineId] = useState('morning');
  const routine = available[routineId] || { name: 'Rotina', tasks: [] };

  const tasks = useMemo(() => routine.tasks || [], [routine]);
  const totalMinutes = useMemo(() => sumMinutes(tasks), [tasks]);

  // Modes: start | deadline
  const [useDeadline, setUseDeadline] = useState(true);
  const [deadlineStr, setDeadlineStr] = useState(routine.endTime || '23:59');
  const [startTime, setStartTime] = useState(() => new Date(currentTime));

  // Reset when routine changes
  useEffect(() => {
    setUseDeadline(true);
    setDeadlineStr(routine.endTime || '23:59');
    // Default start time aligns with deadline - total
    const dl = toToday(routine.endTime || '23:59');
    const startsAt = new Date(dl.getTime() - totalMinutes * 60000);
    setStartTime(startsAt);
  }, [routineId, routine.endTime, totalMinutes]);

  const mode = useDeadline ? 'deadline' : 'start';
  const deadline = toToday(deadlineStr);
  const now = currentTime instanceof Date ? currentTime : new Date();

  const { elapsed, endsAt } = useMemo(
    () => computeElapsed({ mode, startTime, deadline, now, totalMinutes }),
    [mode, startTime, deadline, now, totalMinutes]
  );

  const { index: currentIdx, inTaskElapsed, clampedElapsed } = useMemo(() => locateTask(elapsed, tasks), [elapsed, tasks]);
  const current = tasks[currentIdx] || { name: '-', duration: 1, color: '#999', icon: '⏱️' };
  const currentMinutes = current.minutes ?? current.duration ?? 1;
  const currentPct = Math.min(1, Math.max(0, inTaskElapsed / currentMinutes));
  const totalPct = Math.min(1, Math.max(0, clampedElapsed / Math.max(1, totalMinutes)));
  const inTaskRemaining = Math.max(0, Math.round(currentMinutes - inTaskElapsed));

  function onJump(i) {
    const minsBefore = tasks.slice(0, i).reduce((s, t) => s + (t.minutes ?? t.duration ?? 0), 0);
    if (useDeadline) {
      const remaining = totalMinutes - minsBefore;
      const newDeadline = new Date(now.getTime() + remaining * 60000);
      const hh = String(newDeadline.getHours()).padStart(2, '0');
      const mm = String(newDeadline.getMinutes()).padStart(2, '0');
      setDeadlineStr(`${hh}:${mm}`);
    } else {
      const newStart = new Date(now.getTime() - minsBefore * 60000);
      setStartTime(newStart);
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Header routineId={routineId} setRoutineId={setRoutineId} />
      </div>

      <TimelineNew
        tasks={tasks}
        totalMinutes={totalMinutes}
        currentIdx={currentIdx}
        totalPct={totalPct}
        onJump={onJump}
        deadlineStr={deadlineStr}
        setDeadlineStr={setDeadlineStr}
        useDeadline={useDeadline}
        setUseDeadline={setUseDeadline}
        startTime={startTime}
        endsAt={endsAt}
      />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <AgoraCard
          current={current}
          currentPct={currentPct}
          endsAt={endsAt}
          inTaskRemaining={inTaskRemaining}
          now={now}
        />
      </div>
    </div>
  );
}

