import React, { useMemo } from 'react';
import './ActivityHeatmap.css';

const ActivityHeatmap = ({ logs }) => {
  const weeks = 12; // Show last 12 weeks (~84 days)
  const daysInWeek = 7;

  // Generate matrix of dates for the heatmap
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the start date (12 weeks ago, starting on a Sunday)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * daysInWeek) + today.getDay() + 1);

    // Count reviews per date
    const reviewCounts = {};
    if (logs) {
      logs.forEach(log => {
        const dateStr = log.reviewed_at.split('T')[0];
        reviewCounts[dateStr] = (reviewCounts[dateStr] || 0) + 1;
      });
    }

    // Build the grid column by column (weeks)
    for (let w = 0; w < weeks; w++) {
      const weekCol = [];
      for (let d = 0; d < daysInWeek; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (w * daysInWeek) + d);
        
        if (currentDate > today) {
          weekCol.push(null); // Future days
          continue;
        }

        const dateStr = currentDate.toISOString().split('T')[0];
        const count = reviewCounts[dateStr] || 0;
        
        // Determine intensity level (0-4)
        let intensity = 0;
        let isGhost = false;

        if (logs && logs.length > 0) {
          if (count > 0) intensity = 1;
          if (count >= 10) intensity = 2;
          if (count >= 30) intensity = 3;
          if (count >= 50) intensity = 4;
        } else {
          // Ghost pattern for empty states (a wave or random pattern)
          isGhost = true;
          // Simple visual pattern based on index
          intensity = ((w + d) % 3 === 0) ? ((w % 2 === 0) ? 2 : 1) : 0;
        }

        weekCol.push({
          date: dateStr,
          count,
          intensity,
          isGhost
        });
      }
      data.push(weekCol);
    }
    return data;
  }, [logs]);

  return (
    <div className="heatmap-container">
      <div className="heatmap-grid">
        {heatmapData.map((week, wIndex) => (
          <div key={wIndex} className="heatmap-col">
            {week.map((day, dIndex) => {
              if (!day) return <div key={dIndex} className="heatmap-cell empty" />;
              return (
                <div 
                  key={dIndex} 
                  className={`heatmap-cell level-${day.intensity} ${day.isGhost ? 'ghost' : ''}`}
                  title={day.isGhost ? "Start studying to light up this day!" : `${day.count} reviews on ${day.date}`}
                ></div>
              );
            })}
          </div>
        ))}
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
