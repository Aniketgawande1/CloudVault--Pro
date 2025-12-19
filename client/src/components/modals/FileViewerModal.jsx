"use client"

import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, File } from 'lucide-react';

const FileViewerModal = ({ isOpen, onClose, file, fileContent }) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Reset zoom and rotation when file changes
    setZoom(100);
    setRotation(0);
  }, [file]);

  if (!isOpen || !file) return null;

  const getFileType = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(ext)) return 'text';
    if (['doc', 'docx'].includes(ext)) return 'document';
    if (['html', 'htm'].includes(ext)) return 'html';
    return 'unknown';
  };

  const fileType = getFileType(file.filename || file.name);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${fileContent}`;
    link.download = file.filename || file.name;
    link.click();
  };

  const renderContent = () => {
    if (!fileContent) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading file...</p>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center p-8 bg-gray-100 rounded-xl overflow-auto" style={{ minHeight: '500px' }}>
            <img
              src={`data:image/${file.filename?.split('.').pop()};base64,${fileContent}`}
              alt={file.filename || file.name}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
                maxWidth: '100%',
                maxHeight: '600px',
              }}
              className="object-contain"
            />
          </div>
        );

      case 'text':
        try {
          const textContent = atob(fileContent);
          return (
            <div className="bg-gray-50 rounded-xl p-6 overflow-auto" style={{ maxHeight: '600px' }}>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {textContent}
              </pre>
            </div>
          );
        } catch (e) {
          return (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Unable to display text content</p>
            </div>
          );
        }

      case 'pdf':
        return (
          <div className="bg-gray-100 rounded-xl p-6">
            <div className="bg-white rounded-lg shadow-inner" style={{ height: '600px' }}>
              <iframe
                src={`data:application/pdf;base64,${fileContent}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full rounded-lg"
                title={file.filename || file.name}
                style={{ border: 'none' }}
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 mb-2">
                If the PDF doesn't display properly, click the download button below
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download PDF
              </button>
            </div>
          </div>
        );

      case 'html':
        try {
          const htmlContent = atob(fileContent);
          return (
            <div className="bg-white rounded-xl p-6 overflow-auto border border-gray-200" style={{ maxHeight: '600px' }}>
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          );
        } catch (e) {
          return (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Unable to display HTML content</p>
            </div>
          );
        }

      default:
        return (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-800 font-semibold mb-2">Preview not available</p>
            <p className="text-gray-600 mb-6">
              This file type cannot be previewed in the browser
            </p>
            <button
              onClick={handleDownload}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all inline-flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download to View
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{file.filename || file.name}</h2>
              <p className="text-gray-400 text-sm">
                {fileType.charAt(0).toUpperCase() + fileType.slice(1)} • {file.size ? `${(file.size / 1024).toFixed(2)} KB` : 'Unknown size'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg flex items-center justify-center transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Toolbar for images */}
        {fileType === 'image' && fileContent && (
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <ZoomOut className="w-4 h-4" />
              Zoom Out
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <ZoomIn className="w-4 h-4" />
              Zoom In
            </button>
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" />
              Rotate
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        )}

        {/* Toolbar for PDFs */}
        {fileType === 'pdf' && fileContent && (
          <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm">PDF Document</span>
            </div>
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>

        {/* Footer */}
        {fileType !== 'image' && fileType !== 'pdf' && fileContent && (
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-3">
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerModal;
