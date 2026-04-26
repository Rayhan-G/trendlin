// src/components/admin/UnifiedAnalytics.jsx - ALL DEVICES COMPATIBLE

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
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
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Calendar, TrendingUp, DollarSign, Eye, MousePointer,
  ChevronDown, RefreshCw, Download, Filter,
  Loader2, AlertCircle, BarChart3, LineChartIcon,
  PieChart, X, Check, Target
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

const SOURCE_CONFIGS = {
  posts: {
    label: 'Posts & Views',
    icon: Eye,
    color: '#3b82f6',
    metrics: [
      { id: 'views', label: 'Views', color: '#3b82f6', yAxisID: 'y' },
      { id: 'posts', label: 'Posts Published', color: '#10b981', yAxisID: 'y1' },
    ],
    tableName: 'posts',
    dateField: 'created_at',
    processData: (data) => data.map(item => ({
      date: item.published_at || item.created_at,
      views: item.views || 0,
      posts: 1,
      title: item.title,
      status: item.status,
    })),
  },
  affiliate: {
    label: 'Affiliate',
    icon: DollarSign,
    color: '#10b981',
    metrics: [
      { id: 'clicks', label: 'Clicks', color: '#8b5cf6', yAxisID: 'y' },
      { id: 'revenue', label: 'Revenue ($)', color: '#10b981', yAxisID: 'y1' },
    ],
    tableName: 'affiliate_links',
    dateField: 'created_at',
    processData: (data) => data.map(item => ({
      date: item.created_at,
      clicks: item.clicks || 0,
      revenue: item.revenue || 0,
      platform: item.platform,
    })),
  },
  revenue: {
    label: 'Revenue',
    icon: TrendingUp,
    color: '#f59e0b',
    metrics: [
      { id: 'revenue', label: 'Revenue ($)', color: '#10b981', yAxisID: 'y' },
    ],
    tableName: 'revenue_entries',
    dateField: 'date',
    processData: (data) => data.map(item => ({
      date: item.date,
      revenue: item.amount || 0,
      source: item.source,
    })),
  },
  ads: {
    label: 'Ads',
    icon: Target,
    color: '#8b5cf6',
    metrics: [
      { id: 'impressions', label: 'Impressions', color: '#8b5cf6', yAxisID: 'y' },
      { id: 'clicks', label: 'Clicks', color: '#3b82f6', yAxisID: 'y1' },
      { id: 'revenue', label: 'Revenue ($)', color: '#10b981', yAxisID: 'y1' },
    ],
    tableName: 'ad_revenue',
    dateField: 'revenue_date',
    processData: (data) => data.map(item => ({
      date: item.revenue_date,
      impressions: item.impressions || 0,
      clicks: item.clicks || 0,
      revenue: item.revenue || 0,
    })),
  },
};

const GROUP_BY_OPTIONS = [
  { id: 'day', label: 'Daily' },
  { id: 'week', label: 'Weekly' },
  { id: 'month', label: 'Monthly' },
];

const DATE_RANGES = [
  { id: '7d', label: '7D', days: 7 },
  { id: '30d', label: '30D', days: 30 },
  { id: '90d', label: '90D', days: 90 },
  { id: '6m', label: '6M', days: 180 },
  { id: '1y', label: '1Y', days: 365 },
  { id: 'all', label: 'All', days: null },
  { id: 'custom', label: 'Custom', days: null },
];

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: LineChartIcon },
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'pie', label: 'Pie', icon: PieChart },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num || 0);
};

