import React, { useState } from 'react';
import { Upload, Folder, File, Star, Trash2, Search, Grid, List, Plus, Home, Clock, Share2, User, LogOut, FolderPlus, X, MoreVertical, Download, Copy, Edit, Move, ChevronRight, Eye, EyeOff, Mail, Lock, ArrowRight, Cloud, FileText, FolderOpen, Shield, Zap } from 'lucide-react';

// Mock data
const mockFiles = [
  { id: 1, name: 'Project Proposal.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', starred: false },
  { id: 2, name: 'Marketing Assets', type: 'folder', size: '12 files', modified: '1 day ago', starred: true },
  { id: 3, name: 'Budget 2025.xlsx', type: 'excel', size: '856 KB', modified: '3 days ago', starred: false },
  { id: 4, name: 'Team Photo.jpg', type: 'image', size: '4.2 MB', modified: '1 week ago', starred: true },
  { id: 5, name: 'Presentation.pptx', type: 'ppt', size: '8.1 MB', modified: '2 weeks ago', starred: false },
  { id: 6, name: 'Development Docs', type: 'folder', size: '28 files', modified: '3 weeks ago', starred: false },
];

const recentFiles = [
  { id: 1, name: 'Q4 Report.pdf', type: 'pdf', modified: '5 mins ago' },
  { id: 2, name: 'Client Meeting Notes.docx', type: 'doc', modified: '1 hour ago' },
  { id: 3, name: 'Invoice_2024.xlsx', type: 'excel', modified: '3 hours ago' },
];

