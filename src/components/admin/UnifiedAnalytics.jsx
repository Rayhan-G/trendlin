// src/components/admin/UnifiedAnalytics.jsx - COMPLETE FIXED VERSION
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

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

// ============================================================
// CONFIGURATION FOR EACH DATA SOURCE
// ============================================================
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
    label: 'Affiliate Performance',
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
    label: 'Ad Performance',
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
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: '6m', label: '6 Months', days: 180 },
  { id: '1y', label: '1 Year', days: 365 },
  { id: 'all', label: 'All Time', days: null },
  { id: 'custom', label: 'Custom', days: null },
];

const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: LineChartIcon },
  { id: 'bar', label: 'Bar', icon: BarChart3 },
  { id: 'pie', label: 'Pie', icon: PieChart },
];

// ============================================================
// FORMATTING HELPERS
// ============================================================
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

// ============================================================
// CUSTOM DATE RANGE PICKER
// ============================================================
const CustomDatePicker = ({ startDate, endDate, onApply, onClose }) => {
  const [start, setStart] = useState(startDate ? new Date(startDate).toISOString().split('T')[0] : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [end, setEnd] = useState(endDate ? new Date(endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  const handleApply = () => {
    if (start && end) {
      onApply(new Date(start), new Date(end + 'T23:59:59'));
      onClose();
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border z-50 p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">Custom Date Range</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
            max={end}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500"
            min={start}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleApply} className="flex-1 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">Apply</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TOAST COMPONENT
// ============================================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      {type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function UnifiedAnalytics({ 
  defaultSource = 'posts',
  showSourceSelector = true,
  showExport = true,
  title = 'Analytics Dashboard',
  description = 'Comprehensive data analysis'
}) {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Configuration
  const [selectedSource, setSelectedSource] = useState(defaultSource);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [groupBy, setGroupBy] = useState('day');
  const [dateRange, setDateRange] = useState('30d');
  const [showMetricSelector, setShowMetricSelector] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  
  // Data
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);

  const sourceConfig = SOURCE_CONFIGS[selectedSource];

  // Initialize selected metrics when source changes
  useEffect(() => {
    const config = SOURCE_CONFIGS[selectedSource];
    setSelectedMetrics(config.metrics.slice(0, 2).map(m => m.id));
  }, [selectedSource]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // ============================================================
  // FETCH DATA
  // ============================================================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Database connection not configured');
      }

      const config = SOURCE_CONFIGS[selectedSource];
      
      // Calculate date range
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
      
      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from(config.tableName)
        .select('*')
        .gte(config.dateField, startStr)
        .lte(config.dateField, endStr)
        .order(config.dateField, { ascending: true });
      
      if (fetchError) throw fetchError;
      
      const processedData = config.processData(data || []);
      setRawData(processedData);
      
      // Process for chart
      const processed = processChartData(processedData);
      setChartData(processed);
      
      // Calculate summary
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

  // ============================================================
  // PROCESS CHART DATA
  // ============================================================
  const processChartData = (data) => {
    if (!data.length) {
      return { labels: [], datasets: [] };
    }
    
    // Group by selected period
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
    
    // Create datasets for selected metrics
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
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        fill: selectedChartType === 'line',
        tension: 0.3,
        yAxisID: metricConfig?.yAxisID || 'y',
      };
    });
    
    // Format labels
    const labels = sortedKeys.map(key => {
      if (groupBy === 'day') {
        return new Date(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return key;
    });
    
    return { labels, datasets };
  };

  // ============================================================
  // CALCULATE SUMMARY STATS
  // ============================================================
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

  // ============================================================
  // EXPORT FUNCTION
  // ============================================================
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
      
      showToast(`Exported ${rawData.length} rows successfully`);
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export data', 'error');
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
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

  // ============================================================
  // HANDLERS
  // ============================================================
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
  };

  // ============================================================
  // CHART OPTIONS
  // ============================================================
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            if (ctx.dataset.label?.includes('Revenue') || ctx.dataset.label?.includes('$')) {
              return `${ctx.dataset.label}: ${formatCurrency(value)}`;
            }
            return `${ctx.dataset.label}: ${formatNumber(value)}`;
          }
        }
      }
    },
    scales: selectedChartType !== 'pie' ? {
      x: { grid: { display: false } },
      y: { 
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
        ticks: {
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
      }
    } : {},
  }), [selectedSource, selectedMetrics, selectedChartType]);

  // ============================================================
  // RENDER CHART
  // ============================================================
  const renderChart = () => {
    if (!chartData?.datasets?.length) {
      return (
        <div className="h-80 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
            <p>No data available for the selected period</p>
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
      <div className="h-80">
        <ChartComponent data={pieData} options={chartOptions} />
      </div>
    );
  };

  // ============================================================
  // RENDER SUMMARY CARDS
  // ============================================================
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
        { label: 'Total Clicks', value: formatNumber(summaryStats.totalClicks) },
        { label: 'Total Revenue', value: formatCurrency(summaryStats.totalRevenue) },
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-500">{error}</p>
          <button onClick={fetchData} className="mt-3 text-sm text-purple-600 hover:underline">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          
          {showExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800"
            >
              <Download size={14} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
        {/* Source Selector */}
        {showSourceSelector && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Source:</span>
              <div className="flex gap-1">
                {Object.entries(SOURCE_CONFIGS).map(([id, config]) => (
                  <button
                    key={id}
                    onClick={() => handleSourceChange(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                      selectedSource === id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <config.icon size={14} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="w-px h-6 bg-gray-200" />
          </>
        )}

        {/* Chart Type */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Chart:</span>
          <div className="flex gap-1">
            {CHART_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedChartType(type.id)}
                className={`p-2 rounded-lg transition ${
                  selectedChartType === type.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={type.label}
              >
                <type.icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Group By */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Group:</span>
          <div className="flex gap-1">
            {GROUP_BY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setGroupBy(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
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

        <div className="w-px h-6 bg-gray-200" />

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Date:</span>
          <div className="flex gap-1">
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
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  dateRange === range.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          {/* Custom Date Picker */}
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
          
          {/* Show custom date range indicator */}
          {dateRange === 'custom' && customDateRange.start && customDateRange.end && (
            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              {new Date(customDateRange.start).toLocaleDateString()} - {new Date(customDateRange.end).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Metric Selector */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowMetricSelector(!showMetricSelector)}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm"
          >
            <Filter size={14} />
            Metrics ({selectedMetrics.length})
            <ChevronDown size={14} />
          </button>
          
          {showMetricSelector && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border z-50 p-3 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500">Select Metrics</span>
                <button onClick={() => setShowMetricSelector(false)}>
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
              {sourceConfig.metrics.map(metric => (
                <label key={metric.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
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
                    className="rounded"
                  />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }} />
                  <span className="text-sm">{metric.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Main Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        {renderChart()}
      </div>

      {/* Data Table */}
      {rawData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Data</h3>
            <span className="text-xs text-gray-500">{rawData.length} total rows</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                  {selectedSource === 'posts' && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Title</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Views</th>
                    </>
                  )}
                  {selectedSource === 'affiliate' && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Platform</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Clicks</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Revenue</th>
                    </>
                  )}
                  {selectedSource === 'revenue' && (
                    <>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Source</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                    </>
                  )}
                  {selectedSource === 'ads' && (
                    <>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Impressions</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Clicks</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Revenue</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rawData.slice(0, 10).map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    {selectedSource === 'posts' && (
                      <>
                        <td className="px-4 py-2 text-gray-900 truncate max-w-[200px]">{item.title || '-'}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatNumber(item.views)}</td>
                      </>
                    )}
                    {selectedSource === 'affiliate' && (
                      <>
                        <td className="px-4 py-2 text-gray-900">{item.platform || '-'}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatNumber(item.clicks)}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.revenue)}</td>
                      </>
                    )}
                    {selectedSource === 'revenue' && (
                      <>
                        <td className="px-4 py-2 text-gray-900 capitalize">{item.source?.replace('_', ' ') || '-'}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.revenue)}</td>
                      </>
                    )}
                    {selectedSource === 'ads' && (
                      <>
                        <td className="px-4 py-2 text-right text-gray-600">{formatNumber(item.impressions)}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatNumber(item.clicks)}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.revenue)}</td>
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