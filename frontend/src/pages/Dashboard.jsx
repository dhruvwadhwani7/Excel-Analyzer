import { useState, useEffect } from 'react';
import { FaFileAlt, FaChartPie, FaDatabase } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Update useEffect to limit files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const response = await fetch('http://localhost:5000/api/files?limit=3', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setFiles(data.files);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome back, Analyst!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f172a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Files Processed</h3>
            <FaFileAlt className="text-[#be185d]" />
          </div>
          <p className="text-3xl font-bold text-white">72</p>
          <p className="text-sm text-gray-400">Last 30 days</p>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Insights Generated</h3>
            <FaChartPie className="text-[#be185d]" />
          </div>
          <p className="text-3xl font-bold text-white">150+</p>
          <p className="text-sm text-gray-400">Total insights</p>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Storage Used</h3>
            <FaDatabase className="text-[#be185d]" />
          </div>
          <p className="text-3xl font-bold text-white">8/10</p>
          <p className="text-sm text-gray-400">GB remaining</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[#0f172a] rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : files.length > 0 ? (
            files.map(file => (
              <div key={file._id} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-lg">
                <div>
                  <p className="text-white font-medium">{file.fileName}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(file.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  file.status === 'processed' 
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {file.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No files uploaded yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#0f172a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/upload')}
            className="p-4 bg-[#1e293b] rounded-lg text-left hover:bg-[#1e293b]/80 transition-colors"
          >
            <h3 className="text-white font-bold mb-2">Upload Data</h3>
            <p className="text-sm text-gray-400">Upload a new .xls or .xlsx file for analysis</p>
          </button>
          <button 
            onClick={() => navigate('/profile#history')}
            className="p-4 bg-[#1e293b] rounded-lg text-left hover:bg-[#1e293b]/80 transition-colors"
          >
            <h3 className="text-white font-bold mb-2">View History</h3>
            <p className="text-sm text-gray-400">Access your past uploads and analyses</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
