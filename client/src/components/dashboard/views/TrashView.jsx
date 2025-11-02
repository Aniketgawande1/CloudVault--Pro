import React from 'react';
import { Trash2 } from 'lucide-react';

const TrashView = ({ files }) => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Trash</h1>
        <p className="text-gray-600">Files you've deleted</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        {files.length === 0 ? (
          <div className="text-center py-16">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Trash is empty</p>
            <p className="text-gray-400 text-sm mt-2">Deleted files will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 transition-all">
                <div>
                  <p className="font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-500">Deleted {file.deletedOn}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    Restore
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
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