const CustomDatePicker = ({ startDate, endDate, onApply, onClose }) => {
  const [start, setStart] = useState(startDate ? new Date(startDate).toISOString().split('T')[0] : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [end, setEnd] = useState(endDate ? new Date(endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  const handleApply = () => {
    if (start && end) {
      onApply(new Date(start), new Date(end + 'T23:59:59'));
      onClose();
    }
  };

  return (
    <div className={`absolute top-full ${isMobile ? 'left-0 right-0' : 'right-0'} mt-2 bg-white rounded-xl shadow-xl border z-50 p-3 sm:p-4 w-auto sm:w-72`}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-semibold text-gray-700">Custom Range</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded active:scale-90">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div>
          <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">Start</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
            max={end}
          />
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs text-gray-500 mb-1">End</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
            min={start}
          />
        </div>
        <div className="flex gap-2 pt-1 sm:pt-2">
          <button onClick={onClose} className="flex-1 py-1.5 sm:py-2 text-xs sm:text-sm border rounded-lg hover:bg-gray-50 active:scale-98">Cancel</button>
          <button onClick={handleApply} className="flex-1 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:scale-98">Apply</button>
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-3 left-3 right-3 sm:bottom-5 sm:right-5 sm:left-auto z-50 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-[calc(100vw-24px)] sm:max-w-md ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      {type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
      <span className="text-xs sm:text-sm">{message}</span>
    </div>
  );
};

export default function UnifiedAnalytics({ 
  defaultSource = 'posts',
  showSourceSelector = true,
  showExport = true,
  title = 'Analytics Dashboard',
  description = 'Comprehensive data analysis'
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isMobile, setIsMobile] = useState(false);
  
  const [selectedSource, setSelectedSource] = useState(defaultSource);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [groupBy, setGroupBy] = useState('day');
  const [dateRange, setDateRange] = useState('30d');
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sourceConfig = SOURCE_CONFIGS[selectedSource];

  useEffect(() => {
    const config = SOURCE_CONFIGS[selectedSource];
    setSelectedMetrics(config.metrics.slice(0, 2).map(m => m.id));
  }, [selectedSource]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured');
      }

      const config = SOURCE_CONFIGS[selectedSource];
      
      let startDate, endDate;
      
      if (dateRange === 'custom' && customDateRange.start && customDateRange.end) {
        startDate = customDateRange.start;
        endDate = customDateRange.end;
      } else {
        const range = DATE_RANGES.find(r => r.id === dateRange);
        endDate = new Date();
        startDate = range?.days 
          ? new Date(Date.now() - range.days * 24 * 60 * 60 * 1000)
          : new Date(0);
      }
      
      const startStr = startDate.toISOString();
      const endStr = endDate.toISOString();
      
      const { data, error: fetchError } = await supabase
        .from(config.tableName)
        .select('*')
        .gte(config.dateField, startStr)
        .lte(config.dateField, endStr)
        .order(config.dateField, { ascending: true });
      
      if (fetchError) throw fetchError;
      
      const processedData = config.processData(data || []);
      setRawData(processedData);
      
      const processed = processChartData(processedData);
      setChartData(processed);
      
      const summary = calculateSummary(processedData);
      setSummaryStats(summary);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load data');
      showToast(err.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSource, dateRange, customDateRange]);

  const processChartData = (data) => {
    if (!data.length) {
      return { labels: [], datasets: [] };
    }
    
    const grouped = {};
    
    data.forEach(item => {
      const date = new Date(item.date);
      let key;
      
      switch (groupBy) {
        case 'week':
          const weekNum = Math.ceil(date.getDate() / 7);
          key = `${date.getFullYear()}-W${weekNum}`;
          break;
        case 'month':
          key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (groupBy === 'month') {
        return new Date(a) - new Date(b);
      }
      return a.localeCompare(b);
    });
    
    const datasets = selectedMetrics.map(metricId => {
      const metricConfig = sourceConfig.metrics.find(m => m.id === metricId);
      
      const dataPoints = sortedKeys.map(key => {
        const items = grouped[key];
        return items.reduce((sum, item) => sum + (item[metricId] || 0), 0);
      });
      
      return {
        label: metricConfig?.label || metricId,
        data: dataPoints,
        borderColor: metricConfig?.color || '#3b82f6',
        backgroundColor: `${metricConfig?.color || '#3b82f6'}20`,
        borderWidth: isMobile ? 1.5 : 2,
        pointRadius: isMobile ? 2 : 3,
        pointHoverRadius: isMobile ? 4 : 6,
        fill: selectedChartType === 'line',
        tension: 0.3,
        yAxisID: metricConfig?.yAxisID || 'y',
      };
    });
    
    const labels = sortedKeys.map(key => {
      if (groupBy === 'day') {
        return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      if (isMobile && key.length > 10) {
        return key.substring(0, 8);
      }
      return key;
    });
    
    return { labels, datasets };
  };

  const calculateSummary = (data) => {
    if (!data.length) return null;
    
    const stats = {};
    
    if (selectedSource === 'posts') {
      stats.totalViews = data.reduce((sum, d) => sum + (d.views || 0), 0);
      stats.totalPosts = data.length;
      stats.avgViews = Math.round(stats.totalViews / data.length);
    } else if (selectedSource === 'affiliate') {
      stats.totalClicks = data.reduce((sum, d) => sum + (d.clicks || 0), 0);
      stats.totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
      stats.epc = stats.totalClicks > 0 ? stats.totalRevenue / stats.totalClicks : 0;
    } else if (selectedSource === 'revenue') {
      stats.totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
      stats.avgPerDay = data.length > 0 ? stats.totalRevenue / data.length : 0;
    } else if (selectedSource === 'ads') {
      stats.totalImpressions = data.reduce((sum, d) => sum + (d.impressions || 0), 0);
      stats.totalClicks = data.reduce((sum, d) => sum + (d.clicks || 0), 0);
      stats.totalRevenue = data.reduce((sum, d) => sum + (d.revenue || 0), 0);
      stats.ctr = stats.totalImpressions > 0 ? (stats.totalClicks / stats.totalImpressions) * 100 : 0;
    }
    
    return stats;
  };

  const handleExport = () => {
    if (!rawData.length) {
      showToast('No data to export', 'error');
      return;
    }
    
    try {
      const headers = Object.keys(rawData[0]);
      const rows = rawData.map(row => 
        headers.map(h => {
          const value = row[h];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSource}-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast(`Exported ${rawData.length} rows`);
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  useEffect(() => {
    if (rawData.length) {
      const processed = processChartData(rawData);
      setChartData(processed);
      const summary = calculateSummary(rawData);
      setSummaryStats(summary);
    }
  }, [groupBy, selectedMetrics, selectedChartType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSourceChange = (source) => {
    setSelectedSource(source);
  };

  const handleCustomDateApply = (start, end) => {
    setCustomDateRange({ start, end });
    setDateRange('custom');
    setShowDatePicker(false);
  };

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { 
        position: 'top', 
        labels: { 
          usePointStyle: true, 
          padding: isMobile ? 8 : 20,
          font: { size: isMobile ? 10 : 12 }
        } 
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: isMobile ? 8 : 12,
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            if (ctx.dataset.label?.includes('Revenue')) {
              return `${ctx.dataset.label}: ${formatCurrency(value)}`;
            }
            return `${ctx.dataset.label}: ${formatNumber(value)}`;
          }
        }
      }
    },
    scales: selectedChartType !== 'pie' ? {
      x: { 
        grid: { display: false },
        ticks: { font: { size: isMobile ? 9 : 12 } }
      },
      y: { 
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: {
          font: { size: isMobile ? 9 : 12 },
          callback: (value) => {
            if (selectedMetrics.some(m => m.includes('revenue'))) {
              return formatCurrency(value);
            }
            return formatNumber(value);
          }
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: { font: { size: isMobile ? 9 : 12 } }
      }
    } : {},
  }), [selectedSource, selectedMetrics, selectedChartType, isMobile]);

  const renderChart = () => {
    if (!chartData?.datasets?.length) {
      return (
        <div className="h-60 sm:h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 size={isMobile ? 32 : 48} className="mx-auto mb-2 sm:mb-3 opacity-30" />
            <p className="text-xs sm:text-sm">No data available</p>
          </div>
        </div>
      );
    }
    
    const ChartComponent = { line: Line, bar: Bar, pie: Pie }[selectedChartType] || Line;
    
    const pieData = selectedChartType === 'pie' ? {
      labels: chartData.labels,
      datasets: chartData.datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
        borderWidth: 0,
      })),
    } : chartData;
    
    return (
      <div className="h-60 sm:h-80">
        <ChartComponent data={pieData} options={chartOptions} />
      </div>
    );
  };

  const renderSummaryCards = () => {
    if (!summaryStats) return null;
    
    const cards = [];
    
    if (selectedSource === 'posts') {
      cards.push(
        { label: 'Total Views', value: formatNumber(summaryStats.totalViews) },
        { label: 'Total Posts', value: summaryStats.totalPosts },
        { label: 'Avg Views/Post', value: formatNumber(summaryStats.avgViews) }
      );
    } else if (selectedSource === 'affiliate') {
      cards.push(
        { label: 'Clicks', value: formatNumber(summaryStats.totalClicks) },
        { label: 'Revenue', value: formatCurrency(summaryStats.totalRevenue) },
        { label: 'EPC', value: formatCurrency(summaryStats.epc) }
      );
    } else if (selectedSource === 'revenue') {
      cards.push(
        { label: 'Total Revenue', value: formatCurrency(summaryStats.totalRevenue) },
        { label: 'Avg Per Day', value: formatCurrency(summaryStats.avgPerDay) }
      );
    } else if (selectedSource === 'ads') {
      cards.push(
        { label: 'Impressions', value: formatNumber(summaryStats.totalImpressions) },
        { label: 'Clicks', value: formatNumber(summaryStats.totalClicks) },
        { label: 'Revenue', value: formatCurrency(summaryStats.totalRevenue) },
        { label: 'CTR', value: `${summaryStats.ctr.toFixed(2)}%` }
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-2 sm:p-4">
            <p className="text-[10px] sm:text-sm text-gray-500">{card.label}</p>
            <p className="text-sm sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1 truncate">{card.value}</p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle size={isMobile ? 32 : 48} className="text-red-400 mx-auto mb-2 sm:mb-3" />
          <p className="text-red-500 text-xs sm:text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 sm:mt-3 text-xs sm:text-sm text-purple-600 hover:underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          {!isMobile && <p className="text-xs sm:text-sm text-gray-500">{description}</p>}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-white border rounded-lg hover:bg-gray-50 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {!isMobile && 'Refresh'}
          </button>
          
          {showExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-black text-white rounded-lg hover:bg-gray-800 active:scale-95"
            >
              <Download size={12} />
              {!isMobile && 'Export'}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 p-2 sm:p-3 bg-white rounded-xl border border-gray-100">
        {showSourceSelector && (
          <>
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              {!isMobile && <span className="text-xs sm:text-sm text-gray-500">Source:</span>}
              <div className="flex gap-0.5 sm:gap-1">
                {Object.entries(SOURCE_CONFIGS).map(([id, config]) => (
                  <button
                    key={id}
                    onClick={() => handleSourceChange(id)}
                    className={`flex items-center gap-0.5 sm:gap-1.5 px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-sm transition active:scale-95 ${
                      selectedSource === id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <config.icon size={isMobile ? 10 : 14} />
                    {!isMobile && config.label}
                  </button>
                ))}
              </div>
            </div>
            {!isMobile && <div className="w-px h-5 bg-gray-200" />}
          </>
        )}

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {!isMobile && <span className="text-xs sm:text-sm text-gray-500">Chart:</span>}
          <div className="flex gap-0.5 sm:gap-1">
            {CHART_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedChartType(type.id)}
                className={`p-1.5 sm:p-2 rounded-lg transition active:scale-95 ${
                  selectedChartType === type.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={type.label}
              >
                <type.icon size={isMobile ? 10 : 14} />
              </button>
            ))}
          </div>
        </div>

        {!isMobile && <div className="w-px h-5 bg-gray-200" />}

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {!isMobile && <span className="text-xs sm:text-sm text-gray-500">Group:</span>}
          <div className="flex gap-0.5 sm:gap-1">
            {GROUP_BY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setGroupBy(opt.id)}
                className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-sm transition active:scale-95 ${
                  groupBy === opt.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!isMobile && <div className="w-px h-5 bg-gray-200" />}

        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto flex-1">
          {!isMobile && <span className="text-xs sm:text-sm text-gray-500">Date:</span>}
          <div className="flex gap-0.5 sm:gap-1">
            {DATE_RANGES.map(range => (
              <button
                key={range.id}
                onClick={() => {
                  if (range.id === 'custom') {
                    setShowDatePicker(true);
                  } else {
                    setDateRange(range.id);
                    setCustomDateRange({ start: null, end: null });
                  }
                }}
                className={`px-1.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-sm transition active:scale-95 whitespace-nowrap ${
                  dateRange === range.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <div className="relative">
            {showDatePicker && (
              <CustomDatePicker
                startDate={customDateRange.start}
                endDate={customDateRange.end}
                onApply={handleCustomDateApply}
                onClose={() => setShowDatePicker(false)}
              />
            )}
          </div>
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setShowMetricSelector(!showMetricSelector)}
            className="flex items-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-3 sm:py-1.5 bg-purple-50 text-purple-700 rounded-lg text-[10px] sm:text-sm active:scale-95"
          >
            <Filter size={isMobile ? 10 : 14} />
            {!isMobile && `Metrics (${selectedMetrics.length})`}
            {isMobile && `${selectedMetrics.length}`}
            <ChevronDown size={isMobile ? 10 : 14} />
          </button>
          
          {showMetricSelector && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-50 p-2 sm:p-3 min-w-[160px] sm:min-w-[200px]">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-500">Metrics</span>
                <button onClick={() => setShowMetricSelector(false)} className="active:scale-90">
                  <X size={12} className="text-gray-400" />
                </button>
              </div>
              {sourceConfig.metrics.map(metric => (
                <label key={metric.id} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 hover:bg-gray-50 rounded cursor-pointer text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric.id]);
                      } else {
                        setSelectedMetrics(selectedMetrics.filter(m => m !== metric.id));
                      }
                    }}
                    className="rounded w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span>{metric.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {renderSummaryCards()}

      <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-5">
        {renderChart()}
      </div>

      {rawData.length > 0 && !isMobile && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">Recent Data</h3>
            <span className="text-[10px] sm:text-xs text-gray-500">{rawData.length} rows</span>
          </div>
          <div className="max-h-48 sm:max-h-64 overflow-y-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500">Date</th>
                  {selectedSource === 'posts' && (
                    <>
                      <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500">Title</th>
                      <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500">Views</th>
                    </>
                  )}
                  {selectedSource === 'affiliate' && (
                    <>
                      <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500">Platform</th>
                      <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500">Clicks</th>
                      <th className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-medium text-gray-500">Revenue</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rawData.slice(0, 5).map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-gray-600 text-[10px] sm:text-xs">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    {selectedSource === 'posts' && (
                      <>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-gray-900 truncate max-w-[120px] sm:max-w-[200px] text-[10px] sm:text-xs">{item.title || '-'}</td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-gray-600 text-[10px] sm:text-xs">{formatNumber(item.views)}</td>
                      </>
                    )}
                    {selectedSource === 'affiliate' && (
                      <>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-gray-900 text-[10px] sm:text-xs">{item.platform || '-'}</td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-gray-600 text-[10px] sm:text-xs">{formatNumber(item.clicks)}</td>
                        <td className="px-2 sm:px-4 py-1.5 sm:py-2 text-right text-gray-600 text-[10px] sm:text-xs">{formatCurrency(item.revenue)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}