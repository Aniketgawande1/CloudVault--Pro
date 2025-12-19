"use client"

import React from 'react';
import { Cloud, FileText, Upload, FolderOpen, TrendingUp, Clock, Shield, Star, Share2 } from 'lucide-react';

const DashboardView = ({ userData, storageInfo, uploads, serverFiles, backups, handleViewFile, handleStarFile, handleShareFile }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = ((storageInfo.used / storageInfo.limit) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <Cloud className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {userData?.full_name || userData?.email?.split('@')[0] || 'User'}! 👋
                </h2>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-md">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free Tier
                  </span>
                  <span className="text-gray-600 font-medium">
                    Get <span className="text-blue-600 font-bold">1 GB</span> of secure cloud storage absolutely free
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-green-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-bold">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Files', 
              value: serverFiles.length.toString(), 
              icon: FileText, 
              change: '+12%', 
              gradient: 'from-blue-500 to-cyan-500',
              bgGradient: 'from-blue-50 to-cyan-50',
              iconBg: 'from-blue-100 to-cyan-100'
            },
            { 
              label: 'Storage Used', 
              value: formatFileSize(serverFiles.reduce((sum, f) => sum + (f.size || 0), 0)), 
              icon: Cloud, 
              change: '+5.2%', 
              gradient: 'from-purple-500 to-pink-500',
              bgGradient: 'from-purple-50 to-pink-50',
              iconBg: 'from-purple-100 to-pink-100'
            },
            { 
              label: 'Recent Activity', 
              value: uploads.filter(u => u.date === new Date().toISOString().split('T')[0]).length.toString(), 
              icon: Upload, 
              change: '+8 today', 
              gradient: 'from-green-500 to-emerald-500',
              bgGradient: 'from-green-50 to-emerald-50',
              iconBg: 'from-green-100 to-emerald-100'
            },
            { 
              label: 'Total Backups', 
              value: backups.length.toString(), 
              icon: FolderOpen, 
              change: 'All secure', 
              gradient: 'from-orange-500 to-red-500',
              bgGradient: 'from-orange-50 to-red-50',
              iconBg: 'from-orange-100 to-red-100'
            }
          ].map((stat, idx) => (
            <div key={idx} className="group relative">
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-transparent hover:border-white overflow-hidden`}>
                {/* Animated background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <stat.icon className={`w-7 h-7 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`} style={{ strokeWidth: 2.5 }} />
                    </div>
                    <span className="px-3 py-1.5 bg-white rounded-full text-xs font-bold text-gray-700 shadow-sm">
                      {stat.change}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2 uppercase tracking-wider">
                      {stat.label}
                    </p>
                    <p className={`text-4xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Files - Professional Layout */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-black p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Recent Files</h2>
                  <p className="text-gray-400 text-sm">Quick access to your latest uploads</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{serverFiles.length}</p>
                <p className="text-gray-400 text-sm">Total Files</p>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="p-6">
            {serverFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No files yet</h3>
                <p className="text-gray-500 mb-6">Start by uploading your first file</p>
                <button className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg">
                  Upload Now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {serverFiles.slice(0, 5).map((file, idx) => (
                  <div 
                    key={idx} 
                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border-2 border-transparent hover:border-blue-200 cursor-pointer"
                  >
                    {/* File Icon */}
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors text-lg">
                        {file.filename || file.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500 font-medium">
                          {formatFileSize(file.size || 0)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {file.uploaded_at || 'Recently added'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarFile && handleStarFile(file.filename || file.name);
                        }}
                        className={`p-2.5 rounded-xl transition-all shadow-lg ${
                          file.starred 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                        }`}
                        title={file.starred ? 'Unstar' : 'Star'}
                      >
                        <Star className={`w-4 h-4 ${file.starred ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareFile && handleShareFile(file);
                        }}
                        className="p-2.5 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-all shadow-lg"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleViewFile && handleViewFile(file)}
                        className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                      >
                        <span>Open</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Button */}
            {serverFiles.length > 5 && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                  View All {serverFiles.length} Files
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-white mb-4">
              Upload Your Files
            </h3>
            <p className="text-blue-100 text-lg mb-8">
              Drag and drop your files or click the button below to get started. You have{' '}
              <span className="font-bold text-white">{formatFileSize(storageInfo.limit - storageInfo.used)}</span> available.
            </p>
            <button 
              onClick={() => document.dispatchEvent(new CustomEvent('openUploadModal'))}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-xl font-bold text-lg shadow-2xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-300"
            >
              <Upload className="w-6 h-6" />
              Choose Files to Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
