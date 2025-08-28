import React from 'react';
import TimeIndicator from './TimeIndicator';

const Timeline = ({ routine, endTime, currentTime }) => {
  // Calculate timeline dimensions and time positions
  
  // Helper function to determine text color based on background brightness
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  const totalDuration = routine.tasks.reduce((sum, task) => sum + (task.minutes ?? 0), 0);

  const routineEndTime = new Date();
  const [endHour, endMinute] = endTime.split(':').map(Number);
  routineEndTime.setHours(endHour, endMinute, 0, 0);

  const routineStartTime = new Date(routineEndTime.getTime() - totalDuration * 60 * 1000);

  const timeElapsed = (currentTime - routineStartTime) / 1000 / 60; // in minutes
  const percentageElapsed = Math.max(0, Math.min(100, (timeElapsed / totalDuration) * 100));

  // Color combinations: background, text
  const colorCombinations = [
    { bg: '#FFBE0B', text: '#000000' },
    { bg: '#8338EC', text: '#FFFFFF' },
    { bg: '#FF006E', text: '#FFFFFF' },
    { bg: '#FB5607', text: '#FFFFFF' },
    { bg: '#3A86FF', text: '#FFFFFF' },
    { bg: '#031BF5', text: '#FFFFFF' }
  ];

  let cumulativeTime = 0;
  
  return (
    // Full-width timeline container with vertical centering
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-gray-200 rounded-lg shadow-lg" style={{ marginTop: '-10vh' }}>
        {routine.tasks.map((task, index) => {
          const startPercentage = (cumulativeTime / totalDuration) * 100;
          const taskWidth = ((task.minutes ?? 0) / totalDuration) * 100;
          // Use task's actual color if available, fallback to color combinations
          const taskBgColor = task.color || colorCombinations[index % colorCombinations.length].bg;
          const taskTextColor = getContrastColor(taskBgColor);
          
          cumulativeTime += (task.minutes ?? 0);
          
          return (
            <div
              key={task.id}
              className="absolute top-0 h-full flex flex-col items-center justify-center border-r border-gray-300"
              style={{
                left: `${startPercentage}%`,
                width: `${taskWidth}%`,
                backgroundColor: taskBgColor,
                color: taskTextColor
              }}
            >
              {/* Task content with icon over name */}
              <div className="text-center px-1 sm:px-2 flex flex-col items-center">
                <div className="text-2xl sm:text-3xl md:text-4xl mb-1">
                  {task.icon}
                </div>
                <div className="font-bold text-xs sm:text-sm md:text-base">
                  {task.name}
                </div>
                <div className="text-xs sm:text-sm font-light opacity-80 mt-1">
                  {task.minutes} minuto{task.minutes !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          );
        })}
        <TimeIndicator 
          currentPercentage={percentageElapsed}
          currentTime={currentTime}
          routineStartTime={routineStartTime}
        />
      </div>
    </div>
  );
};


export default Timeline;
