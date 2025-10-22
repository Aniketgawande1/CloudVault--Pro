'use client'
import React, { useState, useEffect } from 'react';
import { Cloud, Upload, FileText, User, Settings, LogOut, Menu, X, FolderOpen, Clock, Shield, Zap } from 'lucide-react';

export default function CloudVault() {
  const [currentPage, setCurrentPage] = useState('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [token, setToken] = useState('');
  // Load token on client after mount to avoid SSR window reference
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('cloudvault_token');
        if (stored) setToken(stored);
      }
    } catch {}
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState([
    { id: 1, name: 'Financial_Report_Q4.pdf', size: '2.4 MB', date: '2025-10-20', status: 'completed' },
    { id: 2, name: 'Project_Presentation.pptx', size: '5.1 MB', date: '2025-10-19', status: 'completed' },
    { id: 3, name: 'Team_Photo.jpg', size: '1.8 MB', date: '2025-10-18', status: 'completed' }
  ]);

  const handleLogin = () => {
    if (email && password) {
      // Use provided token if present; otherwise fall back to demo API key for local dev
      const provided = (token || '').trim();
      const effectiveToken = provided || 'cloudvault_test_api_key_12345';
      setToken(effectiveToken);
      try { window.localStorage.setItem('cloudvault_token', effectiveToken); } catch {}
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } else {
      alert('Please enter both email and password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('auth');
    setEmail('');
    setPassword('');
    setToken('');
    window.localStorage.removeItem('cloudvault_token');
  };

  const simulateUpload = () => {
    // Demo: create a small file payload and POST to server upload endpoint
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    const uploadUrl = `${apiBase}/upload`;

    const demoFilename = `demo_upload_${Date.now()}.txt`;
    const content = `Demo file uploaded at ${new Date().toISOString()}`;

    setUploadProgress(5);

    // Try multiple upload paths (some server files mount at /upload or /)
    fetchWithFallback(['/upload', '/'], {
      method: 'POST',
      body: JSON.stringify({ filename: demoFilename, content: btoa(content), encoding: 'base64' })
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        setUploadProgress(50);
        const data = await res.json();
        // Update uploads list with returned file info when available
        const newFile = {
          id: Date.now(),
          name: demoFilename,
          size: `${(content.length / 1024).toFixed(2)} KB`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
        };
        setUploads(prev => [newFile, ...prev]);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1200);
      })
      .catch((err) => {
        console.error(err);
        setUploadProgress(0);
        alert('Upload failed. See console for details.');
      });
  };

  const fetchFilesForUser = async (userPath = 'test_user') => {
    try {
      const res = await fetchWithFallback(['/files/list', '/list'], {
        method: 'POST',
        body: JSON.stringify({ user_path: userPath })
      });

      const data = await res.json();
      if (data && data.files) {
        // Map server file objects to client uploads shape
        const serverFiles = data.files.map((f, idx) => ({
          id: idx + 1 + Math.floor(Math.random() * 1000),
          name: f.name || f.filename || f.path || `file_${idx}`,
          size: f.size ? `${Math.round(f.size / 1024)} KB` : '—',
          date: f.created ? f.created.split('T')[0] : '—',
          status: 'completed'
        }));
        setUploads(serverFiles);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to fetch files from server. See console for details.');
    }
  };

  // Helper that tries multiple possible endpoint prefixes to maximize chance of connecting
  const fetchWithFallback = async (paths, options = {}) => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';
    let lastErr = null;
    for (const p of paths) {
      const url = `${apiBase}${p}`;
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res;
      } catch (e) {
        lastErr = e;
        console.warn(`Attempt to ${url} failed:`, e.message);
        continue;
      }
    }
    throw lastErr || new Error('All endpoints failed');
  };

  // Auth Page
  const AuthPage = () => (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-black opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-black opacity-5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-black opacity-3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8" style={{animation: 'fadeIn 0.6s ease-out'}}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <Cloud className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">Cloud Vault</h1>
          <p className="text-gray-600 text-lg">Secure Document Storage & Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300"
             style={{animation: 'fadeIn 0.8s ease-out'}}>
          <form className="space-y-6" onSubmit={(e)=>{ e.preventDefault(); handleLogin(); }} noValidate>
            <div style={{animation: 'fadeIn 1s ease-out'}}>
              <label className="block text-black text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black transition-all duration-300 transform hover:scale-102"
                placeholder="your.email@example.com"
                autoComplete="email"
              />
            </div>
            
            {/* Token field removed intentionally for cleaner UI; token is handled internally for dev */}

            <div style={{animation: 'fadeIn 1.2s ease-out'}}>
              <label className="block text-black text-sm font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black focus:ring-2 focus:ring-black transition-all duration-300 transform hover:scale-102"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              style={{animation: 'fadeIn 1.4s ease-out'}}
            >
              Sign In to Cloud Vault
            </button>
          </form>

          <div className="mt-6 text-center" style={{animation: 'fadeIn 1.6s ease-out'}}>
            <button className="text-gray-600 hover:text-black text-sm transition-colors duration-300">
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: Shield, text: 'Secure', delay: '1.8s' },
            { icon: Zap, text: 'Fast', delay: '2s' },
            { icon: Cloud, text: 'Reliable', delay: '2.2s' }
          ].map((feature, idx) => (
            <div key={idx} 
                 className="bg-white border-2 border-gray-200 rounded-2xl p-4 transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
                 style={{animation: `fadeIn 0.5s ease-out ${feature.delay} both`}}>
              <feature.icon className="w-6 h-6 text-black mx-auto mb-2" />
              <p className="text-black text-sm font-semibold">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* Additional Info Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { label: 'Total Users', value: '10K+', delay: '2.4s' },
            { label: 'Files Stored', value: '1M+', delay: '2.6s' }
          ].map((stat, idx) => (
            <div key={idx} 
                 className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 text-center transform hover:scale-105 transition-all duration-300 shadow-lg"
                 style={{animation: `fadeIn 0.5s ease-out ${stat.delay} both`}}>
              <p className="text-2xl font-bold text-black mb-1">{stat.value}</p>
              <p className="text-gray-600 text-xs font-semibold">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Dashboard Page
  const DashboardPage = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-black to-gray-800 border-2 border-gray-200 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, John!</h1>
            <p className="text-gray-300 text-lg">Here's what's happening with your cloud storage today</p>
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
          { label: 'Total Documents', value: '1,234', icon: FileText, change: '+12%', color: 'from-blue-50 to-white', iconBg: 'bg-blue-100' },
          { label: 'Storage Used', value: '45.8 GB', icon: Cloud, change: '+5.2%', color: 'from-purple-50 to-white', iconBg: 'bg-purple-100' },
          { label: 'Recent Uploads', value: '23', icon: Upload, change: '+8', color: 'from-green-50 to-white', iconBg: 'bg-green-100' },
          { label: 'Shared Files', value: '156', icon: FolderOpen, change: '+3', color: 'from-orange-50 to-white', iconBg: 'bg-orange-100' }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} border-2 border-gray-200 rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-black" />
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-gray-600 text-sm font-semibold mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-black">{stat.value}</p>
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
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-black hover:bg-gray-50 transition-all duration-300 cursor-pointer"
      onClick={simulateUpload}>
            <div className="w-20 h-20 bg-black bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-10 h-10 text-black" />
            </div>
            <p className="text-black text-xl font-bold mb-2">Drop files here or click to browse</p>
            <p className="text-gray-600 mb-4">Support for PDF, DOCX, XLSX, JPG, PNG files up to 50MB</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield className="w-4 h-4 mr-1" /> Encrypted
              </span>
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1" /> Fast Upload
              </span>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button onClick={() => fetchFilesForUser('test_user')} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              Refresh Files
            </button>
            <button onClick={() => fetchFilesForUser('test_user')} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
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
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
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
                <p className="text-3xl font-bold text-black">45.8%</p>
                <p className="text-sm text-gray-600">Used</p>
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
          <button className="w-full mt-4 bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all duration-300">
            Upgrade Storage
          </button>
        </div>
      </div>

      {/* Recent Files */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Recent Documents</h2>
            <p className="text-gray-600 text-sm">Your latest uploaded files and documents</p>
          </div>
          <button className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {uploads.map((file, idx) => (
            <div key={file.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-black transition-all duration-300 transform hover:scale-102 shadow-md hover:shadow-lg"
                 style={{animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`}}>
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-200">
                  <FileText className="w-7 h-7 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-black font-bold text-lg">{file.name}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-gray-600 text-sm flex items-center">
                      <Cloud className="w-4 h-4 mr-1" />
                      {file.size}
                    </span>
                    <span className="text-gray-600 text-sm flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {file.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                  ✓ {file.status}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-black mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { action: 'Uploaded', file: 'Financial_Report.pdf', time: '2 hours ago' },
              { action: 'Shared', file: 'Team_Presentation.pptx', time: '5 hours ago' },
              { action: 'Modified', file: 'Project_Plan.docx', time: '1 day ago' },
              { action: 'Deleted', file: 'Old_Draft.txt', time: '2 days ago' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-black transition-all duration-300">
                <div className="w-10 h-10 bg-black bg-opacity-10 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1">
                  <p className="text-black font-semibold">
                    <span className="text-gray-600">{activity.action}</span> {activity.file}
                  </p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-black mb-6">Quick Statistics</h2>
          <div className="space-y-4">
            {[
              { label: 'Files Uploaded Today', value: '12', icon: Upload },
              { label: 'Total Folders', value: '48', icon: FolderOpen },
              { label: 'Shared Links', value: '23', icon: Cloud },
              { label: 'Team Members', value: '8', icon: User }
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-black transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black bg-opacity-10 rounded-full flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-black font-semibold">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold text-black">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Profile Page
  const ProfilePage = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-black mb-2">Profile Settings</h1>
        <p className="text-gray-600 text-lg">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="w-24 h-24 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black mb-1">John Doe</h3>
            <p className="text-gray-600 mb-4">john.doe@example.com</p>
            <button className="w-full bg-black text-white font-semibold py-2 rounded-xl hover:bg-gray-800 transition-all duration-300">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-black mb-6">Account Information</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-black transition-all duration-300"
              />
            </div>
            <button className="bg-black text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transform hover:scale-105 transition-all duration-300">
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Storage Info */}
      <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-black mb-6">Storage Usage</h2>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-black font-semibold">45.8 GB of 100 GB used</span>
            <span className="text-gray-600">45.8%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="bg-black h-full rounded-full" style={{ width: '45.8%' }}></div>
          </div>
        </div>
        <p className="text-gray-600">You have 54.2 GB of storage remaining. Upgrade for more space.</p>
      </div>
    </div>
  );

  // Main Layout
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-white flex">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-50 to-white border-r-2 border-gray-200 transition-all duration-300 flex flex-col shadow-xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && <span className="text-black font-bold text-xl">Cloud Vault</span>}
            </div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-black hover:bg-gray-200 p-2 rounded-lg transition-all duration-300">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className="space-y-2">
            {[
              { icon: FolderOpen, label: 'Dashboard', page: 'dashboard' },
              { icon: User, label: 'Profile', page: 'profile' },
              { icon: Settings, label: 'Settings', page: 'settings' }
            ].map((item) => (
              <button
                key={item.page}
                onClick={() => setCurrentPage(item.page)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  currentPage === item.page
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-semibold">{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-semibold">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-black to-gray-800 opacity-5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-gray-900 to-black opacity-4 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-black to-gray-700 opacity-3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-gray-800 to-black opacity-4 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-black to-gray-900 opacity-3 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2.5s'}}></div>
        </div>
        
        <div className="p-8 relative z-10">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'settings' && (
            <div className="text-black">
              <h1 className="text-4xl font-bold mb-4">Settings</h1>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
