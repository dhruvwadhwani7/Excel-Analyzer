import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useCallback, useRef } from 'react'
import { FaList, FaThLarge, FaSearch, FaFileCsv, FaFileExcel, FaTrash, FaCheck, FaTimes, FaChartBar, FaChartPie, FaChartLine, FaEye } from 'react-icons/fa'
import { toast } from 'react-toastify'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(user?.name)
  const [files, setFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, fileId: null });
  const [charts, setCharts] = useState([]);
  const [chartViewMode, setChartViewMode] = useState('grid');
  const [chartSearchTerm, setChartSearchTerm] = useState('');
  const [deleteChartModal, setDeleteChartModal] = useState({ show: false, chartId: null });
  const [previewModal, setPreviewModal] = useState({ show: false, fileData: null });
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartSectionRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const [highlightCharts, setHighlightCharts] = useState(false);
  const [highlightUploads, setHighlightUploads] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const response = await fetch('https://excel-analyzer-1.onrender.com/api/files/all', {
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

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const token = sessionStorage.getItem('userToken');
        const response = await fetch('https://excel-analyzer-1.onrender.com/api/charts/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setCharts(data.charts);
        }
      } catch (error) {
        console.error('Error fetching charts:', error);
      }
    };

    fetchCharts();
  }, []);

  useEffect(() => {
    // Check for both upload and chart history hash
    if (window.location.hash === '#upload-history') {
      setHighlightUploads(true);
      uploadSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      const timer = setTimeout(() => setHighlightUploads(false), 2000);
      return () => clearTimeout(timer);
    } else if (window.location.hash === '#chart-history') {
      setHighlightCharts(true);
      
      // Scroll to chart section
      chartSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });

      // Remove highlight after animation
      const timer = setTimeout(() => {
        setHighlightCharts(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('userToken')
      const response = await fetch('https://excel-analyzer-1.onrender.com/api/user/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      })
      const data = await response.json()
      if (data.success) {
        updateUser({ ...user, name: newName })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  const handleDeleteClick = (fileId) => {
    setDeleteModal({ show: true, fileId });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = sessionStorage.getItem('userToken');
      const response = await fetch(`https://excel-analyzer-1.onrender.com/api/files/${deleteModal.fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFiles(files.filter(file => file._id !== deleteModal.fileId));
        toast.success('File deleted successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Error deleting file');
    } finally {
      setDeleteModal({ show: false, fileId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ show: false, fileId: null });
  };

  const handleChartDeleteClick = (chartId) => {
    setDeleteChartModal({ show: true, chartId });
  };

  const handleChartDeleteConfirm = async () => {
    try {
      const token = sessionStorage.getItem('userToken');
      const response = await fetch(`https://excel-analyzer-1.onrender.com/api/charts/${deleteChartModal.chartId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setCharts(charts.filter(chart => chart._id !== deleteChartModal.chartId));
        toast.success('Chart deleted successfully');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Error deleting chart');
    } finally {
      setDeleteChartModal({ show: false, chartId: null });
    }
  };

  const getRemainingTime = useCallback((uploadDate) => {
    const uploaded = new Date(uploadDate);
    const expiryTime = new Date(uploaded.getTime() + (12 * 60 * 60 * 1000));
    const now = new Date();
    const remaining = expiryTime - now;

    if (remaining <= 0) return 'Expiring soon';

    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m remaining`;
  }, []);

  const filteredFiles = files.filter(file => 
    file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCharts = charts.filter(chart => 
    chart.title?.toLowerCase().includes(chartSearchTerm.toLowerCase()) ||
    chart.chartType.toLowerCase().includes(chartSearchTerm.toLowerCase())
  );

  const ErrorMessage = ({ message }) => (
    <div className="text-red-500 bg-red-500/10 p-4 rounded-lg mb-4">
      <p>{message}</p>
    </div>
  );

  const FilePreviewModal = ({ data, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#0f172a] rounded-xl p-6 max-w-4xl w-full mx-4 animate-fadeIn max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{data.fileName}</h3>
            <p className="text-sm text-gray-400">Total Rows: {data.totalRows}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        {error && <ErrorMessage message={error} />}

        <div className="overflow-x-auto">
          {data.columns?.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-[#1e293b] text-white">
                <tr>
                  {data.columns.map((column, i) => (
                    <th key={i} className="p-3 whitespace-nowrap">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {data.preview?.map((row, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-[#1e293b]/50">
                    {data.columns.map((column, j) => (
                      <td key={j} className="p-3 whitespace-nowrap">
                        {row[column]?.toString() || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-400">
              No preview data available
            </div>
          )}
        </div>
        
        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#1e293b]/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#020617] py-8 px-4">
      {/* Enhanced Profile Section */}
    <div className="max-w-7xl mx-auto mb-8 ">
  <div className="bg-[#0f172a] rounded-lg shadow-lg p-8">
    <div className="flex flex-col lg:flex-row items-start gap-6">
      <div className="bg-[#be185d] rounded-full p-6 shadow-lg shadow-[#be185d]/20 self-center lg:self-start">
        <span className="text-4xl text-white font-bold">{user?.name[0].toUpperCase()}</span>
      </div>
      <div className="flex-1 space-y-4 w-full">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{user?.name}</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {user?.email}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 {user?.phoneNumber}
              </span>
            </div>
          </div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-4 py-2 rounded-lg bg-[#1e293b] text-[#be185d] hover:bg-[#1e293b]/80 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-[#1e293b] text-white border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#be185d]"
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500/30 transition-colors"
                >
                  Save
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(user?.name);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-[#1e293b] rounded-lg">
              <p className="text-gray-400 text-sm">Account Type</p>
              <p className="text-white font-medium capitalize">{user?.role || 'Regular'}</p>
            </div>
            <div className="p-4 bg-[#1e293b] rounded-lg">
              <p className="text-gray-400 text-sm">Member Since</p>
              <p className="text-white font-medium">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-[#1e293b] rounded-lg">
              <p className="text-gray-400 text-sm">Files Uploaded</p>
              <p className="text-white font-medium">{files.length}</p>
            </div>
            <div className="p-4 bg-[#1e293b] rounded-lg">
              <p className="text-gray-400 text-sm">Storage Used</p>
              <p className="text-white font-medium">
                {(files.reduce((acc, file) => acc + file.fileSize, 0) / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</div>


      {/* Upload History Section  */}
      <div 
  ref={uploadSectionRef}
  id="upload-history"
  className={`max-w-7xl mx-auto transition-all duration-500 ${
    highlightUploads ? 'ring-4 ring-[#be185d] rounded-lg animate-pulse' : ''
  }`}
>
  <div className="bg-[#0f172a] rounded-lg shadow-lg p-6">
    <div className="flex flex-col mb-6 gap-4">
      {/* Top Section - Title, Search, View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Upload History</h2>

        <div className="flex flex-wrap sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1e293b] text-white rounded-lg pl-10 pr-4 py-2 w-full"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Optional Label for Mobile */}
          <div className="sm:hidden text-xs text-gray-400 w-full text-center">View Mode</div>

          {/* View Toggle Icons */}
          <div className="flex justify-center sm:justify-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-[#be185d]' : 'bg-[#1e293b] hover:bg-[#334155]'
              }`}
            >
              <FaThLarge className="text-white" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-[#be185d]' : 'bg-[#1e293b] hover:bg-[#334155]'
              }`}
            >
              <FaList className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-[#1e293b]/50 rounded-lg">
        <p className="text-yellow-400 text-sm flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Files are automatically removed 12 hours after upload. You can PREVIEW or DELETE by hovering on files.
        </p>
      </div>
    </div>

    {/* Files Section */}
    {loading ? (
      <div className="text-center py-8">
        <div className="animate-spin text-[#be185d] text-4xl">↻</div>
      </div>
    ) : viewMode === 'grid' ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredFiles.map(file => (
          <div key={file._id} className="bg-[#1e293b] p-4 rounded-lg hover:bg-[#1e293b]/80 transition-colors relative group">
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={async () => {
                  try {
                    setPreviewLoading(true);
                    setError(null);
                    const token = sessionStorage.getItem('userToken');
                    const response = await fetch(`https://excel-analyzer-1.onrender.com/api/files/${file._id}/preview`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.success) {
                      setPreviewModal({ 
                        show: true, 
                        fileData: {
                          ...data.data,
                          preview: data.data.preview || [],
                          columns: data.data.columns || []
                        }
                      });
                    } else {
                      throw new Error(data.message || 'Failed to load preview');
                    }
                  } catch (error) {
                    setError(error.message);
                    toast.error('Error loading preview: ' + error.message);
                  } finally {
                    setPreviewLoading(false);
                  }
                }}
                disabled={previewLoading}
                className={`p-2 rounded-full ${
                  previewLoading 
                    ? 'bg-gray-500/20 text-gray-500' 
                    : 'bg-blue-500/20 text-blue-500 opacity-0 group-hover:opacity-100'
                } transition-opacity hover:bg-blue-500/30`}
              >
                {previewLoading ? (
                  <div className="w-4 h-4 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <FaEye className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleDeleteClick(file._id)}
                className="p-2 rounded-full bg-red-500/20 text-red-500 
                opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
            {file.fileType === 'csv' ? (
              <FaFileCsv className="text-4xl text-green-500 mb-2" />
            ) : (
              <FaFileExcel className="text-4xl text-blue-500 mb-2" />
            )}
            <h3 className="text-white font-medium truncate">{file.fileName}</h3>
            <p className="text-gray-400 text-sm">
              {new Date(file.uploadDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="mt-2 text-xs text-yellow-400">
              {getRemainingTime(file.uploadDate)}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="space-y-2">
        {filteredFiles.map(file => (
          <div key={file._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#1e293b] p-4 rounded-lg group">
            <div className="flex items-center gap-3">
              {file.fileType === 'csv' ? (
                <FaFileCsv className="text-2xl text-green-500" />
              ) : (
                <FaFileExcel className="text-2xl text-blue-500" />
              )}
              <div>
                <h3 className="text-white font-medium">{file.fileName}</h3>
                <p className="text-gray-400 text-sm">
                  {new Date(file.uploadDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="text-xs text-yellow-400 mt-1">
                  {getRemainingTime(file.uploadDate)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button
                onClick={() => handleDeleteClick(file._id)}
                className="p-2 rounded-full bg-red-500/20 text-red-500 
                opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              <span className={`px-3 py-1 rounded-full text-sm ${
                file.status === 'processed' 
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {file.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>


      {/* Chart History Section */}
      <div 
  ref={chartSectionRef}
  id="chart-history"
  className={`max-w-7xl mx-auto mt-8 transition-all duration-500 ${
    highlightCharts ? 'ring-4 ring-[#be185d] rounded-lg animate-pulse' : ''
  }`}
>
  <div className="bg-[#0f172a] rounded-lg shadow-lg p-6">
    <div className="flex flex-col mb-6">
      {/* Responsive Title + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Chart History</h2>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search charts..."
              value={chartSearchTerm}
              onChange={(e) => setChartSearchTerm(e.target.value)}
              className="bg-[#1e293b] text-white rounded-lg pl-10 pr-4 py-2 w-full"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          {/* View Toggle Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartViewMode('grid')}
              className={`p-2 rounded ${chartViewMode === 'grid' ? 'bg-[#be185d]' : 'bg-[#1e293b]'}`}
            >
              <FaThLarge className="text-white" />
            </button>
            <button
              onClick={() => setChartViewMode('list')}
              className={`p-2 rounded ${chartViewMode === 'list' ? 'bg-[#be185d]' : 'bg-[#1e293b]'}`}
            >
              <FaList className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Grid View */}
    {chartViewMode === 'grid' ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {filteredCharts.map(chart => (
          <div key={chart._id} className="bg-[#1e293b] p-4 rounded-lg hover:bg-[#1e293b]/80 transition-colors relative group w-full max-w-sm">
            <button
              onClick={() => handleChartDeleteClick(chart._id)}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-500/20 text-red-500 
              opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30"
            >
              <FaTrash className="w-4 h-4" />
            </button>
            {chart.chartType.includes('pie') ? (
              <FaChartPie className="text-4xl text-[#be185d] mb-2" />
            ) : chart.chartType.includes('line') ? (
              <FaChartLine className="text-4xl text-[#be185d] mb-2" />
            ) : (
              <FaChartBar className="text-4xl text-[#be185d] mb-2" />
            )}
            <h3 className="text-white font-medium truncate">{chart.title || 'Untitled Chart'}</h3>
            <p className="text-gray-400 text-sm">Type: {chart.chartType}</p>
            <p className="text-gray-400 text-sm">File: {chart.fileId?.fileName}</p>
            <p className="text-gray-400 text-sm">
              Created: {new Date(chart.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-2 text-xs">
              <span className="text-blue-400">X: {chart.xAxis}</span>
              <span className="text-green-400 ml-2">Y: {chart.yAxis}</span>
              {chart.zAxis && <span className="text-yellow-400 ml-2">Z: {chart.zAxis}</span>}
            </div>
          </div>
        ))}
      </div>
    ) : (
      // List View
      <div className="space-y-2 flex flex-col items-center">
        {filteredCharts.map(chart => (
          <div key={chart._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#1e293b] p-4 rounded-lg w-full group">
            <div className="flex items-center gap-3">
              {chart.chartType.includes('pie') ? (
                <FaChartPie className="text-2xl text-[#be185d]" />
              ) : chart.chartType.includes('line') ? (
                <FaChartLine className="text-2xl text-[#be185d]" />
              ) : (
                <FaChartBar className="text-2xl text-[#be185d]" />
              )}
              <div>
                <h3 className="text-white font-medium">{chart.title || 'Untitled Chart'}</h3>
                <p className="text-gray-400 text-sm">
                  Type: {chart.chartType} | File: {chart.fileId?.fileName}
                </p>
                <div className="text-xs mt-1">
                  <span className="text-blue-400">X: {chart.xAxis}</span>
                  <span className="text-green-400 ml-2">Y: {chart.yAxis}</span>
                  {chart.zAxis && <span className="text-yellow-400 ml-2">Z: {chart.zAxis}</span>}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleChartDeleteClick(chart._id)}
              className="p-2 rounded-full bg-red-500/20 text-red-500 
              opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/30 mt-4 sm:mt-0"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
</div>


      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-xl p-6 max-w-sm w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleDeleteCancel}
                className="flex items-center px-4 py-2 rounded-md bg-[#1e293b] text-white hover:bg-[#1e293b]/80 transition-all"
              >
                <FaTimes className="mr-2" />
                No, Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex items-center px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                <FaCheck className="mr-2" />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chart Delete Confirmation Modal */}
      {deleteChartModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] rounded-xl p-6 max-w-sm w-full mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete Chart</h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this chart? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteChartModal({ show: false, chartId: null })}
                className="flex items-center px-4 py-2 rounded-md bg-[#1e293b] text-white hover:bg-[#1e293b]/80 transition-all"
              >
                <FaTimes className="mr-2" />
                No, Cancel
              </button>
              <button
                onClick={handleChartDeleteConfirm}
                className="flex items-center px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                <FaCheck className="mr-2" />
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewModal.show && (
        <FilePreviewModal 
          data={previewModal.fileData}
          onClose={() => setPreviewModal({ show: false, fileData: null })}
        />
      )}
    </div>
  );
};

export default Profile;
