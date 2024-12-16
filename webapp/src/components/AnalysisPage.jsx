import React, { useEffect, useState, useRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend
);

const postureData = [
  { date: '2024-10-05', goodPosture: 140, badPosture: 15, correctionTime: 11 },
  { date: '2024-11-05', goodPosture: 140, badPosture: 15, correctionTime: 11 },
  { date: '2024-12-01', goodPosture: 120, badPosture: 30, correctionTime: 10 },
  { date: '2024-12-02', goodPosture: 130, badPosture: 20, correctionTime: 12 },
  { date: '2024-12-03', goodPosture: 100, badPosture: 40, correctionTime: 15 },
  { date: '2024-12-04', goodPosture: 150, badPosture: 10, correctionTime: 8 },
  { date: '2024-12-05', goodPosture: 140, badPosture: 15, correctionTime: 11 },
  { date: '2024-12-13', goodPosture: 140, badPosture: 15, correctionTime: 11 },
  { date: '2024-12-12', goodPosture: 140, badPosture: 15, correctionTime: 11 },
  { date: '2024-12-11', goodPosture: 140, badPosture: 15, correctionTime: 11 },
];

const PostureAnalysis = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [percentageThreshold, setPercentageThreshold] = useState(75);
  const [timeFilter, setTimeFilter] = useState(7); // Default to last 7 days

  const lineChartRef = useRef(null);

  // Apply default filter on load
  useEffect(() => {
    handleTimeFilterChange(7);
  }, []);

  // Create consistent date range
  const getDateRange = (days) => {
    const today = new Date();
    const dateRange = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dateRange.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
    return dateRange;
  };

  // Update filtered data based on the time filter
  const handleTimeFilterChange = (filter) => {
    const days = parseInt(filter, 10);
    if (!isNaN(days)) {
      const dateRange = getDateRange(days);
      const filtered = dateRange.map((date) => {
        const entry = postureData.find((data) => data.date === date);
        return entry || { date, goodPosture: 0, badPosture: 0 };
      });
      setFilteredData(filtered);
      setTimeFilter(days);
    }
  };

  // Update line chart when filtered data changes
  useEffect(() => {
    if (lineChartRef.current) {
      lineChartRef.current.destroy();
    }
    createLineChart(filteredData);

    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
    };
  }, [filteredData]);

  const createLineChart = (data) => {
    const ctx = document.getElementById('PercentageBadPostureChart').getContext('2d');

    const labels = data.map((entry) => entry.date);
    const percentages = data.map((entry) =>
      entry.goodPosture + entry.badPosture > 0
        ? ((entry.badPosture / (entry.goodPosture + entry.badPosture)) * 100).toFixed(2)
        : null
    );

    lineChartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Percentage of Time in Bad Posture',
            data: percentages,
            borderColor: '#a8c3b5',
            borderWidth: 2,
            spanGaps: true, // Avoid drawing lines for missing data points
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Date',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Percentage (%)',
            },
            ticks: {
              max: 100,
              min: 0,
            },
          },
        },
      },
    });
  };

  const computeGoodPostureStreak = () => {
    let maxStreak = 0;
    let currentStreak = 0;

    filteredData.forEach((entry) => {
      const total = entry.goodPosture + entry.badPosture;
      if (total > 0) {
        const goodPercentage = (entry.goodPosture / total) * 100;
        if (goodPercentage >= percentageThreshold) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  };

  const getCircleSizes = () => {
    const totalGoodPosture = filteredData.reduce((sum, entry) => sum + entry.goodPosture, 0);
    const totalBadPosture = filteredData.reduce((sum, entry) => sum + entry.badPosture, 0);
    const totalPosture = totalGoodPosture + totalBadPosture;

    const goodProportion = totalGoodPosture / totalPosture;
    const badProportion = totalBadPosture / totalPosture;

    // Sizes relative to viewport width
    const baseSize = Math.min(window.innerWidth, 500) / 2;

    return {
      goodCircleSize: baseSize * goodProportion,
      badCircleSize: baseSize * badProportion,
      totalGoodPosture,
      totalBadPosture,
    };
  };

  const { goodCircleSize, badCircleSize, totalGoodPosture, totalBadPosture } = getCircleSizes();

  return (
    <div>
      <h1>Posture Analysis</h1>

      {/* Time Filter */}
      <div>
        <label htmlFor="timeFilter">Time Filter: </label>
        <select
          id="timeFilter"
          value={timeFilter}
          onChange={(e) => handleTimeFilterChange(e.target.value)}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
        </select>
      </div>

      {/* Streak Threshold */}
      <div>
        <label htmlFor="streakThreshold">Good Posture Threshold (%): </label>
        <input
          id="streakThreshold"
          type="number"
          value={percentageThreshold}
          onChange={(e) => setPercentageThreshold(e.target.value)}
        />
      </div>

      {/* Good Posture Streak */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '18px', marginBottom: '5px' }}>Current Good Posture Streak</p>
        <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#28a745' }}>
          {computeGoodPostureStreak()} days
        </p>
      </div>

      {/* Circle Visualization */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: `${goodCircleSize}px`,
              height: `${goodCircleSize}px`,
              borderRadius: '50%',
              backgroundColor: '#a8c3b5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2em',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {totalGoodPosture} min
          </div>
          <p>Time in Good Posture</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: `${badCircleSize}px`,
              height: `${badCircleSize}px`,
              borderRadius: '50%',
              backgroundColor: '#ff9877',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2em',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            {totalBadPosture} min
          </div>
          <p>Time in Bad Posture</p>
        </div>
      </div>

      {/* Line Chart */}
      <div>
        <canvas id="PercentageBadPostureChart"></canvas>
      </div>
    </div>
  );
};

export default PostureAnalysis;