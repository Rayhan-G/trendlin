// src/components/admin/ChartWrapper.jsx
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const LineChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const BarChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });
const DoughnutChart = dynamic(() => import('react-chartjs-2').then(mod => mod.Doughnut), { ssr: false });

export const Line = ({ data, options }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    // Register ChartJS components
    import('chart.js').then(({ Chart: ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler }) => {
      ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);
    });
  }, []);
  
  if (!isClient) return <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />;
  return <LineChart data={data} options={options} />;
};

export const Bar = ({ data, options }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    import('chart.js').then(({ Chart: ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend }) => {
      ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
    });
  }, []);
  
  if (!isClient) return <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />;
  return <BarChart data={data} options={options} />;
};

export const Doughnut = ({ data, options }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    import('chart.js').then(({ Chart: ChartJS, ArcElement, Tooltip, Legend }) => {
      ChartJS.register(ArcElement, Tooltip, Legend);
    });
  }, []);
  
  if (!isClient) return <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />;
  return <DoughnutChart data={data} options={options} />;
};