"use client"

import React from 'react';
import { Clock } from 'lucide-react';

const RecentView = ({ files }) => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Recent Files</h1>
        <p className="text-gray-600">Files you've accessed recently</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        {files.length === 0 ? (
          <div className="text-center py-16">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No recent files</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-600 transition-all">
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">{file.modified}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentView;
