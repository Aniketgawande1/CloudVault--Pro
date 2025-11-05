"use client"

import React, { useState, useEffect } from 'react';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import UploadModal from './components/modals/UploadModal';
import FolderModal from './components/modals/FolderModal';
import { api } from './api/api';

// Mock data
const mockFiles = [
  { id: 1, name: 'Project Proposal.pdf', type: 'pdf', size: '2.4 MB', modified: '2 hours ago', starred: false },
  { id: 2, name: 'Marketing Assets', type: 'folder', size: '12 files', modified: '1 day ago', starred: true },
  { id: 3, name: 'Budget 2025.xlsx', type: 'excel', size: '856 KB', modified: '3 days ago', starred: false },
  { id: 4, name: 'Team Photo.jpg', type: 'image', size: '4.2 MB', modified: '1 week ago', starred: true },
  { id: 5, name: 'Presentation.pptx', type: 'ppt', size: '8.1 MB', modified: '2 weeks ago', starred: false },
  { id: 6, name: 'Development Docs', type: 'folder', size: '28 files', modified: '3 weeks ago', starred: false },
];

const recentFiles = [
  { id: 1, name: 'Q4 Report.pdf', type: 'pdf', modified: '5 mins ago' },
  { id: 2, name: 'Client Meeting Notes.docx', type: 'doc', modified: '1 hour ago' },
  { id: 3, name: 'Invoice_2024.xlsx', type: 'excel', modified: '3 hours ago' },
];

const trashedFiles = [
  { id: 1, name: 'Old Design.psd', type: 'psd', deletedOn: '2 days ago' },
  { id: 2, name: 'Archive 2023', type: 'folder', deletedOn: '1 week ago' },
];

