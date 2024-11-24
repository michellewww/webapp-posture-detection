import React, { useEffect } from 'react';
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

