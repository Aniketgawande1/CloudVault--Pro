"use client"

import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

const FolderModal = ({ isOpen, onClose, onCreateFolder }) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    if (folderName.includes('/') || folderName.includes('\\')) {
      setError('Folder name cannot contain / or \\');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateFolder(folderName.trim());
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black">New Folder</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
              disabled={isCreating}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-6 py-3 border-2 border-gray-200 text-black rounded-xl hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !folderName.trim()}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="w-5 h-5" />
                  <span>Create Folder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;
