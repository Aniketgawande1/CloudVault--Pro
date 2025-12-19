"use client"

import React from 'react';
import DashboardView from './views/DashboardView';
import FilesView from './views/FilesView';
import StarredView from './views/StarredView';
import RecentView from './views/RecentView';
import SharedView from './views/SharedView';
import TrashView from './views/TrashView';

const DashboardContent = ({
  currentPage,
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
  selectedFile,
  setSelectedFile,
  handleDownloadFile,
  handleDeleteFile,
  handleViewFile,
  handleStarFile,
  handleShareFile,
  files,
  setFiles,
  recentFiles,
  trashedFiles
}) => {
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <DashboardView
            userData={userData}
            storageInfo={storageInfo}
            uploads={uploads}
            serverFiles={serverFiles}
            backups={backups}
            handleViewFile={handleViewFile}
            handleStarFile={handleStarFile}
            handleShareFile={handleShareFile}
          />
        );
      case 'files':
        return (
          <FilesView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            setShowUploadModal={setShowUploadModal}
            setShowNewFolderModal={setShowNewFolderModal}
            files={files}
            setFiles={setFiles}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handleDownloadFile={handleDownloadFile}
            handleDeleteFile={handleDeleteFile}
            handleViewFile={handleViewFile}
            handleStarFile={handleStarFile}
            handleShareFile={handleShareFile}
            serverFiles={serverFiles}
          />
        );
      case 'starred':
        return (
          <StarredView 
            files={serverFiles.filter(f => f.starred)}
            handleViewFile={handleViewFile}
            handleDownloadFile={handleDownloadFile}
            handleDeleteFile={handleDeleteFile}
            handleStarFile={handleStarFile}
            handleShareFile={handleShareFile}
          />
        );
      case 'recent':
        return <RecentView files={recentFiles} />;
      case 'shared':
        return <SharedView />;
      case 'trash':
        return <TrashView files={trashedFiles} />;
      default:
        return <DashboardView userData={userData} storageInfo={storageInfo} />;
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      {renderContent()}
    </div>
  );
};

export default DashboardContent;
