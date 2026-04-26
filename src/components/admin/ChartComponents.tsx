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

const getResponsiveOptions = (isMobile, isTablet) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      display: !isMobile,
      position: 'bottom',
      labels: {
        font: { size: isMobile ? 10 : 12 },
        boxWidth: isMobile ? 8 : 12,
        padding: isMobile ? 8 : 12,
      }
    },
    tooltip: {
      backgroundColor: '#1e293b',
      padding: isMobile ? 8 : 12,
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      titleFont: { size: isMobile ? 11 : 13 },
      bodyFont: { size: isMobile ? 10 : 12 },
      cornerRadius: 6,
      displayColors: true,
    },
  },
  layout: {
    padding: {
      left: isMobile ? 5 : 10,
      right: isMobile ? 5 : 10,
      top: isMobile ? 5 : 10,
      bottom: isMobile ? 5 : 10,
    },
  },
});

export default function ChartComponents({ chartData, topPosts }) {
  const [mounted, setMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) {
    return (
      <div className="chart-skeleton">
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
        <style jsx>{`
          .chart-skeleton {
            width: 100%;
          }
          .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
            gap: 1.5rem;
          }
          .skeleton-card {
            height: clamp(250px, 40vh, 320px);
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 12px;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @media (max-width: 768px) {
            .skeleton-grid { gap: 1rem; }
          }
          @media (prefers-reduced-motion: reduce) {
            .skeleton-card { animation: none; background: #f0f0f0; }
          }
        `}</style>
      </div>
    );
  }

  const { viewsTrend, categoryData, statusData, weeklyData } = chartData;
  const responsiveOptions = getResponsiveOptions(isMobile, isTablet);

  // Enhanced chart options for mobile
  const lineChartOptions = {
    ...responsiveOptions,
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: { 
          font: { size: isMobile ? 10 : 12 },
          stepSize: isMobile ? undefined : undefined,
          callback: (value) => isMobile && value >= 1000 ? `${(value/1000).toFixed(0)}k` : value,
        }
      },
      x: { 
        grid: { display: false },
        ticks: { 
          font: { size: isMobile ? 9 : 12 },
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 6 : 10,
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: isMobile ? 1 : 2,
        hoverRadius: isMobile ? 4 : 6,
      },
      line: {
        tension: 0.3,
        borderWidth: isMobile ? 1.5 : 2,
      },
    },
  };

  const barChartOptions = {
    ...responsiveOptions,
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: '#f1f5f9' },
        ticks: { 
          font: { size: isMobile ? 10 : 12 },
          callback: (value) => isMobile && value >= 1000 ? `${(value/1000).toFixed(0)}k` : value,
        }
      },
      x: { 
        grid: { display: false },
        ticks: { 
          font: { size: isMobile ? 10 : 12 },
          maxRotation: isMobile ? 45 : 20,
          minRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 4 : 8,
        }
      },
    },
    plugins: {
      ...responsiveOptions.plugins,
      tooltip: {
        ...responsiveOptions.plugins.tooltip,
        callbacks: {
          label: (context) => {
            let value = context.raw;
            return `${context.dataset.label || 'Views'}: ${value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}`;
          }
        }
      }
    },
  };

  const doughnutOptions = {
    ...responsiveOptions,
    cutout: isMobile ? '65%' : '60%',
    plugins: {
      ...responsiveOptions.plugins,
      legend: { 
        display: true, 
        position: isMobile ? 'bottom' : 'bottom',
        labels: {
          font: { size: isMobile ? 10 : 12 },
          boxWidth: isMobile ? 10 : 12,
          padding: isMobile ? 8 : 12,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: isMobile && label.length > 15 ? label.substring(0, 12) + '...' : label,
                fillStyle: data.datasets[0].backgroundColor[i],
                index: i,
              }));
            }
            return [];
          }
        }
      },
    },
  };

  return (
    <div className="chart-components">
      <div className="charts-grid">
        {/* Views Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-indicator blue" />
            <h3 className="chart-title">Views Trend (14 Days)</h3>
            {isMobile && (
              <span className="chart-badge">Last 2 weeks</span>
            )}
          </div>
          <div className="chart-container">
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
                    pointRadius: isMobile ? 2 : 3,
                    pointHoverRadius: isMobile ? 5 : 6,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1,
                  }]
                }}
                options={lineChartOptions}
              />
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-indicator emerald" />
            <h3 className="chart-title">Views by Category</h3>
          </div>
          <div className="chart-container">
            {categoryData.labels.length > 0 ? (
              <Bar
                data={{
                  labels: categoryData.labels.map(label => 
                    isMobile && label.length > 12 ? label.substring(0, 10) + '...' : label
                  ),
                  datasets: [{
                    data: categoryData.values,
                    backgroundColor: '#10b981',
                    borderRadius: isMobile ? 4 : 6,
                    barPercentage: isMobile ? 0.7 : 0.8,
                    categoryPercentage: isMobile ? 0.8 : 0.9,
                  }]
                }}
                options={barChartOptions}
              />
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p>No category data</p>
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-indicator purple" />
            <h3 className="chart-title">Content Status</h3>
          </div>
          <div className="chart-container doughnut-container">
            {statusData.values.some(v => v > 0) ? (
              <Doughnut
                data={{
                  labels: statusData.labels,
                  datasets: [{
                    data: statusData.values,
                    backgroundColor: ['#10b981', '#f59e0b', '#8b5cf6'],
                    borderWidth: 0,
                    hoverOffset: isMobile ? 5 : 10,
                  }]
                }}
                options={doughnutOptions}
              />
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No status data</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="header-indicator amber" />
            <h3 className="chart-title">Weekly Performance</h3>
            {isMobile && (
              <span className="chart-badge">Last 7 weeks</span>
            )}
          </div>
          <div className="chart-container">
            {weeklyData.labels.length > 0 ? (
              <Bar
                data={{
                  labels: weeklyData.labels.map(label => 
                    isMobile && label.length > 8 ? label.substring(0, 4) : label
                  ),
                  datasets: [{
                    data: weeklyData.values,
                    backgroundColor: '#f59e0b',
                    borderRadius: isMobile ? 4 : 6,
                    barPercentage: isMobile ? 0.7 : 0.8,
                    categoryPercentage: isMobile ? 0.8 : 0.9,
                  }]
                }}
                options={barChartOptions}
              />
            ) : (
              <div className="empty-state">
                <svg className="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p>No weekly data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .chart-components {
          width: 100%;
          overflow-x: hidden;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr));
          gap: 1.5rem;
        }

        .chart-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 1.25rem;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          min-width: 0; /* Prevent overflow */
        }

        .chart-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .header-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .header-indicator.blue { background: #3b82f6; }
        .header-indicator.emerald { background: #10b981; }
        .header-indicator.purple { background: #8b5cf6; }
        .header-indicator.amber { background: #f59e0b; }

        .chart-title {
          font-weight: 500;
          color: #111827;
          margin: 0;
          font-size: clamp(0.875rem, 4vw, 1rem);
          flex: 1;
        }

        .chart-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          background: #f3f4f6;
          border-radius: 20px;
          color: #6b7280;
          white-space: nowrap;
        }

        .chart-container {
          position: relative;
          height: clamp(200px, 35vh, 280px);
          width: 100%;
          min-height: 200px;
        }

        .doughnut-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #9ca3af;
          text-align: center;
        }

        .empty-icon {
          width: clamp(32px, 8vw, 48px);
          height: clamp(32px, 8vw, 48px);
          stroke: #d1d5db;
        }

        .empty-state p {
          font-size: clamp(0.75rem, 3vw, 0.875rem);
          margin: 0;
        }

        /* Dark mode support */
        :global(.dark) .chart-card {
          background: #1f2937;
          border-color: #374151;
        }

        :global(.dark) .chart-title {
          color: #f9fafb;
        }

        :global(.dark) .chart-badge {
          background: #374151;
          color: #9ca3af;
        }

        :global(.dark) .empty-state {
          color: #6b7280;
        }

        :global(.dark) .empty-icon {
          stroke: #4b5563;
        }

        /* Responsive breakpoints */
        @media (max-width: 1024px) {
          .charts-grid {
            gap: 1.25rem;
          }
          .chart-card {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .chart-card {
            padding: 0.875rem;
          }
          .chart-container {
            height: clamp(180px, 30vh, 250px);
          }
        }

        @media (max-width: 640px) {
          .chart-card {
            padding: 0.75rem;
          }
          .chart-header {
            margin-bottom: 0.75rem;
          }
          .chart-container {
            height: clamp(160px, 28vh, 220px);
          }
        }

        @media (max-width: 480px) {
          .charts-grid {
            gap: 0.875rem;
          }
          .chart-container {
            height: clamp(140px, 25vh, 200px);
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .chart-card {
            cursor: pointer;
          }
          .chart-card:active {
            transform: scale(0.99);
          }
        }

        /* Landscape mode on mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .charts-grid {
            grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
          }
          .chart-container {
            height: clamp(160px, 35vh, 240px);
          }
        }

        /* Print styles */
        @media print {
          .chart-card {
            break-inside: avoid;
            border: 1px solid #ddd;
            background: white;
          }
          .chart-container {
            height: 200px;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .chart-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}