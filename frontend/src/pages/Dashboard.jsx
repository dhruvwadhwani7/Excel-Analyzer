import { useState, useEffect } from 'react';
import { FaFileAlt, FaChartPie, FaDatabase, FaFileExcel, FaFileCsv, FaUpload, FaChartLine, FaUserCircle, FaChartBar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartStats, setChartStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const [fileStatsRes, chartStatsRes] = await Promise.all([
          fetch('https://excel-analyzer-1.onrender.com/api/files/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('https://excel-analyzer-1.onrender.com/api/charts/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const fileData = await fileStatsRes.json();
        const chartData = await chartStatsRes.json();

        if (fileData.success) setStats(fileData.stats);
        if (chartData.success) setChartStats(chartData.stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllStats();
  }, []);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const ActionButton = ({ icon, title, description, onClick }) => {
    // Safely handle the icon component
    const IconComponent = icon || FaFileAlt; // Fallback icon
    
    return (
      <button 
        onClick={onClick}
        className="p-4 bg-[#1e293b] rounded-lg text-left hover:bg-[#1e293b]/80 transition-all 
                   hover:transform hover:scale-105 hover:shadow-lg hover:shadow-[#be185d]/10"
      >
        <div className="flex items-center gap-3 mb-2">
          <IconComponent className="text-[#be185d] text-xl" />
          <h3 className="text-white font-bold">{title}</h3>
        </div>
        <p className="text-sm text-gray-400">{description}</p>
      </button>
    );
  };

  const ChartStatsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#0f172a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Charts Created</h3>
          <FaChartLine className="text-[#be185d]" />
        </div>
        <p className="text-3xl font-bold text-white">{chartStats?.totalCharts || 0}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-gray-400 flex justify-between">
            <span>2D Charts:</span>
            <span className="text-white">{chartStats?.dimensions['2d'] || 0}</span>
          </p>
          <p className="text-sm text-gray-400 flex justify-between">
            <span>3D Charts:</span>
            <span className="text-white">{chartStats?.dimensions['3d'] || 0}</span>
          </p>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Chart Types</h3>
          <FaChartPie className="text-[#be185d]" />
        </div>
        <div className="space-y-2">
          {chartStats?.chartTypes && Object.entries(chartStats.chartTypes)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => (
              <p key={type} className="text-sm text-gray-400 flex justify-between">
                <span>{type}:</span>
                <span className="text-white">{count}</span>
              </p>
            ))}
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Recent Charts</h3>
          <button 
            onClick={() => navigate('/profile#chart-history')}
            className="text-[#be185d] hover:text-[#be185d]/80 text-sm"
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {chartStats?.recentCharts?.slice(0, 3).map(chart => (
            <div key={chart._id} className="text-sm group hover:bg-[#1e293b] p-2 rounded-lg transition-all">
              <p className="text-white font-medium group-hover:text-[#be185d] transition-colors">{chart.title || 'Untitled Chart'}</p>
              <p className="text-gray-400">
                {chart.dimension.toUpperCase()} - {chart.chartType}
                <br />
                {new Date(chart.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {(!chartStats?.recentCharts || chartStats.recentCharts.length === 0) && (
            <p className="text-gray-400 text-center py-2">No charts created yet</p>
          )}
        </div>
      </div>
    </div>
  );

  const UsageStatsSection = () => (
    <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-6">Usage Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">Data Processing</h3>
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 rounded-full bg-[#be185d]/20 flex items-center justify-center">
              <span className="text-[#be185d] text-xl font-bold">{stats?.totalRows || 0}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Rows</p>
              <p className="text-white font-medium">Processed</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">Active Charts</h3>
          <div className="flex items-center justify-between">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 text-xl font-bold">{chartStats?.activeCharts || 0}</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Currently</p>
              <p className="text-white font-medium">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">Data Types</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Numeric</span>
              <span className="text-white">{stats?.dataTypes?.numeric || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Text</span>
              <span className="text-white">{stats?.dataTypes?.text || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Date</span>
              <span className="text-white">{stats?.dataTypes?.date || 0}</span>
            </div>
          </div>
        </div>
        <div className="bg-[#1e293b] p-4 rounded-lg">
          <h3 className="text-white font-medium mb-2">Processing Time</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average</span>
              <span className="text-white">{stats?.avgProcessingTime || '0.0'}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Fastest</span>
              <span className="text-green-500">{stats?.fastestProcessing || '0.0'}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Slowest</span>
              <span className="text-yellow-500">{stats?.slowestProcessing || '0.0'}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentChartsPreview = () => (
    <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Chart Previews</h2>
        <button 
          onClick={() => navigate('/analytics')}
          className="text-[#be185d] hover:text-[#be185d]/80 text-sm"
        >
          View All Charts →
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {chartStats?.recentCharts?.slice(0, 3).map(chart => (
          <div key={chart._id} className="bg-[#1e293b] rounded-lg p-4 hover:bg-[#1e293b]/80 transition-all cursor-pointer">
            <div className="aspect-w-16 aspect-h-9 mb-4 bg-[#0f172a] rounded-lg overflow-hidden">
              {/* Chart preview image or placeholder */}
              <div className="w-full h-full flex items-center justify-center">
                {chart.chartType.includes('pie') ? (
                  <FaChartPie className="text-4xl text-[#be185d]" />
                ) : chart.chartType.includes('line') ? (
                  <FaChartLine className="text-4xl text-[#be185d]" />
                ) : (
                  <FaChartBar className="text-4xl text-[#be185d]" />
                )}
              </div>
            </div>
            <h3 className="text-white font-medium mb-2">{chart.title || 'Untitled Chart'}</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{chart.chartType}</span>
              <span className="text-[#be185d]">{new Date(chart.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 ">
      {/* Welcome Section */}
      <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
    {/* Left section */}
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
        Welcome back, {user?.name || 'User'}!
      </h1>
      <p className="text-gray-400 text-sm md:text-base">
        Your last login was {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
      </p>
    </div>

    {/* Right section (buttons) */}
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <ActionButton
        icon={FaUpload}
        title="Upload New File"
        description="Upload Excel or CSV files"
        onClick={() => navigate('/upload')}
      />
      <ActionButton
        icon={FaChartLine}
        title="Analytics"
        description="View your data insights"
        onClick={() => navigate('/analytics')}
      />
    </div>
  </div>
</div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f172a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Files Uploaded</h3>
            <FaFileAlt className="text-[#be185d]" />
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalFiles || 0}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-400 flex justify-between">
              <span>XLSX Files:</span>
              <span className="text-white">{stats?.fileTypes.xlsx || 0}</span>
            </p>
            <p className="text-sm text-gray-400 flex justify-between">
              <span>XLS Files:</span>
              <span className="text-white">{stats?.fileTypes.xls || 0}</span>
            </p>
            <p className="text-sm text-gray-400 flex justify-between">
              <span>CSV Files:</span>
              <span className="text-white">{stats?.fileTypes.csv || 0}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Processing Status</h3>
            <FaChartPie className="text-[#be185d]" />
          </div>
          <p className="text-3xl font-bold text-green-500">
            {stats?.processingStatus.processed || 0}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-400 flex justify-between">
              <span>Processing:</span>
              <span className="text-yellow-500">{stats?.processingStatus.processing || 0}</span>
            </p>
            <p className="text-sm text-gray-400 flex justify-between">
              <span>Failed:</span>
              <span className="text-red-500">{stats?.processingStatus.failed || 0}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Storage Used</h3>
            <FaDatabase className="text-[#be185d]" />
          </div>
          <p className="text-3xl font-bold text-white">{formatSize(stats?.totalSize || 0)}</p>
          <p className="text-sm text-gray-400 mt-2">Total storage used</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ActionButton
          icon={FaUpload}
          title="Upload Files"
          description="Upload new Excel or CSV files"
          onClick={() => navigate('/upload')}
        />
        <ActionButton
          icon={FaChartLine}
          title="View Analytics"
          description="See insights from your data"
          onClick={() => navigate('/analytics')}
        />
        <ActionButton
          icon={FaUserCircle}
          title="Profile Settings"
          description="Update your account details"
          onClick={() => navigate('/profile')}
        />
      </div>

      {/* Chart Analytics */}
      {!loading && chartStats && (
        <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Chart Analytics</h2>
            <button 
              onClick={() => navigate('/analytics')}
              className="text-[#be185d] hover:text-[#be185d]/80 text-sm"
            >
              Create Chart →
            </button>
          </div>
          <ChartStatsSection />
        </div>
      )}

      {/* Recent Activity - Modified */}
      <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Uploads</h2>
          <button 
            onClick={() => navigate('/profile#upload-history')}
            className="text-[#be185d] hover:text-[#be185d]/80 text-sm"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : stats?.recentFiles?.slice(0, 3).map(file => (
            <div key={file._id} className="bg-[#1e293b] rounded-lg p-4 hover:bg-[#1e293b]/80 transition-all">
              <div className="flex items-center gap-3 mb-2">
                {file.fileType === 'csv' ? (
                  <FaFileCsv className="text-green-500 text-2xl" />
                ) : (
                  <FaFileExcel className="text-blue-500 text-2xl" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{file.fileName}</p>
                  <p className="text-sm text-gray-400">
                    {formatSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-400">
                  {new Date(file.uploadDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  file.status === 'processed' 
                    ? 'bg-green-500/20 text-green-500'
                    : file.status === 'failed'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {file.status}
                </span>
              </div>
            </div>
          ))}
          {!loading && (!stats?.recentFiles || stats.recentFiles.length === 0) && (
            <p className="text-gray-400 col-span-3 text-center">No files uploaded yet</p>
          )}
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-[#0f172a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#1e293b] rounded-lg">
            <p className="text-sm text-gray-400">API Status</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <p className="text-white">Operational</p>
            </div>
          </div>
          <div className="p-4 bg-[#1e293b] rounded-lg">
            <p className="text-sm text-gray-400">Processing Queue</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
              <p className="text-white">{stats?.processingStatus.processing || 0} Files</p>
            </div>
          </div>
          <div className="p-4 bg-[#1e293b] rounded-lg">
            <p className="text-sm text-gray-400">Storage Status</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <p className="text-white">{formatSize(stats?.totalSize || 0)} Used</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
