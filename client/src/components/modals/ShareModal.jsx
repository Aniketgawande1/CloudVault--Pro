"use client"

import React, { useState } from 'react';
import { X, Copy, Facebook, Twitter, Mail, MessageCircle, Check } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, file }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const fileName = file.filename || file.name;
  const shareText = `Check out this file: ${fileName}`;
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/file/${encodeURIComponent(fileName)}` : '';

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    }
  };

  const shareVia = (platform) => {
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(fileName)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Share File</h2>
              <p className="text-green-100 text-sm truncate">{fileName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Copy Link */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Share via</label>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => shareVia('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
              </button>

              <button
                onClick={() => shareVia('facebook')}
                className="flex flex-col items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Facebook</span>
              </button>

              <button
                onClick={() => shareVia('twitter')}
                className="flex flex-col items-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Twitter</span>
              </button>

              <button
                onClick={() => shareVia('email')}
                className="flex flex-col items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Email</span>
              </button>
            </div>
          </div>

          {/* Native Share Button (Mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={nativeShare}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              Share via Other Apps
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