function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [userData, setUserData] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, limit: 1073741824 }); // 1GB
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Dashboard State
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [viewMode, setViewMode] = useState('grid');
  const [files, setFiles] = useState(mockFiles);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploads, setUploads] = useState([]);
  const [serverFiles, setServerFiles] = useState([]);
  const [backups, setBackups] = useState([{ id: 1 }, { id: 2 }, { id: 3 }]);

  // Check for existing session on mount - validate token with server
  useEffect(() => {
    console.log('[AUTH CHECK] 🔍 Checking for existing session (validating token)...');
    const init = async () => {
      if (typeof window === 'undefined') return;
      const savedToken = localStorage.getItem('authToken');
      const savedUserData = localStorage.getItem('userData');

      if (!savedToken) {
        console.log('[AUTH CHECK] ℹ️  No saved token found');
        return;
      }

      try {
        // Validate token with server (/auth/me)
        const me = await api.getCurrentUser();
        console.log('[AUTH CHECK] server /auth/me response:', me);

        if (me && (me.user || me.status === 'success')) {
          // prefer server-provided user object
          const user = me.user || (me.data && me.data.user) || (savedUserData ? JSON.parse(savedUserData) : null);
          if (user) {
            setUserData(user);
            if (me.storage) setStorageInfo(me.storage);
            // ensure localStorage has up-to-date user data
            try { localStorage.setItem('userData', JSON.stringify(user)); } catch(e) {}
            setIsAuthenticated(true);
            console.log('[AUTH CHECK] ✅ Token validated, logged in as', user.email || user.user_id);
            return;
          }
        }

        // If we reach here token is not valid or server did not return user
        console.warn('[AUTH CHECK] ⚠️ Token invalid or /auth/me did not return user - clearing session');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } catch (err) {
        console.error('[AUTH CHECK] ❌ Token validation failed:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    };

    init();
  }, []);

  // Fetch files when authenticated
  useEffect(() => {
    if (isAuthenticated && userData) {
      console.log('[FILE FETCH] 📂 User authenticated, preparing to fetch files...');
      setTimeout(() => {
        fetchFilesForUser(userData.user_id || userData.email);
      }, 200);
    }
  }, [isAuthenticated, userData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('[AUTH LOGIN] 🔐 Attempting login for:', email);
    console.log('[AUTH LOGIN] Email:', email, 'Password length:', password.length);
    setAuthError('');
    setIsAuthLoading(true);

    try {
      const result = await api.login(email, password);
      console.log('[AUTH LOGIN] ✅ Login successful:', result);

      if (result.user && result.token) {
        const userDataToSave = {
          ...result.user,
          email: result.user.email || email
        };
        
        console.log('[AUTH LOGIN] 💾 Saving user data:', userDataToSave);
        setUserData(userDataToSave);
        if (result.storage) {
          setStorageInfo(result.storage);
        }
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // Small delay for state sync
        setTimeout(() => {
          console.log('[AUTH LOGIN] ✅ Setting isAuthenticated to true');
          setIsAuthenticated(true);
        }, 100);
      } else {
        console.error('[AUTH LOGIN] ❌ Invalid response - missing user or token');
        setAuthError('Invalid response from server');
      }
    } catch (error) {
      console.error('[AUTH LOGIN] ❌ Login failed:', error);
      setAuthError(error.message || 'Invalid email or password');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log('[AUTH SIGNUP] 📝 Attempting signup for:', email);
    console.log('[AUTH SIGNUP] Email:', email, 'Password length:', password.length, 'Full name:', fullName);
    setAuthError('');

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setIsAuthLoading(true);

    try {
      const result = await api.signup(email, password, fullName);
      console.log('[AUTH SIGNUP] ✅ Account created successfully:', result);

      if (result.user && result.token) {
        const userDataToSave = {
          ...result.user,
          email: result.user.email || email
        };
        
        console.log('[AUTH SIGNUP] 💾 Saving user data:', userDataToSave);
        setUserData(userDataToSave);
        if (result.storage) {
          setStorageInfo(result.storage);
        }
        
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
        
        // Small delay for state sync
        setTimeout(() => {
          console.log('[AUTH SIGNUP] ✅ Setting isAuthenticated to true');
          setIsAuthenticated(true);
        }, 100);
      } else {
        console.error('[AUTH SIGNUP] ❌ Invalid response - missing user or token');
        setAuthError('Invalid response from server');
      }
    } catch (error) {
      console.error('[AUTH SIGNUP] ❌ Signup failed:', error);
      setAuthError(error.message || 'Failed to create account');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('[AUTH LOGOUT] 👋 Logging out user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
    setServerFiles([]);
    setUploads([]);
  };

  const fetchFilesForUser = async (userPath) => {
    console.log('[FILE FETCH] 📂 Fetching files for:', userPath);
    try {
      const result = await api.listFiles(userPath);
      console.log('[FILE FETCH] ✅ Files fetched successfully:', result);
      
      if (result.files) {
        setServerFiles(result.files);
        setUploads(result.files.map((file, idx) => ({
          id: idx + 1,
          name: file.filename || file.name,
          date: file.uploaded_at || new Date().toISOString().split('T')[0],
          size: file.size || 0
        })));
      }
      
      if (result.storage) {
        setStorageInfo(result.storage);
      }
    } catch (error) {
      console.error('[FILE FETCH] ❌ Error fetching files:', error);
      
      // Only logout on authentication errors, not network errors
      if (error.message?.includes('token') || error.message?.includes('auth')) {
        console.log('[FILE FETCH] 🔐 Token error, logging out');
        handleLogout();
      } else {
        console.log('[FILE FETCH] ℹ️  Network error, keeping user logged in');
        setServerFiles([]);
      }
    }
  };

  const handleDownloadFile = async (filename) => {
    try {
      const result = await api.downloadFile(filename);
      console.log('[DOWNLOAD] ✅ File downloaded:', filename);
      
      // Create download link
      const link = document.createElement('a');
      link.href = `data:application/octet-stream;base64,${result.content}`;
      link.download = filename;
      link.click();
    } catch (error) {
      console.error('[DOWNLOAD] ❌ Error:', error);
    }
  };

  const handleDeleteFile = async (filename) => {
    // Placeholder for delete functionality
    console.log('[DELETE] Deleting file:', filename);
    setServerFiles(serverFiles.filter(f => f.filename !== filename));
  };

  const handleUpload = async (filename, base64Content) => {
    console.log('[UPLOAD] Uploading file:', filename);
    try {
      const result = await api.uploadFile(filename, base64Content, 'base64');
      console.log('[UPLOAD] ✅ File uploaded successfully:', result);
      
      // Refresh file list
      if (userData) {
        await fetchFilesForUser(userData.user_id || userData.email);
      }
      
      return result;
    } catch (error) {
      console.error('[UPLOAD] ❌ Upload failed:', error);
      throw error;
    }
  };

  const handleCreateFolder = async (folderName) => {
    console.log('[FOLDER] Creating folder:', folderName);
    try {
      // Create a .folder marker file (empty content is now allowed by backend)
      const result = await api.uploadFile(`${folderName}/.folder`, '', 'base64');
      console.log('[FOLDER] ✅ Folder created successfully:', result);
      
      // Refresh file list
      if (userData) {
        await fetchFilesForUser(userData.user_id || userData.email);
      }
      
      return result;
    } catch (error) {
      console.error('[FOLDER] ❌ Folder creation failed:', error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        isAuthLoading={isAuthLoading}
        authError={authError}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        fullName={fullName}
        setFullName={setFullName}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        isAuthenticated={isAuthenticated}
        userData={userData}
      />
    );
  }

  return (
    <>
      <Dashboard
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
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
        handleLogout={handleLogout}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        handleDownloadFile={handleDownloadFile}
        handleDeleteFile={handleDeleteFile}
        files={files}
        setFiles={setFiles}
        recentFiles={recentFiles}
        trashedFiles={trashedFiles}
      />
      
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />
      
      <FolderModal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
}

export default App;
