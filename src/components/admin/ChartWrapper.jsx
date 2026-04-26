// src/components/admin/ChartWrapper.jsx
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { 
  ssr: false,
  loading: () => <ChartSkeleton type="line" />
});
const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { 
  ssr: false,
  loading: () => <ChartSkeleton type="bar" />
});
const DoughnutChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { 
  ssr: false,
  loading: () => <ChartSkeleton type="doughnut" />
});

// Skeleton Component
const ChartSkeleton = ({ type }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className={`skeleton-wrapper skeleton-${type}`}>
      <div className="skeleton-card">
        <div className="skeleton-header">
          <div className="skeleton-title" />
        </div>
        <div className="skeleton-content">
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
          <div className="skeleton-bar" />
        </div>
      </div>
      <style jsx>{`
        .skeleton-wrapper {
          width: 100%;
          height: 100%;
        }
        .skeleton-card {
          background: #f9fafb;
          border-radius: 12px;
          padding: ${isMobile ? '0.75rem' : '1rem'};
          height: 100%;
          min-height: ${type === 'doughnut' ? '250px' : '280px'};
          display: flex;
          flex-direction: column;
        }
        :global(.dark) .skeleton-card {
          background: #1f2937;
        }
        .skeleton-header {
          margin-bottom: ${isMobile ? '0.75rem' : '1rem'};
        }
        .skeleton-title {
          width: 40%;
          height: ${isMobile ? '16px' : '20px'};
          background: linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        :global(.dark) .skeleton-title {
          background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
        }
        .skeleton-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: ${isMobile ? '0.5rem' : '0.75rem'};
        }
        .skeleton-bar {
          height: ${isMobile ? '30px' : '40px'};
          background: linear-gradient(90deg, #e5e7eb 25%, #d1d5db 50%, #e5e7eb 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }
        :global(.dark) .skeleton-bar {
          background: linear-gradient(90deg, #374151 25%, #4b5563 50%, #374151 75%);
        }
        .skeleton-doughnut .skeleton-content {
          align-items: center;
        }
        .skeleton-doughnut .skeleton-bar {
          width: ${isMobile ? '80px' : '120px'};
          height: ${isMobile ? '80px' : '120px'};
          border-radius: 50%;
          margin: 0 auto;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .skeleton-title, .skeleton-bar {
            animation: none;
          }
        }
        @media (max-width: 768px) {
          .skeleton-card {
            min-height: ${type === 'doughnut' ? '200px' : '230px'};
          }
        }
        @media (max-width: 480px) {
          .skeleton-card {
            min-height: ${type === 'doughnut' ? '180px' : '200px'};
          }
        }
      `}</style>
    </div>
  );
};

// Responsive options generator
const getResponsiveOptions = (type, isMobile, isTablet) => {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type !== 'line' && type !== 'bar',
        position: 'bottom',
        labels: {
          font: {
            size: isMobile ? 10 : isTablet ? 11 : 12,
            family: "'Inter', system-ui, -apple-system, sans-serif"
          },
          boxWidth: isMobile ? 10 : 12,
          padding: isMobile ? 8 : 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        titleFont: {
          size: isMobile ? 11 : 13,
          weight: 'bold',
        },
        bodyFont: {
          size: isMobile ? 10 : 12,
        },
        padding: isMobile ? 8 : 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            let value = context.raw;
            if (value >= 1000000) {
              return `${label}: ${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${label}: ${(value / 1000).toFixed(1)}k`;
            }
            return `${label}: ${value}`;
          }
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    onHover: (event, chartElement) => {
      event.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
    },
  };

  if (type === 'line') {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: isMobile ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.08)',
            drawBorder: false,
          },
          ticks: {
            font: { size: isMobile ? 10 : 12 },
            callback: (value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            },
            maxTicksLimit: isMobile ? 5 : 8,
          },
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: isMobile ? 9 : 12 },
            maxRotation: isMobile ? 45 : 0,
            minRotation: isMobile ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 6 : 10,
          },
        },
      },
      elements: {
        point: {
          radius: isMobile ? 2 : 3,
          hoverRadius: isMobile ? 5 : 7,
          hitRadius: isMobile ? 15 : 10,
        },
        line: {
          tension: 0.3,
          borderWidth: isMobile ? 1.5 : 2,
        },
      },
    };
  }

  if (type === 'bar') {
    return {
      ...baseOptions,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: isMobile ? 'rgba(0,0,0,0.05)' : 'rgba(0,0,0,0.08)',
            drawBorder: false,
          },
          ticks: {
            font: { size: isMobile ? 10 : 12 },
            callback: (value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            },
            maxTicksLimit: isMobile ? 5 : 8,
          },
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: isMobile ? 10 : 12 },
            maxRotation: isMobile ? 45 : 20,
            minRotation: isMobile ? 45 : 0,
            autoSkip: true,
            maxTicksLimit: isMobile ? 5 : 8,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: isMobile ? 4 : 6,
          borderSkipped: false,
        },
      },
    };
  }

  if (type === 'doughnut') {
    return {
      ...baseOptions,
      cutout: isMobile ? '65%' : '60%',
      plugins: {
        ...baseOptions.plugins,
        legend: {
          ...baseOptions.plugins.legend,
          position: isMobile ? 'bottom' : 'right',
          align: 'center',
          labels: {
            ...baseOptions.plugins.legend.labels,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => ({
                  text: isMobile && label.length > 15 ? label.substring(0, 12) + '...' : label,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  index: i,
                  hidden: false,
                }));
              }
              return [];
            }
          }
        },
        tooltip: {
          ...baseOptions.plugins.tooltip,
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      },
      layout: {
        padding: {
          left: isMobile ? 5 : 10,
          right: isMobile ? 5 : 10,
          top: isMobile ? 5 : 10,
          bottom: isMobile ? 5 : 10,
        },
      },
    };
  }

  return baseOptions;
};

