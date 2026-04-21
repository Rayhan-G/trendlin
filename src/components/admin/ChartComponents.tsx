// src/components/admin/ChartComponents.jsx
'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: 12,
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
    },
  },
};

export default function ChartComponents({ chartData, topPosts }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { viewsTrend, categoryData, statusData, weeklyData } = chartData;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Views Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full" />
          Views Trend (14 Days)
        </h3>
        <div className="h-64">
          {viewsTrend.labels.length > 0 ? (
            <Line
              data={{
                labels: viewsTrend.labels,
                datasets: [{
                  data: viewsTrend.values,
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 2,
                  pointHoverRadius: 6,
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full" />
          Views by Category
        </h3>
        <div className="h-64">
          {categoryData.labels.length > 0 ? (
            <Bar
              data={{
                labels: categoryData.labels,
                datasets: [{
                  data: categoryData.values,
                  backgroundColor: '#10b981',
                  borderRadius: 6,
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-500 rounded-full" />
          Content Status
        </h3>
        <div className="h-64">
          {statusData.values.some(v => v > 0) ? (
            <Doughnut
              data={{
                labels: statusData.labels,
                datasets: [{
                  data: statusData.values,
                  backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
                  borderWidth: 0,
                }]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { display: true, position: 'bottom' },
                },
                cutout: '60%',
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full" />
          Weekly Performance
        </h3>
        <div className="h-64">
          {weeklyData.labels.length > 0 ? (
            <Bar
              data={{
                labels: weeklyData.labels,
                datasets: [{
                  data: weeklyData.values,
                  backgroundColor: '#f59e0b',
                  borderRadius: 6,
                }]
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>
      </div>
    </div>
  );
}