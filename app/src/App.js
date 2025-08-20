import React, { useState, useEffect } from 'react';
import AudioAlerts from './components/AudioAlerts';
import './App.css';
import Home from './pages/Home';

function App() {
  const [routines, setRoutines] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Load routines from localStorage first, fallback to routines.json
    const storedRoutines = localStorage.getItem('routines');
    if (storedRoutines) {
      setRoutines(JSON.parse(storedRoutines));
    } else {
      fetch('/routines.json')
        .then(response => response.json())
        .then(data => {
          setRoutines(data);
          localStorage.setItem('routines', JSON.stringify(data));
        });
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      {routines ? (
        <Home routines={routines} currentTime={currentTime} />
      ) : (
        <div className="p-6">Carregando rotinas…</div>
      )}
      {/* Keep alerts behavior unchanged */}
      <AudioAlerts routine={null} currentTime={currentTime} />
    </div>
  );
}

export default App;