// Main Chart Components
export const Line = ({ data, options = {} }) => {
  const [isClient, setIsClient] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Register ChartJS components
    import('chart.js').then(({ Chart: ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler }) => {
      ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
    });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!isClient) return <ChartSkeleton type="line" />;
  
  const responsiveOptions = {
    ...getResponsiveOptions('line', isMobile, isTablet),
    ...options,
  };
  
  return (
    <div className="chart-wrapper line-chart">
      <LineChart data={data} options={responsiveOptions} />
      <style jsx>{`
        .chart-wrapper {
          width: 100%;
          height: 100%;
          min-height: 200px;
          position: relative;
        }
        @media (max-width: 768px) {
          .line-chart :global(canvas) {
            touch-action: pan-x pan-y;
          }
        }
      `}</style>
    </div>
  );
};

export const Bar = ({ data, options = {} }) => {
  const [isClient, setIsClient] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    import('chart.js').then(({ Chart: ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend }) => {
      ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
    });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!isClient) return <ChartSkeleton type="bar" />;
  
  const responsiveOptions = {
    ...getResponsiveOptions('bar', isMobile, isTablet),
    ...options,
  };
  
  return (
    <div className="chart-wrapper bar-chart">
      <BarChart data={data} options={responsiveOptions} />
      <style jsx>{`
        .chart-wrapper {
          width: 100%;
          height: 100%;
          min-height: 200px;
        }
        @media (max-width: 768px) {
          .bar-chart :global(canvas) {
            touch-action: pan-x pan-y;
          }
        }
      `}</style>
    </div>
  );
};

export const Doughnut = ({ data, options = {} }) => {
  const [isClient, setIsClient] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    import('chart.js').then(({ Chart: ChartJS, ArcElement, Tooltip, Legend }) => {
      ChartJS.register(ArcElement, Tooltip, Legend);
    });
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (!isClient) return <ChartSkeleton type="doughnut" />;
  
  const responsiveOptions = {
    ...getResponsiveOptions('doughnut', isMobile, isTablet),
    ...options,
  };
  
  return (
    <div className="chart-wrapper doughnut-chart">
      <DoughnutChart data={data} options={responsiveOptions} />
      <style jsx>{`
        .chart-wrapper {
          width: 100%;
          height: 100%;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .doughnut-chart {
            min-height: 180px;
          }
          .doughnut-chart :global(canvas) {
            max-width: 100%;
            height: auto !important;
          }
        }
        @media (max-width: 480px) {
          .doughnut-chart {
            min-height: 160px;
          }
        }
      `}</style>
    </div>
  );
};

// Optional: Export a hook for responsive charts
export const useResponsiveChart = () => {
  const [dimensions, setDimensions] = useState({
    width: 1200,
    height: 400,
    isMobile: false,
    isTablet: false,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return dimensions;
};