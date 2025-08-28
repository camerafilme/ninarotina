import React, { useState } from 'react';

const RoutineEditor = ({ routine, onSave }) => {
  const [tasks, setTasks] = useState(
    (routine.tasks || []).map((t) => ({ ...t, minutes: t.minutes ?? t.duration ?? 0, duration: undefined }))
  );

  const handleAddTask = () => {
    const newTask = { id: Date.now(), name: 'New Task', minutes: 10, color: '#CCCCCC', icon: '✨' };
    setTasks([...tasks, newTask]);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleMoveTask = (taskId, direction) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === taskId);
      if (idx === -1) return prev;
      const delta = direction === 'up' ? -1 : 1;
      const newIdx = idx + delta;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy;
    });
  };

  const handleTaskChange = (taskId, field, value) => {
    setTasks(tasks.map(task => (task.id === taskId ? { ...task, [field]: value } : task)));
  };

  const handleSave = () => {
    const cleaned = tasks.map(({ duration, ...t }) => ({ ...t, minutes: Number(t.minutes) || 0 }));
    onSave({ ...routine, tasks: cleaned });
  };

  // Drag & drop reordering
  const isDesktop = typeof window !== 'undefined' && ((window.matchMedia && window.matchMedia('(pointer: fine)').matches) || (window.innerWidth >= 768));
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', String(taskId));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = Number(e.dataTransfer.getData('text/plain'));
    if (!sourceId || sourceId === targetId) return;
    setTasks(prev => {
      const from = prev.findIndex(t => t.id === sourceId);
      const to = prev.findIndex(t => t.id === targetId);
      if (from < 0 || to < 0) return prev;
      const arr = prev.slice();
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Edit Routine: {routine.name}</h2>
      <div>
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center space-x-2 mb-2 bg-white"
            draggable={isDesktop}
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task.id)}
          >
            <div
              className="hidden md:flex items-center justify-center w-6 h-10 text-slate-500 cursor-move select-none"
              title="Arraste para reordenar"
            >
              ⋮⋮
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handleMoveTask(task.id, 'up')}
                className="px-1 py-0.5 text-xs rounded bg-slate-200 hover:bg-slate-300"
                aria-label="Mover tarefa para cima"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => handleMoveTask(task.id, 'down')}
                className="px-1 py-0.5 text-xs rounded bg-slate-200 hover:bg-slate-300"
                aria-label="Mover tarefa para baixo"
              >
                ▼
              </button>
            </div>
            <input
              type="text"
              value={task.name}
              onChange={(e) => handleTaskChange(task.id, 'name', e.target.value)}
              className="border p-1 rounded w-full"
            />
            <input
              type="number"
              value={task.minutes}
              onChange={(e) => handleTaskChange(task.id, 'minutes', parseInt(e.target.value, 10))}
              className="border p-1 rounded w-20"
            />
            <input
              type="color"
              value={task.color}
              onChange={(e) => handleTaskChange(task.id, 'color', e.target.value)}
              className="border p-1 rounded"
            />
            <input
              type="text"
              value={task.icon}
              onChange={(e) => handleTaskChange(task.id, 'icon', e.target.value)}
              className="border p-1 rounded w-12"
            />
            <button onClick={() => handleDeleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">X</button>
          </div>
        ))}
      </div>
      <button onClick={handleAddTask} className="bg-green-500 text-white p-2 rounded mt-4">Add Task</button>
      <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded mt-4 ml-2">Save Routine</button>
    </div>
  );
};

export default RoutineEditor;
