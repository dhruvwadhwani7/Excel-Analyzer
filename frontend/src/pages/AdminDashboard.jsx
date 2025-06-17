import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaFileAlt, FaChartPie, FaDatabase, FaFileCsv, FaFileExcel, 
         FaCheckCircle, FaSpinner, FaTimesCircle, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/adminlayout.css'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    summary: {
      users: 0,
      files: 0,
      charts: 0,
      storage: 0
    },
    fileStats: {
      types: { csv: 0, xlsx: 0, xls: 0 },
      status: { processed: 0, processing: 0, failed: 0 }
    },
    chartStats: { types: {} },
    recentActivity: { files: [], charts: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    try {
      setError(null);
      const token = sessionStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://excel-analyzer-1.onrender.com/api/admin/stats', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setLoading(false);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setError(error.message);
      toast.error(`Error loading dashboard data: ${error.message}`);
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleDeleteClick = (type, id) => {
    setDeleteModal({ show: true, type, id });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const { type, id } = deleteModal;
      if (!type || !id) {
        throw new Error('Invalid delete parameters');
      }
      
      const response = await fetch(`https://excel-analyzer-1.onrender.com/api/admin/${type}s/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete ${type}`);
      }

      if (data.success) {
        toast.success(`${type} deleted successfully`);
        await fetchStats(); // Refresh stats after successful delete
      } else {
        throw new Error(data.message || 'Delete operation failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setDeleteModal({ show: false, type: null, id: null });
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#0f172a] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">{title}</h3>
        <Icon className={`text-2xl ${color}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );

  // Helper function to format bytes
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin text-[#be185d] text-4xl">↻</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 bg-red-500/10 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400">System Overview & Statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.summary.users}
          icon={FaUsers}
          color="text-blue-500"
        />
        <StatCard
          title="Total Files Uploaded"
          value={stats.summary.files}
          icon={FaFileAlt}
          color="text-green-500"
        />
        <StatCard
          title="Total Charts Created"
          value={stats.summary.charts}
          icon={FaChartPie}
          color="text-[#be185d]"
        />
        <StatCard
          title="Total Storage Used"
          value={formatBytes(stats.summary.storage)}
          icon={FaDatabase}
          color="text-yellow-500"
        />
      </div>

      {/* File Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">File Types Distribution</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaFileCsv className="text-green-500 mr-2" />
                <span className="text-white">CSV Files</span>
              </div>
              <span className="text-gray-400">{stats.fileStats.types.csv}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaFileExcel className="text-blue-500 mr-2" />
                <span className="text-white">Excel Files</span>
              </div>
              <span className="text-gray-400">{stats.fileStats.types.xlsx + stats.fileStats.types.xls}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Processing Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-500 mr-2" />
                <span className="text-white">Processed</span>
              </div>
              <span className="text-gray-400">{stats.fileStats.status.processed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaSpinner className="text-yellow-500 mr-2" />
                <span className="text-white">Processing</span>
              </div>
              <span className="text-gray-400">{stats.fileStats.status.processing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaTimesCircle className="text-red-500 mr-2" />
                <span className="text-white">Failed</span>
              </div>
              <span className="text-gray-400">{stats.fileStats.status.failed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Files */}
        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Uploaded Files</h2>
          <div className="space-y-4">
            {stats.recentActivity.files.map(file => (
              <div key={file.id} className="flex items-center justify-between bg-[#1e293b] p-3 rounded-lg file">
                <div className="flex items-center">
                  {file.type === 'csv' ? 
                    <FaFileCsv className="text-green-500 mr-2" /> : 
                    <FaFileExcel className="text-blue-500 mr-2" />
                  }
                  <div>
                    <p className="text-white">{file.name}</p>
                    <p className="text-sm text-gray-400">User : {file.user}</p>
                  </div>
                </div>
                <div className="text-right file-date">
                  <p className="text-sm text-gray-400">Size : {file.size}</p>
                  <p className="text-sm text-gray-400">
                    Date Uploaded : {new Date(file.date).toLocaleDateString()}
                  </p>
                </div>
                 <button
                        onClick={() => handleDeleteClick('file', file.id)}
                        className="p-2 rounded-full bg-red-500/20 text-red-500 
                                  hover:bg-red-500/30 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Charts */}
        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Generated Charts</h2>
          <div className="space-y-4">
            {stats.recentActivity.charts.map(chart => (
              <div key={chart.id} className="flex items-center justify-between bg-[#1e293b] p-3 rounded-lg chart">
                <div className="flex items-center">
                  <FaChartPie className="text-[#be185d] mr-2" />
                  <div>
                    <p className="text-white">{chart.title}</p>
                    <p className="text-sm text-gray-400">User : {chart.user}</p>
                  </div>
                </div>
                <div className="text-right chart-date">
                  <p className="text-sm text-gray-400">Type : {chart.type}</p>
                  <p className="text-sm text-gray-400">
                    Date Created: {new Date(chart.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                        onClick={() => handleDeleteClick('chart', chart.id)}
                        className="p-2 rounded-full bg-red-500/20 text-red-500 
                                  hover:bg-red-500/30 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                </button>
                
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Tables Section */}
      <h1 className="text-2xl font-bold text-white mb-4 m-7 text-center">Tabular Information</h1>
      <div className="mt-8 space-y-8 table-info">
        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">User Information</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#1e293b] rounded-xl">
              <thead>
                <tr>
                  <th className="p-4 text-left text-white">Name</th>
                  <th className="p-4 text-left text-white">Email</th>
                  <th className="p-4 text-left text-white">Phone</th>
                  <th className="p-4 text-left text-white">Created At</th>
                  <th className="p-4 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.detailedData?.users?.map((user) => (
                  <tr key={user._id} className="border-t border-gray-700">
                    <td className="p-4 text-gray-300">{user.name}</td>
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4 text-gray-300">{user.phoneNumber}</td>
                    <td className="p-4 text-gray-300">
                      {new Date(user.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteClick('user', user._id)}
                        className="p-2 rounded-full bg-red-500/20 text-red-500 
                                  hover:bg-red-500/30 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">File Information</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#1e293b] rounded-xl">
              <thead>
                <tr>
                  <th className="p-4 text-left text-white">File Name</th>
                  <th className="p-4 text-left text-white">User</th>
                  <th className="p-4 text-left text-white">Type</th>
                  <th className="p-4 text-left text-white">Size</th>
                  <th className="p-4 text-left text-white">Upload Date</th>
                  <th className="p-4 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.detailedData?.files?.map((file) => (
                  <tr key={file._id} className="border-t border-gray-700">
                    <td className="p-4 text-gray-300">{file.fileName}</td>
                    <td className="p-4 text-gray-300">{file.userId?.name}</td>
                    <td className="p-4 text-gray-300">{file.fileType}</td>
                    <td className="p-4 text-gray-300">{formatBytes(file.fileSize)}</td>
                    <td className="p-4 text-gray-300">
                      {new Date(file.uploadDate).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteClick('file', file._id)}
                        className="p-2 rounded-full bg-red-500/20 text-red-500 
                                  hover:bg-red-500/30 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Chart Information</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-[#1e293b] rounded-xl">
              <thead>
                <tr>
                  <th className="p-4 text-left text-white">Chart Title</th>
                  <th className="p-4 text-left text-white">User</th>
                  <th className="p-4 text-left text-white">Type</th>
                  <th className="p-4 text-left text-white">Created At</th>
                  <th className="p-4 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.detailedData?.charts?.map((chart) => (
                  <tr key={chart._id} className="border-t border-gray-700">
                    <td className="p-4 text-gray-300">{chart.title}</td>
                    <td className="p-4 text-gray-300">{chart.userId?.name}</td>
                    <td className="p-4 text-gray-300">{chart.chartType}</td>                    <td className="p-4 text-gray-300">
                      {new Date(chart.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDeleteClick('chart', chart._id)}
                        className="p-2 rounded-full bg-red-500/20 text-red-500 
                                  hover:bg-red-500/30 transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Information Banner */}
      <div className="mt-8 bg-[#1e293b] rounded-xl p-6 border border-[#be185d]/20 admin-capabilities">
        <h2 className="text-2xl font-bold text-white mb-4">Admin Access & Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-[#be185d] mb-2">User Management</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>View all registered users and their details</li>
              <li>Delete user accounts</li>
              <li>Monitor user activity and uploads</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#be185d] mb-2">File Operations</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access and review all uploaded files</li>
              <li>Delete files from the system</li>
              <li>Monitor file processing status</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#be185d] mb-2">Chart Management</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>View all generated charts</li>
              <li>Delete charts</li>
              <li>Track chart creation statistics</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#be185d] mb-2">System Overview</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Monitor system storage usage</li>
              <li>Track file processing statistics</li>
              <li>View real-time system analytics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this {deleteModal.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModal({ show: false, type: null, id: null })}
                className="px-4 py-2 rounded-md bg-[#1e293b] text-white hover:bg-[#1e293b]/80"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
