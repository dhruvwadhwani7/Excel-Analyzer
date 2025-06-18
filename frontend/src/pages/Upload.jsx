import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFileUpload, FaFileCsv, FaFileExcel, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import '../styles/adminlayout.css'

const Upload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [recentFiles, setRecentFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('userToken');
      if (!token || !user) {
        navigate('/login');
        return;
      }
    };
    checkAuth();
  }, [user, navigate]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file) => {
    try {
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      // Check file type
      if (!validTypes.includes(fileExtension)) {
        throw new Error('Invalid file type. Please upload CSV or Excel files only.');
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      // Check if file is empty
      if (file.size === 0) {
        throw new Error('File is empty. Please upload a valid file.');
      }

      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    try {
      const file = e.dataTransfer.files[0];
      if (!file) {
        throw new Error('No file selected.');
      }
      if (validateFile(file)) {
        handleFileUpload(file);
      }
    } catch (error) {
      toast.error(error.message || 'Error processing file.');
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file || !validateFile(file)) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = sessionStorage.getItem('userToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('https://excel-analyzer-1.onrender.com/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const fileData = {
        id: data.file._id,
        name: data.file.fileName,
        date: new Date(data.file.uploadDate).toLocaleDateString(),
        status: data.file.status,
        size: (data.file.fileSize / 1024).toFixed(2) + ' KB',
        columns: data.file.columns,
        rowCount: data.file.rowCount,
        preview: data.file.preview,
        type: data.file.fileType,
        uploadTimestamp: Date.now() // Add timestamp
      };
      
      setFiles(prev => [fileData, ...prev]);
      setRecentFiles(prev => [fileData, ...prev].slice(0, 3)); // Keep only last 3 files
      toast.success(`File uploaded successfully! ${fileData.rowCount} rows processed.`);
    } catch (error) {
      if (error.message === 'Authentication required') {
        navigate('/login');
      }
      toast.error(error.message || 'Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = useCallback((e) => {
    try {
      const file = e.target.files[0];
      if (!file) {
        throw new Error('No file selected.');
      }
      if (validateFile(file)) {
        handleFileUpload(file);
      }
    } catch (error) {
      toast.error(error.message || 'Error selecting file.');
    } finally {
      // Reset the input value to allow selecting the same file again
      e.target.value = '';
    }
  }, []);

  // Add function to check if file is recent (less than 1 hour old)
  const isRecentFile = (uploadTimestamp) => {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    return uploadTimestamp > oneHourAgo;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className={`bg-[#0f172a] rounded-xl p-6 mb-8 ${dragActive ? 'border-2 border-[#be185d]' : ''}`}>
        <h1 className="text-2xl font-bold text-white mb-6">Upload Files</h1>
        
        <div
          className={`border-2 border-dashed ${
            dragActive ? 'border-[#be185d] bg-[#be185d]/10' : 'border-gray-600'
          } rounded-lg p-8 text-center transition-all duration-200`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            {uploading ? (
              <FaSpinner className="text-4xl text-[#be185d] mb-4 animate-spin" />
            ) : (
              <FaFileUpload className="text-4xl text-[#be185d] mb-4" />
            )}
            <span className="text-white mb-2">
              {uploading 
                ? 'Uploading...' 
                : 'Drag and drop your file here or click to browse'
              }
            </span>
            <span className="text-sm text-gray-400">
              Supported formats: CSV, XLSX, XLS (Max size: 10MB)
            </span>
          </label>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-[#0f172a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Uploads</h2>

        {/* Add Info Card */}
        <div className="mb-6 bg-[#1e293b] rounded-lg p-4 border border-[#be185d]/20">
          <p className="text-white mb-2">
            View all your uploaded files and detailed statistics on your Dashboard
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={() => navigate('/analytics')}
              className="px-4 py-2 bg-[#be185d] text-white rounded-lg hover:bg-[#be185d]/90 transition-colors flex items-center justify-center"
            >
              Analyze your Uploaded files
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] border border-[#be185d]/20 transition-colors flex items-center justify-center"
            >
              Go to Dashbord
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-800">
          {files.slice(0, 3).map(file => (
            <div key={file.id} className={`py-4 flex items-center justify-between upload-file ${
              isRecentFile(file.uploadTimestamp) ? 'bg-[#be185d]/10 rounded-lg' : ''
            }`}>
              <div className="flex items-center">
                {file.name.endsWith('.csv') ? (
                  <FaFileCsv className="text-green-500 mr-3" />
                ) : (
                  <FaFileExcel className="text-blue-500 mr-3" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white">{file.name}</p>
                    {isRecentFile(file.uploadTimestamp) && (
                      <span className="bg-[#be185d] text-white text-xs px-2 py-1 rounded">NEW</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">Type : {file.type}</p>
                  <p className="text-sm text-gray-400">Date Uploaded : {file.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-500">
                {file.status}
              </span>
            </div>
          ))}
          {files.length === 0 && (
            <p className="text-gray-400 py-4">No files uploaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
