"use client"

import React from 'react';
import { Search, Grid, List, Plus, FolderPlus } from 'lucide-react';

const FilesView = ({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode,
  setShowUploadModal,
  setShowNewFolderModal,
  serverFiles
}) => {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">My Files</h1>
        <p className="text-gray-600">Manage and organize your files</p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600 transition-all"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white border-2 border-gray-200 rounded-xl p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Upload</span>
        </button>

        <button
          onClick={() => setShowNewFolderModal(true)}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-black rounded-xl hover:border-black hover:bg-gray-50 transition-all"
        >
          <FolderPlus className="w-5 h-5" />
          <span className="font-semibold">New Folder</span>
        </button>
      </div>

      {/* Files Display */}
      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">All Files ({serverFiles.length})</h2>
        
        {serverFiles.length === 0 ? (
          <div className="text-center py-16">
            <FolderPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No files yet</p>
            <p className="text-gray-400 text-sm mt-2">Upload your first file to get started</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {serverFiles.map((file, idx) => (
              <div 
                key={idx} 
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-indigo-600 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 font-bold">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{file.filename || file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilesView;
