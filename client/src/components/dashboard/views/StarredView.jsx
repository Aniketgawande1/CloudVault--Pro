import React from 'react';
import { Star } from 'lucide-react';

const StarredView = ({ files }) => {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-black mb-2">Starred Files</h1>
        <p className="text-gray-600">Files you've marked as favorites</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-6">
        {files.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No starred files</p>
            <p className="text-gray-400 text-sm mt-2">Star files to find them easily</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {files.map((file) => (
              <div key={file.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-yellow-500 transition-all">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <p className="font-semibold">{file.name}</p>
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
