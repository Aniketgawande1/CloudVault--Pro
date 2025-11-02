import React from 'react';
import { Share2 } from 'lucide-react';

const SharedView = () => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Shared Files</h1>
        <p className="text-gray-600">Files shared with you or by you</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        <div className="text-center py-16">
          <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No shared files</p>
          <p className="text-gray-400 text-sm mt-2">Share files with others to collaborate</p>
        </div>
      </div>
    </div>
  );
};

export default SharedView;
