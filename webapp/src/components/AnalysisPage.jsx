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
import { fetchPostureEntries } from '../utils/indexDB';

// Register the required Chart.js components
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

const PostureAnalysis = () => {
  const [allPostures, setAllPostures] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [percentageThreshold, setPercentageThreshold] = useState(75);
  const [timeFilter, setTimeFilter] = useState(30); // Default to last 30 days
  const lineChartRef = useRef(null);
  const percentageChartRef = useRef(null);

  /**
* Fetch posture entries from the database for the last given number of minutes.
   *
* @param {number} minutes - The number of minutes for which to fetch posture entries.
* @returns {Promise<Object>} - A Promise that resolves to an object containing categorized arrays of posture entries:
* - {Array<{timestamp: number, postureType: string}>} allPostures - All entries (timestamp, postureType) sorted by timestamp.
* - {Array<{timestamp: number, postureType: string}>} normalPostures - Entries with postureType 'normal'.
* - {Array<{timestamp: number, postureType: string}>} leanForwardPostures - Entries with postureType 'lean_forward'.
* - {Array<{timestamp: number, postureType: string}>} leanBackwardPostures - Entries with postureType 'lean_backward'.
* @throws {Error} If the input is invalid.
   */
  const fetchPostureEntriesForLastMinutes = async (minutes) => {
    if (!Number.isFinite(minutes) || minutes <= 0) {
      throw new Error('Invalid input: minutes must be a positive number.');
    }

    const endTime = Date.now(); // Current time in milliseconds
    const startTime = endTime - minutes * 60 * 1000; // Subtract minutes to get start time

    // Call fetchPostureEntries with the calculated time range
    const { allPostures, normalPostures, leanForwardPostures, leanBackwardPostures } =
      await fetchPostureEntries(startTime, endTime);

    return {
      allPostures,
      normalPostures,
      leanForwardPostures,
      leanBackwardPostures,
    };
  };

  // Fetch posture data whenever the timeFilter changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const minutes = timeFilter * 24 * 60; // Convert days to minutes
        const { allPostures } = await fetchPostureEntriesForLastMinutes(minutes);
        setAllPostures(allPostures);
      } catch (error) {
        console.error('Error fetching posture entries:', error);
      }
    };

    fetchData();
  }, [timeFilter]); // Add timeFilter as a dependency

  // Process fetched data into daily aggregates
  useEffect(() => {
    if (allPostures.length === 0) return;

    // Convert allPostures to daily aggregates
    const dailyAggregates = {};

    allPostures.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
      if (!dailyAggregates[date]) {
        dailyAggregates[date] = { goodPosture: 0, badPosture: 0 };
      }
      if (entry.postureType === 'normal') {
        dailyAggregates[date].goodPosture += 1; // Assuming each entry represents 1 minute
      } else {
        dailyAggregates[date].badPosture += 1;
      }
    });

    // Convert to array and sort by date
    const aggregatedArray = Object.keys(dailyAggregates)
      .map((date) => ({
        date,
        goodPosture: dailyAggregates[date].goodPosture,
        badPosture: dailyAggregates[date].badPosture,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredData(aggregatedArray);
  }, [allPostures]);

  // Create or update the percentage bad posture chart
  useEffect(() => {
    if (filteredData.length === 0) return;

    // Destroy existing chart if it exists
    if (percentageChartRef.current) {
      percentageChartRef.current.destroy();
    }

    const ctx = document.getElementById('PercentageBadPostureChart').getContext('2d');

    const labels = filteredData.map((entry) => entry.date);
    const percentages = filteredData.map((entry) =>
      entry.goodPosture + entry.badPosture > 0
        ? ((entry.badPosture / (entry.goodPosture + entry.badPosture)) * 100).toFixed(2)
        : 0
    );

    percentageChartRef.current = new Chart(ctx, {
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

    return () => {
      if (percentageChartRef.current) {
        percentageChartRef.current.destroy();
      }
    };
  }, [filteredData]);

  // Create or update the bad posture count line chart (optional)
  // You can uncomment and customize this section if you want an additional chart
  /*
  useEffect(() => {
    if (filteredData.length === 0) return;

    // Destroy existing chart if it exists
    if (lineChartRef.current) {
      lineChartRef.current.destroy();
    }

    const ctx = document.getElementById('PostureChart').getContext('2d');

    const labels = filteredData.map((entry) => entry.date);
    const badPostureCounts = filteredData.map((entry) => entry.badPosture);

    lineChartRef.current = new Chart(ctx, {
      type: 'line', // Specify the type of chart
      data: {
        labels,
        datasets: [
          {
            label: 'Times in Bad Posture',
            data: badPostureCounts,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            tension: 0.3, // Smooth line curve
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
              text: 'Bad Posture Count',
            },
          },
        },
      },
    });

    return () => {
      if (lineChartRef.current) {
        lineChartRef.current.destroy();
      }
    };
  }, [filteredData]);
  */

  // Handle time filter change
  const handleTimeFilterChange = (filter) => {
    const days = parseInt(filter, 10);
    if (!isNaN(days)) {
      setTimeFilter(days);
      // Data fetching is now handled by useEffect based on timeFilter
    }
  };

  // Compute Good Posture Streak
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

  // Get Circle Sizes and Totals
  const getCircleSizes = () => {
    const totalGoodPosture = filteredData.reduce((sum, entry) => sum + entry.goodPosture, 0);
    const totalBadPosture = filteredData.reduce((sum, entry) => sum + entry.badPosture, 0);
    const totalPosture = totalGoodPosture + totalBadPosture;

    const goodProportion = totalPosture > 0 ? totalGoodPosture / totalPosture : 0;
    const badProportion = totalPosture > 0 ? totalBadPosture / totalPosture : 0;

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
    <div className="container mx-auto p-4 text-center text-[#2a6f6f]">
      <h2 className="text-2xl font-bold mb-6">Posture Analysis</h2>

      {/* Time Filter */}
      <div className="flex justify-center items-center mb-4">
        <label htmlFor="timeFilter" className="mr-2">
          Time Filter:
        </label>
        <select
          id="timeFilter"
          value={timeFilter}
          onChange={(e) => handleTimeFilterChange(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="60">Last 60 Days</option>
        </select>
      </div>

      {/* Streak Threshold */}
      <div className="flex justify-center items-center mb-6">
        <label htmlFor="streakThreshold" className="mr-2">
          Good Posture Threshold (%):
        </label>
        <input
          id="streakThreshold"
          type="number"
          min="0"
          max="100"
          value={percentageThreshold}
          onChange={(e) => setPercentageThreshold(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 w-20"
        />
      </div>

      {/* Good Posture Streak */}
      <div className="text-center mb-6">
        <p className="text-lg mb-2">Current Good Posture Streak</p>
        <p className="text-4xl font-bold" style={{ color: '#29706f' }}>
          {computeGoodPostureStreak()} {computeGoodPostureStreak() === 1 ? 'day' : 'days'}
        </p>
      </div>

      {/* Circle Visualization */}
      <div className="flex flex-col md:flex-row justify-center items-center mb-6 space-y-4 md:space-y-0 md:space-x-8">
        <div className="text-center">
          <div
            style={{
              width: `${goodCircleSize}px`,
              height: `${goodCircleSize}px`,
            }}
            className="rounded-full bg-[#a8c3b5] flex items-center justify-center mx-auto"
          >
            <span className="text-lg font-bold text-gray-800">{totalGoodPosture} min</span>
          </div>
          <p className="mt-2">Time in Good Posture</p>
        </div>
        <div className="text-center">
          <div
            style={{
              width: `${badCircleSize}px`,
              height: `${badCircleSize}px`,
            }}
            className="rounded-full bg-[#ff9877] flex items-center justify-center mx-auto"
          >
            <span className="text-lg font-bold text-gray-800">{totalBadPosture} min</span>
          </div>
          <p className="mt-2">Time in Bad Posture</p>
        </div>
      </div>

      {/* Percentage Bad Posture Line Chart */}
      <div className="mb-6">
        <canvas id="PercentageBadPostureChart"></canvas>
      </div>

      {/* Optional: Bad Posture Count Line Chart */}
      {/* Uncomment the following block if you want to display the bad posture count chart */}
      {/*
      <div className="mb-6">
        <canvas id="PostureChart"></canvas>
      </div>
      */}
    </div>
  );
};

export default PostureAnalysis;