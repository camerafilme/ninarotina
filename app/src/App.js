import React, { useState, useEffect } from "react";
import AudioAlerts from "./components/AudioAlerts";
import "./App.css";
import Home from "./pages/Home";

function App() {
  const [routines, setRoutines] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  function normalizeMinutes(data) {
    if (!data || typeof data !== 'object') return data;
    const clone = JSON.parse(JSON.stringify(data));
    Object.keys(clone || {}).forEach((day) => {
      Object.keys(clone[day] || {}).forEach((period) => {
        const r = clone[day][period];
        if (r && Array.isArray(r.tasks)) {
          r.tasks = r.tasks.map((t) => {
            const minutes = t.minutes ?? t.duration ?? 0;
            const { duration, ...rest } = t;
            return { ...rest, minutes };
          });
        }
      });
    });
    return clone;
  }

  useEffect(() => {
    // Load from localStorage first; fallback to public/routines.json
    try {
      const stored = localStorage.getItem("routines");
      if (stored) {
        const parsed = JSON.parse(stored);
        const norm = normalizeMinutes(parsed);
        setRoutines(norm);
        try { localStorage.setItem("routines", JSON.stringify(norm)); } catch (_) {}
      } else {
        fetch("/routines.json?v=" + Date.now(), { cache: "no-store" })
          .then((r) => r.json())
          .then((data) => {
            const norm = normalizeMinutes(data);
            setRoutines(norm);
            try { localStorage.setItem("routines", JSON.stringify(norm)); } catch (_) {}
          })
          .catch((err) => console.warn("Failed to load routines.json", err));
      }
    } catch (e) {
      console.warn("Failed to parse stored routines; refetching", e);
      fetch("/routines.json?v=" + Date.now(), { cache: "no-store" })
        .then((r) => r.json())
        .then((data) => setRoutines(normalizeMinutes(data)))
        .catch((err) => console.warn("Failed to load routines.json", err));
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {routines ? (
        <Home routines={routines} setRoutines={setRoutines} currentTime={currentTime} />
      ) : (
        <div className="p-6">Carregando rotinas…</div>
      )}
      {/* Keep alerts behavior unchanged */}
      <AudioAlerts routine={null} currentTime={currentTime} />
    </div>
  );
}

export default App;
