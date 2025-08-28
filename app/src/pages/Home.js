import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import TimelineNew from '../components/TimelineNew';
import AgoraCard from '../components/AgoraCard';
import DefaultRoutineEditor from '../components/DefaultRoutineEditor';
import RoutineEditor from '../components/RoutineEditor';
import { computeElapsed, locateTask, sumMinutes, toToday } from '../lib/timeline';

export default function Home({ routines, setRoutines, currentTime }) {
  // Map routines to morning/evening for today (using 'monday' as in current data)
  const todayKey = 'monday';
  const available = routines?.[todayKey] || {};

  const [routineId, setRoutineId] = useState('morning');
  const routine = available[routineId] || { name: 'Rotina', tasks: [] };

  const tasks = routine.tasks || [];
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

  const { elapsed, endsAt } = useMemo(() =>
    computeElapsed({ mode, startTime, deadline, now, totalMinutes }),
    [mode, startTime, deadlineStr, now, totalMinutes]
  );

  const { index: currentIdx, inTaskElapsed, clampedElapsed } = useMemo(() => locateTask(elapsed, tasks), [elapsed, tasks]);
  const current = tasks[currentIdx] || { name: '-', minutes: 1, color: '#999', icon: '⏱️' };
  const currentMinutes = current.minutes ?? 1;
  const currentPct = Math.min(1, Math.max(0, inTaskElapsed / currentMinutes));
  const totalPct = Math.min(1, Math.max(0, clampedElapsed / Math.max(1, totalMinutes)));
  const inTaskRemaining = Math.max(0, Math.round(currentMinutes - inTaskElapsed));

  // Edit states
  const [isEditingDefaults, setIsEditingDefaults] = useState(false);
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);

  function onJump(i) {
    const minsBefore = tasks.slice(0, i).reduce((s, t) => s + (t.minutes ?? 0), 0);
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

  function saveDefaults(updated) {
    try {
      localStorage.setItem('routines', JSON.stringify(updated));
    } catch (_) {}
    setRoutines(updated);
    setIsEditingDefaults(false);
  }

  function saveCurrent(updatedRoutine) {
    const next = {
      ...routines,
      [todayKey]: {
        ...(routines?.[todayKey] || {}),
        [routineId]: updatedRoutine,
      },
    };
    try {
      localStorage.setItem('routines', JSON.stringify(next));
    } catch (_) {}
    setRoutines(next);
    setIsEditingCurrent(false);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Header routineId={routineId} setRoutineId={setRoutineId} />
        {/* Edit toolbar */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="px-3 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800"
            onClick={() => setIsEditingCurrent(true)}
          >
            ✏️ Editar
          </button>
          <button
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsEditingDefaults(true)}
          >
            ⚙️ Rotinas
          </button>
        </div>
      </div>

      {/* Editors overlay sections */}
      {isEditingDefaults ? (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <DefaultRoutineEditor
            routines={routines}
            onSave={saveDefaults}
            onCancel={() => setIsEditingDefaults(false)}
          />
        </div>
      ) : isEditingCurrent ? (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <RoutineEditor routine={routine} onSave={saveCurrent} />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsEditingCurrent(false)}
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
