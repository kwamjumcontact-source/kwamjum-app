import React, { useMemo } from 'react';
import './ActivityHeatmap.css';

const ActivityHeatmap = ({ logs }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const { monthName, year, calendarGrid } = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11
    
    // First day of the month
    const firstDayDate = new Date(currentYear, currentMonth, 1);
    // getDay() is 0 (Sun) to 6 (Sat). We want Monday=0, Sunday=6
    let startingDay = firstDayDate.getDay() - 1;
    if (startingDay === -1) startingDay = 6; // Sunday

    // Total days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Map logs to counts per date string
    const reviewCounts = {};
    if (logs) {
      logs.forEach(log => {
        const dateStr = log.reviewed_at.split('T')[0];
        reviewCounts[dateStr] = (reviewCounts[dateStr] || 0) + 1;
      });
    }

    const grid = [];
    let currentWeek = [];

    // Add empty cells for padding before the 1st of the month
    for (let i = 0; i < startingDay; i++) {
      currentWeek.push(null);
    }

    // Add actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(currentYear, currentMonth, d);
      // Ensure local timezone doesn't mess up YYYY-MM-DD
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = reviewCounts[dateStr] || 0;
      
      let intensity = 0;
      let isGhost = false;
      let isFuture = false;

      // If no logs at all, show ghost pattern to encourage user
      if (!logs || logs.length === 0) {
        isGhost = true;
        intensity = (d % 3 === 0) ? 1 : 0;
      } else {
        if (count > 0) intensity = 1;
        if (count >= 10) intensity = 2;
        if (count >= 30) intensity = 3;
        if (count >= 50) intensity = 4;
      }

      // Mark future days to make them darker
      if (cellDate > today && !isGhost) {
        isFuture = true;
      }

      currentWeek.push({
        day: d,
        date: dateStr,
        count,
        intensity,
        isGhost,
        isFuture,
        isToday: d === today.getDate()
      });

      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      grid.push(currentWeek);
    }

    return {
      monthName: monthNames[currentMonth],
      year: currentYear,
      calendarGrid: grid
    };
  }, [logs]);

  return (
    <div className="heatmap-container">
      <div className="calendar-header">
        <span className="calendar-title">{monthName} {year}</span>
      </div>
      
      <div className="calendar-grid">
        {/* Days of week header */}
        {daysOfWeek.map(day => (
          <div key={day} className="calendar-dow">{day}</div>
        ))}

        {/* Calendar Cells */}
        {calendarGrid.map((week, wIndex) => 
          week.map((dayObj, dIndex) => {
            if (!dayObj) {
              return <div key={`${wIndex}-${dIndex}`} className="heatmap-cell empty-padding" />;
            }
            
            let classNames = `heatmap-cell level-${dayObj.intensity}`;
            if (dayObj.isGhost) classNames += ' ghost';
            if (dayObj.isFuture) classNames += ' future';
            if (dayObj.isToday) classNames += ' today';

            return (
              <div 
                key={`${wIndex}-${dIndex}`} 
                className={classNames}
                title={dayObj.isGhost ? "Start studying!" : `${dayObj.count} reviews on ${dayObj.date}`}
              >
                {dayObj.day}
              </div>
            );
          })
        )}
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-cell level-0"></div>
        <div className="heatmap-cell level-1"></div>
        <div className="heatmap-cell level-2"></div>
        <div className="heatmap-cell level-3"></div>
        <div className="heatmap-cell level-4"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
