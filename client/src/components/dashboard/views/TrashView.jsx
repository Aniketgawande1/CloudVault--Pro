"use client"

import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';

const TrashView = ({ files }) => {
  const [trashedFiles, setTrashedFiles] = useState(files);

  const handleRestore = (fileId) => {
    console.log('[TRASH] Restoring file:', fileId);
    // In a real app, call API to restore
    setTrashedFiles(prev => prev.filter(f => f.id !== fileId));
    // Show success message
    alert('File restored successfully!');
  };

  const handlePermanentDelete = (fileId) => {
    if (confirm('Are you sure you want to permanently delete this file? This cannot be undone.')) {
      console.log('[TRASH] Permanently deleting file:', fileId);
      // In a real app, call API to permanently delete
      setTrashedFiles(prev => prev.filter(f => f.id !== fileId));
      // Show success message
      alert('File permanently deleted!');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Trash</h1>
        <p className="text-gray-600">Files you've deleted</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        {trashedFiles.length === 0 ? (
          <div className="text-center py-16">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">Trash is empty</p>
            <p className="text-gray-400 text-sm mt-2">Deleted files will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Warning Message */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Items in trash</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Files will be permanently deleted after 30 days
                </p>
              </div>
            </div>

            {trashedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-sm text-gray-500">Deleted {file.deletedOn}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(file.id)}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-semibold flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(file.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrashView;
