"use client"

import React from 'react';
import { Search, Grid, List, Plus, FolderPlus, Download, Trash2, Eye, Star, Share2 } from 'lucide-react';

const FilesView = ({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode,
  setShowUploadModal,
  setShowNewFolderModal,
  serverFiles,
  handleDownloadFile,
  handleDeleteFile,
  handleViewFile,
  handleStarFile,
  handleShareFile
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
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-black hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate mb-1">{file.filename || file.name}</p>
                    <p className="text-xs text-gray-500 mb-3">
                      {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'N/A'}
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStarFile?.(file.filename || file.name);
                        }}
                        className={`p-2 rounded-lg transition-all text-xs flex items-center justify-center ${
                          file.starred 
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600' 
                            : 'bg-gray-200 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                        }`}
                        title={file.starred ? 'Unstar' : 'Star'}
                      >
                        <Star className={`w-3 h-3 ${file.starred ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareFile?.(file);
                        }}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-xs flex items-center justify-center"
                        title="Share"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleViewFile?.(file)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-xs flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleDownloadFile?.(file.filename || file.name)}
                        className="flex-1 px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-xs flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFile?.(file.filename || file.name)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-xs flex items-center justify-center"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
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
