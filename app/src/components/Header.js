import React from 'react';

// Header with title and Manhã/Noite toggle
export default function Header({ routineId, setRoutineId }) {
  const options = [
    { id: 'morning', label: 'Manhã' },
    { id: 'evening', label: 'Noite' },
  ];
  return (
    <header className="flex items-center justify-between gap-4">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Rotina da Nina ✨</h1>
      <div className="flex rounded-2xl bg-slate-100 p-1 shadow-inner">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setRoutineId(opt.id)}
            className={
              'px-4 py-2 text-sm md:text-base rounded-2xl transition ' +
              (routineId === opt.id ? 'bg-white shadow font-semibold' : 'text-slate-600 hover:text-slate-800')
            }
            aria-pressed={routineId === opt.id}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </header>
  );
}

