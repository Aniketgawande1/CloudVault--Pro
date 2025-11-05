"use client"

import React, { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const statuses = {};

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        statuses[file.name] = 'uploading';
        setUploadStatus({...statuses});

        // Read file as base64
        const reader = new FileReader();
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Upload to server
        await onUpload(file.name, base64);
        
        statuses[file.name] = 'success';
        setUploadStatus({...statuses});
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        statuses[file.name] = 'error';
        setUploadStatus({...statuses});
      }
    }

    setUploading(false);
    
    // Close modal after successful uploads
    setTimeout(() => {
      if (Object.values(statuses).every(s => s === 'success')) {
        handleClose();
      }
    }, 1500);
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setUploadStatus({});
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black">Upload Files</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-black mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              Support for all file types
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-black mb-3">
                Selected Files ({selectedFiles.length})
              </h3>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
                      <File className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    {uploadStatus[file.name] === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                    {uploadStatus[file.name] === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    {uploadStatus[file.name] === 'uploading' && (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                  </div>
                  {!uploading && !uploadStatus[file.name] && (
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-3 border-2 border-gray-200 text-black rounded-xl hover:border-black hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
