import React, { useState, useEffect } from "react";
import AudioAlerts from "./components/AudioAlerts";
import "./App.css";
import Home from "./pages/Home";

function App() {
  const [routines, setRoutines] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Antigo: Load routines from localStorage first, fallback to routines.json
    // if (storedRoutines) {
    //   setRoutines(JSON.parse(storedRoutines));
    // } else {
    // fetch('/routines.json')
    //   .then(response => response.json())
    //   .then(data => {
    //     setRoutines(data);
    // localStorage.setItem('routines', JSON.stringify(data));
    // });
    // }
    fetch("/routines.json?v=" + Date.now(), { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setRoutines(data);
        // optional: still write it; you’re just not reading it on startup
        try {
          localStorage.setItem("routines", JSON.stringify(data));
        } catch (e) {
          /* ignore quota errors during development */
        }
      })
      .catch((err) => console.warn("Failed to load routines.json", err));
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
