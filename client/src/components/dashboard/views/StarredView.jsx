"use client"

import React from 'react';
import { Star, Eye, Download, Trash2, Share2 } from 'lucide-react';

const StarredView = ({ files, handleViewFile, handleDownloadFile, handleDeleteFile, handleStarFile, handleShareFile }) => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Starred Files</h1>
        <p className="text-gray-600">Files you've marked as favorites</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-4">Starred Files ({files.length})</h2>
        
        {files.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No starred files</p>
            <p className="text-gray-400 text-sm mt-2">Star files to find them easily</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file, idx) => (
              <div 
                key={idx} 
                className="border-2 border-yellow-200 bg-yellow-50 rounded-xl p-4 hover:border-yellow-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white fill-current" />
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
                        className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all text-xs flex items-center justify-center"
                        title="Unstar"
                      >
                        <Star className="w-3 h-3 fill-current" />
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

export default StarredView;
