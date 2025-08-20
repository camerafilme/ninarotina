import React from 'react';
import { clampNum, hhmm } from '../lib/timeline';

export default function AgoraCard({ current, currentPct, endsAt, inTaskRemaining, now }) {
  const minutes = current.minutes ?? current.duration ?? 0;
  const widthScale = clampNum(minutes / 5, 1, 4); // 5→1×, 20→4×
  const barBasePx = 220; // px for 5 min
  const barWidthPx = Math.round(barBasePx * widthScale);
  const barHeightPx = 30; // fixed height

  return (
    <section className="mt-2">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className="size-16 md:size-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl"
            style={{ backgroundColor: (current.color || '#ddd') + '22' }}
          >
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
          <div className="mx-auto" style={{ width: barWidthPx + 'px', maxWidth: '100%' }}>
            <div className="w-full rounded-full bg-slate-100 overflow-hidden" style={{ height: `${barHeightPx}px` }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${currentPct * 100}%`, backgroundColor: current.color }} />
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>Agora: {hhmm(now)}</span>
            <span>Rotina termina: {hhmm(endsAt)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

