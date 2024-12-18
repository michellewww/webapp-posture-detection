import React, { useEffect, useState, useRef } from "react";
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
} from "chart.js";
import { fetchPostureEntries } from "../utils/indexDB";

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
  const [percentageThreshold, setPercentageThreshold] = useState(70);
  const [timeFilter, setTimeFilter] = useState(30);
  const percentageChartRef = useRef(null);

  // Fetch and process posture data
  const fetchPostureEntriesForLastMinutes = async (minutes) => {
    const endTime = Date.now();
    const startTime = endTime - minutes * 60 * 1000;
    const { allPostures } = await fetchPostureEntries(startTime, endTime);
    return { allPostures };
  };

  useEffect(() => {
    const fetchData = async () => {
      const minutes = timeFilter * 24 * 60;
      const { allPostures } = await fetchPostureEntriesForLastMinutes(minutes);
      setAllPostures(allPostures);
    };
    fetchData();
  }, [timeFilter]);

  useEffect(() => {
    const dailyAggregates = {};
    allPostures.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      if (!dailyAggregates[date]) dailyAggregates[date] = { goodPosture: 0, badPosture: 0 };
      entry.postureType === "normal"
        ? dailyAggregates[date].goodPosture++
        : dailyAggregates[date].badPosture++;
    });
    const aggregatedArray = Object.keys(dailyAggregates)
      .map((date) => ({
        date,
        goodPosture: dailyAggregates[date].goodPosture,
        badPosture: dailyAggregates[date].badPosture,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setFilteredData(aggregatedArray);
  }, [allPostures]);

  useEffect(() => {
    if (filteredData.length === 0) return;
    if (percentageChartRef.current) percentageChartRef.current.destroy();
    const ctx = document.getElementById("PercentageBadPostureChart").getContext("2d");
    const labels = filteredData.map((entry) => entry.date);
    const percentages = filteredData.map((entry) =>
      entry.goodPosture + entry.badPosture > 0
        ? ((entry.badPosture / (entry.goodPosture + entry.badPosture)) * 100).toFixed(2)
        : 0
    );

    percentageChartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Percentage of Time in Bad Posture",
            data: percentages,
            borderColor: "#ff9877",
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
        },
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Percentage (%)" }, min: 0, max: 100 },
        },
      },
    });
  }, [filteredData]);

  // Compute Good Posture Streak
  const computeStreaks = () => {
    let maxStreak = 0;
    let currentStreak = 0;
    let recentStreak = 0;
  
    // First loop: Calculate maxStreak
    for (let i = 0; i < filteredData.length; i++) {
      const entry = filteredData[i];
      const total = entry.goodPosture + entry.badPosture;
      const goodPercentage = total > 0 ? (entry.goodPosture / total) * 100 : 0;
  
      if (goodPercentage >= percentageThreshold) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0; // Reset current streak if threshold is not met
      }
    }
  
    // Second loop: Calculate recentStreak (iterate backwards)
    for (let i = filteredData.length - 1; i >= 0; i--) {
      const entry = filteredData[i];
      const total = entry.goodPosture + entry.badPosture;
      const goodPercentage = total > 0 ? (entry.goodPosture / total) * 100 : 0;
  
      if (goodPercentage >= percentageThreshold) {
        recentStreak++;
      } else {
        break; // Stop counting if the streak is broken
      }
    }
  
    return { maxStreak, recentStreak };
  };
  
    const { maxStreak, recentStreak } = computeStreaks();

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
    <div className="container mx-auto p-6 text-[#2a6f6f] bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Posture Analysis Dashboard</h1>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Filters</h2>
        <div className="flex justify-center space-x-4">
          <div>
            <label htmlFor="timeFilter" className="mr-2 font-semibold">Time Filter:</label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="60">Last 60 Days</option>
            </select>
          </div>
          <div>
            <label htmlFor="threshold" className="mr-2 font-semibold">Good Posture Threshold (%):</label>
            <input
              id="threshold"
              type="number"
              value={percentageThreshold}
              onChange={(e) => setPercentageThreshold(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 w-20"
            />
          </div>
        </div>
      </div>

      {/* Streaks Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {/* Maximum Good Posture Streak */}
        <h2 className="text-xl font-bold mb-4">Maximum Good Posture Streak</h2>
        <p className="text-sm text-gray-500 mb-4">
        Longest number of consecutive days in the past where good posture met the defined threshold.
        </p>
        <p className="text-4xl text-center font-semibold" style={{color:'#29706f'}}>
        {maxStreak} {maxStreak === 1 ? "day" : "days"}
        </p>

        {/* Current Good Posture Streak */}
        <h2 className="text-xl font-bold mb-4 mt-10">Current Good Posture Streak</h2>
        <p className="text-sm text-gray-500 mb-4">
        Number of consecutive recent days (starting from today) maintaining good posture above the threshold.
        </p>
        <p className="text-4xl text-center font-semibold" style={{color:'#29706f'}}>
        {recentStreak} {recentStreak === 1 ? "day" : "days"}
        </p>
      </div>

      {/* Line Chart Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Posture Trend Analysis</h2>
        <canvas id="PercentageBadPostureChart"></canvas>
      </div>
      

      {/* Circle Visualization Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Posture Time Overview</h2>
      <div className="flex flex-col md:flex-row justify-center items-center mb-6 space-y-4 md:space-y-0 md:space-x-8">
      <div className="text-center">
      <div
      style={{
      width: `${goodCircleSize}px`,
      height: `${goodCircleSize}px`,
      }}
      className="rounded-full bg-[#a8c3b5] flex items-center justify-center mx-auto"
      >
      <span className="text-lg font-bold text-gray-600">{totalGoodPosture} min</span>
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
      <span className="text-md font-bold text-gray-600">{totalBadPosture} min</span>
      </div>
      <p className="mt-2">Time in Bad Posture</p>
      </div>
      </div>
      </div>

    </div>
  );
};

export default PostureAnalysis;