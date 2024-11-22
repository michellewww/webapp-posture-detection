import React, { useEffect } from 'react';
function renderPostureChart() {
  const ctx = document.getElementById("PostureChart").getContext("2d");
  const badPostureCounts = Array.from({length: 30}, () => Math.floor(Math.random() * 10));

  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Times in Bad Posture',
        data: badPostureCounts,
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Days' } },
        y: { title: { display: true, text: 'Bad Posture Count' } }
      }
    }
  });
}

function renderHourlyPostureChart() {
  const ctx = document.getElementById("HourlyPostureChart").getContext("2d");
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const hourlyBadPostureCounts = Array.from({ length: 24 }, () => Math.floor(Math.random() * 10));

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: hours,
      datasets: [{
        label: 'Times in Bad Posture (Hourly)',
        data: hourlyBadPostureCounts,
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: { title: { display: true, text: 'Hour of the Day' } },
        y: { title: { display: true, text: 'Bad Posture Count' } }
      }
    }
  });
}

const AnalysisPage = () => {
  useEffect(() => {
    renderPostureChart();
    renderHourlyPostureChart();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold">Posture Analysis</h2>
      <canvas id="PostureChart" className="my-5"></canvas>
      <canvas id="HourlyPostureChart"></canvas>
    </div>
  );
};

export default AnalysisPage;
