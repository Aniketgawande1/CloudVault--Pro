import React from 'react';
import { Cloud, FileText, Upload, FolderOpen } from 'lucide-react';

const DashboardView = ({ userData, storageInfo, uploads, serverFiles, backups }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-2 animate-fade-in-up">
              Welcome back, {userData?.full_name || 'User'}! 👋
            </h1>
            <p className="text-purple-200 text-lg">Here's what's happening with your cloud storage today</p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Cloud className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        
        {/* Storage Info */}
        <div className="mt-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Storage Usage</span>
            <span className="text-white font-bold">
              {formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.limit)}
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(storageInfo.used / storageInfo.limit) * 100}%` }}
            ></div>
          </div>
          <p className="text-purple-200 text-sm mt-2">
            {((storageInfo.used / storageInfo.limit) * 100).toFixed(1)}% used • 
            {formatFileSize(storageInfo.limit - storageInfo.used)} remaining
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Documents', value: uploads.length.toString(), icon: FileText, change: '+12%', bg: 'from-indigo-50 to-white', iconBg: 'from-indigo-500 to-indigo-700' },
          { label: 'Storage Used', value: formatFileSize(serverFiles.reduce((sum, f) => sum + (f.size || 0), 0)), icon: Cloud, change: '+5.2%', bg: 'from-purple-50 to-white', iconBg: 'from-purple-500 to-purple-700' },
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

      {/* Recent Files */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-black mb-4">Recent Files</h2>
        <div className="space-y-2">
          {serverFiles.slice(0, 5).map((file, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <FileText className="w-8 h-8 text-indigo-600" />
              <div className="flex-1">
                <p className="font-semibold">{file.filename || file.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(file.size || 0)}</p>
              </div>
            </div>
          ))}
          {serverFiles.length === 0 && (
            <p className="text-center text-gray-500 py-8">No files uploaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