const trashedFiles = [
  { id: 1, name: 'Old Design.psd', type: 'psd', deletedOn: '2 days ago' },
  { id: 2, name: 'Archive 2023', type: 'folder', deletedOn: '1 week ago' },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [files, setFiles] = useState(mockFiles);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState([]);
  const [serverFiles, setServerFiles] = useState([]);
  const [backups, setBackups] = useState([{ id: 1 }, { id: 2 }, { id: 3 }]);

  const fetchFilesForUser = (userId) => {
    // Mock function - you can implement actual API call here
    console.log('Fetching files for:', userId);
    setServerFiles(mockFiles);
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      handleFileUpload(selectedFiles);
    }
  };

  const handleFileUpload = (selectedFiles) => {
    selectedFiles.forEach((file) => {
      console.log('Uploading file:', file.name);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Add file to uploads list
          const newUpload = {
            id: Date.now(),
            name: file.name,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            date: new Date().toISOString().split('T')[0],
            type: file.type.includes('pdf') ? 'pdf' : 
                  file.type.includes('image') ? 'image' : 
                  file.type.includes('word') || file.name.endsWith('.docx') ? 'doc' : 
                  file.type.includes('excel') || file.name.endsWith('.xlsx') ? 'xls' : 'file'
          };
          
          setUploads(prev => [newUpload, ...prev]);
          setFiles(prev => [...prev, { ...newUpload, starred: false, modified: 'Just now' }]);
          
          setTimeout(() => {
            setUploadProgress(0);
          }, 1000);
        }
      }, 200);
    });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload(droppedFiles);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleStar = (fileId) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, starred: !f.starred } : f));
  };

  const getFileIcon = (type) => {
    if (type === 'folder') return <Folder className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  // Auth Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-black flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black via-gray-900 to-black text-white p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16 animate-fade-in-up">
              <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-100 text-black rounded-xl flex items-center justify-center text-xl font-bold shadow-2xl transform hover:scale-110 transition-transform">
                CV
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">CloudVault</span>
            </div>
            
            <div className="space-y-10 mt-24">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h1 className="text-6xl font-extrabold leading-tight mb-6 animate-slide-down bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                  Your files,<br />
                  everywhere you need them
                </h1>
                <p className="text-2xl text-gray-300 font-light animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.3s' }}>
                  Secure cloud storage powered by AWS with enterprise-grade encryption
                </p>
              </div>
              
              <div className="space-y-5 animate-fade-in-up pt-8" style={{ animationDelay: '0.4s' }}>
                {[
                  { text: 'Unlimited file uploads', icon: '📁' },
                  { text: 'End-to-end encryption', icon: '🔒' },
                  { text: 'Share with anyone', icon: '🔗' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 animate-slide-down group hover:translate-x-2 transition-transform duration-300" style={{ animationDelay: `${0.5 + idx * 0.1}s` }}>
                    <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 text-black rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all">
                      <span className="text-lg">{feature.icon}</span>
                    </div>
                    <span className="text-xl font-medium text-gray-200 group-hover:text-white transition-colors">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="relative z-10 text-sm text-gray-400 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            © 2025 CloudVault. All rights reserved.
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 animate-fade-in bg-gradient-to-br from-gray-50 to-white">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <div className="flex items-center gap-2 justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                  CV
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">CloudVault</span>
              </div>
            </div>

            <div className="max-w-md w-full space-y-8 animate-scale-in bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
              <div>
                <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                  {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600 text-lg font-light">
                  {authMode === 'login' 
                    ? 'Enter your credentials to access your files' 
                    : 'Sign up to start storing your files securely'}
                </p>
              </div>

            <div className="space-y-5">
              {authMode === 'signup' && (
                <div className="animate-slide-down">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all shadow-md hover:shadow-lg focus:shadow-xl font-medium"
                  />
                </div>
              )}

              <div className="animate-slide-down" style={{ animationDelay: authMode === 'signup' ? '0.1s' : '0s' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all shadow-md hover:shadow-lg focus:shadow-xl font-medium"
                  />
                </div>
              </div>

              <div className="animate-slide-down" style={{ animationDelay: authMode === 'signup' ? '0.2s' : '0.1s' }}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-all shadow-md hover:shadow-lg focus:shadow-xl font-medium"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {authMode === 'login' && (
                <div className="flex items-center justify-between text-sm pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                    <span className="text-gray-600 group-hover:text-black transition-colors">Remember me</span>
                  </label>
                  <button className="text-black hover:underline font-semibold transition-all">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsAuthenticated(true)}
                className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-800 hover:to-black transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group shadow-lg hover:shadow-2xl"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <button className="w-full border-2 border-gray-200 py-4 rounded-xl font-semibold text-lg hover:border-black hover:bg-gray-50 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-md hover:shadow-lg">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <div className="text-center text-sm pt-4">
                {authMode === 'login' ? (
                  <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setAuthMode('signup')}
                      className="text-black font-bold hover:underline transition-all"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-black font-bold hover:underline transition-all"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="animate-slide-up space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-black to-purple-800 border-2 border-purple-800 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, John!</h1>
            <p className="text-purple-200 text-lg">Here's what's happening with your cloud storage today</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Cloud className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Documents', value: uploads.length.toString(), icon: FileText, change: '+12%', bg: 'from-indigo-50 to-white', iconBg: 'from-indigo-500 to-indigo-700' },
          { label: 'Storage Used', value: `${Math.round(serverFiles.reduce((sum, f) => sum + (f.size || 0), 0) / 1024)} KB`, icon: Cloud, change: '+5.2%', bg: 'from-purple-50 to-white', iconBg: 'from-purple-500 to-purple-700' },
          { label: 'Recent Uploads', value: uploads.filter(u => u.date === new Date().toISOString().split('T')[0]).length.toString(), icon: Upload, change: '+8', bg: 'from-green-50 to-white', iconBg: 'from-green-500 to-green-700' },
          { label: 'Backups', value: backups.length.toString(), icon: FolderOpen, change: '+3', bg: 'from-orange-50 to-white', iconBg: 'from-orange-500 to-orange-700' }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.bg} border-2 border-indigo-100 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.iconBg}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-indigo-700 text-sm font-semibold mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-indigo-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">Quick Upload Center</h2>
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          
          <input
            type="file"
            id="fileInput"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.txt"
          />
          
          <label
            htmlFor="fileInput"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragging 
                ? 'border-black bg-gray-100 scale-105' 
                : 'border-gray-300 hover:border-black hover:bg-gray-50'
            }`}
          >
            <div className={`w-20 h-20 bg-black bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 ${
              isDragging ? 'scale-110' : ''
            }`}>
              <Upload className={`w-10 h-10 text-black transition-transform duration-300 ${
                isDragging ? 'animate-bounce' : ''
              }`} />
            </div>
            <p className="text-black text-xl font-bold mb-2">
              {isDragging ? 'Drop your files here!' : 'Drop files here or click to browse'}
            </p>
            <p className="text-gray-600 mb-4">Support for PDF, DOCX, XLSX, JPG, PNG files up to 50MB</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" /> Encrypted
              </span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1" /> Fast Upload
              </span>
            </div>
          </label>
          <div className="mt-4 flex space-x-3">
            <button onClick={() => fetchFilesForUser('demo_user')} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              Refresh Files
            </button>
            <button onClick={() => fetchFilesForUser('demo_user')} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              Fetch Server Files
            </button>
          </div>
          {uploadProgress > 0 && (
            <div className="mt-6 bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-black font-semibold">Uploading Document...</span>
                <span className="text-black font-bold">{uploadProgress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-black to-gray-700 h-full transition-all duration-300 rounded-full flex items-center justify-end"
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress > 10 && (
                    <div className="w-3 h-3 bg-white rounded-full mr-1 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Storage Overview */}
        <div className="bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-100 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-black mb-6">Storage Overview</h2>
          <div className="relative mb-6">
            <div className="w-40 h-40 mx-auto">
              <svg className="transform -rotate-90 w-40 h-40">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#000000"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={`${439.6 * 0.458} 439.6`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-3xl font-bold text-indigo-900">45.8%</p>
                <p className="text-sm text-indigo-600">Used</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-black font-semibold">Total Space</span>
              <span className="text-gray-600">100 GB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-black font-semibold">Used</span>
              <span className="text-black font-bold">45.8 GB</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <span className="text-black font-semibold">Available</span>
              <span className="text-green-600 font-bold">54.2 GB</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all duration-300">
            Upgrade Storage
          </button>
        </div>
      </div>
    </div>
  );

  const renderMyFiles = () => (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">My Files</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all transform hover:scale-105 ${viewMode === 'grid' ? 'bg-black text-white shadow-lg' : 'bg-white border-2 border-gray-100 hover:border-black'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all transform hover:scale-105 ${viewMode === 'list' ? 'bg-black text-white shadow-lg' : 'bg-white border-2 border-gray-100 hover:border-black'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-black transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Files Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file, idx) => (
            <div
              key={file.id}
              className="group p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-black hover:shadow-xl transition-all cursor-pointer animate-fade-in-up transform hover:scale-105"
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${file.type === 'folder' ? 'bg-gray-100 text-black' : 'bg-black text-white'} shadow-md`}>
                  {getFileIcon(file.type)}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <Star className={`w-5 h-5 ${file.starred ? 'fill-black text-black' : 'text-gray-400'}`} />
                </button>
              </div>
              <div className="font-semibold truncate mb-1">{file.name}</div>
              <div className="text-sm text-gray-500">{file.size} • {file.modified}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((file, idx) => (
            <div
              key={file.id}
              className="flex items-center gap-4 p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all cursor-pointer animate-fade-in transform hover:scale-[1.01]"
              style={{ animationDelay: `${idx * 30}ms` }}
              onClick={() => setSelectedFile(file)}
            >
              <div className={`p-3 rounded-xl ${file.type === 'folder' ? 'bg-gray-100' : 'bg-black text-white'}`}>
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{file.name}</div>
                <div className="text-sm text-gray-500">{file.modified}</div>
              </div>
              <div className="text-sm text-gray-500">{file.size}</div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Star className={`w-5 h-5 ${file.starred ? 'fill-black text-black' : 'text-gray-400'}`} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRecent = () => (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold mb-6">Recent Files</h2>
      <div className="space-y-3">
        {recentFiles.map((file, idx) => (
          <div
            key={file.id}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all cursor-pointer animate-fade-in-up transform hover:scale-[1.01]"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="p-3 bg-black text-white rounded-xl">
              <File className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{file.name}</div>
              <div className="text-sm text-gray-500">Modified {file.modified}</div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStarred = () => (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold mb-6">Starred Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.filter(f => f.starred).map((file, idx) => (
          <div
            key={file.id}
            className="group p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-black hover:shadow-xl transition-all cursor-pointer animate-fade-in-up transform hover:scale-105"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-black text-white rounded-xl">
                {getFileIcon(file.type)}
              </div>
              <Star className="w-5 h-5 fill-black text-black" />
            </div>
            <div className="font-semibold truncate mb-1">{file.name}</div>
            <div className="text-sm text-gray-500">{file.size} • {file.modified}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTrash = () => (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Trash</h2>
        <button className="px-6 py-3 bg-white border-2 border-gray-100 rounded-xl hover:border-red-500 hover:text-red-500 transition-all font-medium">
          Empty Trash
        </button>
      </div>
      <div className="space-y-3">
        {trashedFiles.map((file, idx) => (
          <div
            key={file.id}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-100 rounded-xl hover:border-black transition-all animate-fade-in-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="p-3 bg-gray-100 rounded-xl">
              {getFileIcon(file.type)}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{file.name}</div>
              <div className="text-sm text-gray-500">Deleted {file.deletedOn}</div>
            </div>
            <button className="px-5 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium transform hover:scale-105">
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-slide-up max-w-2xl">
      <h2 className="text-3xl font-bold mb-6">Profile Settings</h2>
      <div className="space-y-6">
        <div className="p-8 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-black text-white rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg">
              JD
            </div>
            <div>
              <div className="text-2xl font-bold">John Doe</div>
              <div className="text-gray-500">john.doe@example.com</div>
            </div>
          </div>
          <button className="px-6 py-3 bg-gray-100 border-2 border-gray-100 rounded-xl hover:border-black transition-all font-medium">
            Change Avatar
          </button>
        </div>

        <div className="p-8 bg-white border-2 border-gray-100 rounded-2xl shadow-sm space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-black transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.doe@example.com"
              className="w-full px-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:outline-none focus:border-black transition-all"
            />
          </div>
          <button className="px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium shadow-lg transform hover:scale-105">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r-2 border-gray-100 p-6 flex flex-col shadow-xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
              CV
            </div>
            <span className="text-2xl font-bold">CloudVault</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: Home, label: 'Dashboard' },
            { id: 'myfiles', icon: Folder, label: 'My Files' },
            { id: 'recent', icon: Clock, label: 'Recent' },
            { id: 'starred', icon: Star, label: 'Starred' },
            { id: 'trash', icon: Trash2, label: 'Trash' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium transform hover:scale-105 ${
                currentPage === item.id
                  ? 'bg-black text-white shadow-lg'
                  : 'hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t-2 border-gray-100 pt-4 space-y-2">
          <button
            onClick={() => handlePageChange('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium transform hover:scale-105 ${
              currentPage === 'profile'
                ? 'bg-black text-white shadow-lg'
                : 'hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all text-red-600 font-medium transform hover:scale-105">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 relative overflow-hidden">
        {/* Animated Background (only for dashboard) */}
        {currentPage === 'dashboard' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-[450px] h-[450px] bg-gradient-to-br from-purple-500 to-pink-500 opacity-40 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-10 w-[550px] h-[550px] bg-gradient-to-br from-blue-500 to-cyan-500 opacity-40 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-green-500 to-emerald-500 opacity-40 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          </div>
        )}
        
        <div className="relative z-10">
          {currentPage === 'dashboard' && renderDashboard()}
          {currentPage === 'myfiles' && renderMyFiles()}
          {currentPage === 'recent' && renderRecent()}
          {currentPage === 'starred' && renderStarred()}
          {currentPage === 'trash' && renderTrash()}
          {currentPage === 'profile' && renderProfile()}
        </div>
      </div>
    </div>
  );
}

export default App;