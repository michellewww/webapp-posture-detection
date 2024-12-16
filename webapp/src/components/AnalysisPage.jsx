import React, { use, useEffect } from 'react';
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

// Register the required components with Chart.js
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

const PostureChart = () => {

  /**
   * Fetch posture entries from the database for the last given number of minutes.
   *
   * @param {number} minutes - The number of minutes for which to fetch posture entries.
   * @returns {Promise<Object>} - A Promise that resolves to an object containing categorized arrays of posture entries:
   *  - {Array<{timestamp: number, postureType: string}>} allPostures - All entries (timestamp, postureType) sorted by timestamp.
   *  - {Array<{timestamp: number, postureType: string}>} normalPostures - Entries with postureType 'normal'.
   *  - {Array<{timestamp: number, postureType: string}>} leanForwardPostures - Entries with postureType 'lean_forward'.
   *  - {Array<{timestamp: number, postureType: string}>} leanBackwardPostures - Entries with postureType 'lean_backward'.
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

  // TODO: change this
  useEffect(() => {
    console.log('Fetching posture entries for the last 30 minutes...');
    const fetchPostures = async () => {
      try {
        const { allPostures, normalPostures, leanForwardPostures, leanBackwardPostures } =
          await fetchPostureEntriesForLastMinutes(30);

        console.log('All postures:', allPostures);
        console.log('Normal postures:', normalPostures);
        console.log('Lean forward postures:', leanForwardPostures);
        console.log('Lean backward postures:', leanBackwardPostures);
      } catch (error) {
        console.error('Error fetching posture entries:', error);
      }
    };

    fetchPostures();
  }, []);

  useEffect(() => {
    // Ensure the chart is initialized after the component has mounted
    const ctx = document.getElementById('PostureChart').getContext('2d');

    // Data for the chart
    const badPostureCounts = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10));
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Create the chart
    new Chart(ctx, {
      type: 'line', // Specify the type of chart
      data: {
        labels: days,
        datasets: [
          {
            label: 'Times in Bad Posture',
            data: badPostureCounts,
            borderColor: 'rgba(75, 192, 192, 1)',
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
              text: 'Days',
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
  }, []); // Empty dependency array ensures the effect runs once on mount

  return (
    <div className="text-center text-[#2a6f6f]">
      <h2 className="text-xl font-bold mb-4">Posture Analysis</h2>
      <canvas id="PostureChart"></canvas>
    </div>
  );
};

export default PostureChart;

