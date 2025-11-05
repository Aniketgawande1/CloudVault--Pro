"use client"

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
      {/* Welcome Header - Enhanced Black Theme */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl shadow-2xl border border-gray-700">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500 to-blue-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Cloud className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black mb-1 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Welcome back!
                  </h1>
                  <p className="text-2xl font-semibold text-gray-300">
                    {userData?.full_name || userData?.email || 'User'} 👋
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-lg ml-20">
                Your files are safe and secure in the cloud
              </p>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap gap-3 ml-20">
            <div className="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span className="text-white font-bold">1 GB Free Storage</span>
            </div>
            <div className="px-5 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full border border-gray-600 flex items-center gap-2">
              <span className="text-2xl">📁</span>
              <span className="text-white font-semibold">{uploads.length} Files</span>
            </div>
            <div className="px-5 py-3 bg-white bg-opacity-10 backdrop-blur-sm rounded-full border border-gray-600 flex items-center gap-2">
              <span className="text-2xl">💾</span>
              <span className="text-gray-300 font-semibold">{formatFileSize(storageInfo.limit - storageInfo.used)} Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Enhanced Black Theme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Files', value: uploads.length.toString(), icon: FileText, change: '+12%', bg: 'from-blue-500 to-blue-700', iconColor: 'text-blue-500' },
          { label: 'Storage Used', value: formatFileSize(serverFiles.reduce((sum, f) => sum + (f.size || 0), 0)), icon: Cloud, change: '+5.2%', bg: 'from-purple-500 to-purple-700', iconColor: 'text-purple-500' },
          { label: 'Recent Activity', value: uploads.filter(u => u.date === new Date().toISOString().split('T')[0]).length.toString(), icon: Upload, change: '+8', bg: 'from-green-500 to-green-700', iconColor: 'text-green-500' },
          { label: 'Backups', value: backups.length.toString(), icon: FolderOpen, change: '+3', bg: 'from-orange-500 to-orange-700', iconColor: 'text-orange-500' }
        ].map((stat, idx) => (
          <div key={idx} className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100 hover:border-gray-300">
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-full border-2 border-green-200">
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-2 uppercase tracking-wide">{stat.label}</p>
              <p className="text-4xl font-black text-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Files - Enhanced */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-black">Recent Files</h2>
            </div>
            <span className="text-sm text-gray-500 font-medium">{serverFiles.length} total</span>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {serverFiles.slice(0, 5).map((file, idx) => (
              <div key={idx} className="group flex items-center gap-4 p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white rounded-xl transition-all cursor-pointer border-2 border-transparent hover:border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-black truncate group-hover:text-blue-600 transition-colors">{file.filename || file.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size || 0)}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
                    Open
                  </button>
                </div>
              </div>
            ))}
            {serverFiles.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <p className="text-gray-500 text-lg font-semibold">No files uploaded yet</p>
                <p className="text-gray-400 text-sm mt-2">Upload your first file to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
