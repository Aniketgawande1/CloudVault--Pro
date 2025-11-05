"use client"

import React from 'react';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';

const Dashboard = ({
  currentPage,
  setCurrentPage,
  userData,
  storageInfo,
  uploads,
  serverFiles,
  backups,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  setShowUploadModal,
  setShowNewFolderModal,
  handleLogout,
  selectedFile,
  setSelectedFile,
  handleDownloadFile,
  handleDeleteFile,
  files,
  setFiles,
  recentFiles,
  trashedFiles
}) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        userData={userData}
        storageInfo={storageInfo}
        handleLogout={handleLogout}
      />
      
      <DashboardContent
        currentPage={currentPage}
        userData={userData}
        storageInfo={storageInfo}
        uploads={uploads}
        serverFiles={serverFiles}
        backups={backups}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
        setViewMode={setViewMode}
        setShowUploadModal={setShowUploadModal}
        setShowNewFolderModal={setShowNewFolderModal}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        handleDownloadFile={handleDownloadFile}
        handleDeleteFile={handleDeleteFile}
        files={files}
        setFiles={setFiles}
        recentFiles={recentFiles}
        trashedFiles={trashedFiles}
      />
    </div>
  );
};

export default Dashboard;
