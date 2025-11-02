import React, { useState } from 'react';
import { Home, Star, Clock, Share2, Trash2, Folder, Cloud, LogOut, User, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, userData, storageInfo, handleLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'indigo' },
    { id: 'files', icon: Folder, label: 'My Files', color: 'blue' },
    { id: 'starred', icon: Star, label: 'Starred', color: 'yellow' },
    { id: 'recent', icon: Clock, label: 'Recent', color: 'green' },
    { id: 'shared', icon: Share2, label: 'Shared', color: 'purple' },
    { id: 'trash', icon: Trash2, label: 'Trash', color: 'red' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white text-black flex flex-col shadow-2xl border-r border-gray-200 transition-all duration-300 relative`}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-all z-10"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg">
            CV
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-2xl font-bold text-black">CloudVault</h1>
              <p className="text-xs text-gray-500">Secure Storage</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed ? (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black truncate">{userData?.full_name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{userData?.email || 'user@example.com'}</p>
            </div>
          </div>
          
          {/* Storage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Storage</span>
              <span className="text-black font-semibold">
                {formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.limit)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-black to-gray-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(storageInfo.used / storageInfo.limit) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {formatFileSize(storageInfo.limit - storageInfo.used)} remaining
            </p>
          </div>
        </div>
      ) : (
        /* Collapsed user avatar */
        <div className="p-4 border-b border-gray-200 flex justify-center group relative">
          <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center cursor-pointer">
            <User className="w-5 h-5 text-white" />
          </div>
          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 top-1/2 -translate-y-1/2">
            <p className="font-semibold">{userData?.full_name || 'User'}</p>
            <p className="text-xs text-gray-300">{userData?.email || 'user@example.com'}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              currentPage === item.id
                ? 'bg-black text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100 hover:text-black'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-semibold">{item.label}</span>}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all group relative`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-semibold">Logout</span>}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <span className="absolute left-full ml-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
