# CloudVault - Component Architecture

## 📦 Component Tree

```
┌─────────────────────────────────────────────────────────────┐
│                          App.jsx                            │
│  • Authentication State Management                          │
│  • File Operations Logic                                    │
│  • API Integration Layer                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
    ┌───────▼──────┐      ┌──────▼───────┐
    │  AuthPage    │      │  Dashboard   │
    │  (if not     │      │  (if auth-   │
    │  authed)     │      │  enticated)  │
    └──────┬───────┘      └──────┬───────┘
           │                     │
    ┌──────┴──────┐       ┌──────┴──────────────┐
    │             │       │                     │
┌───▼────┐  ┌────▼────┐  ┌▼──────┐  ┌──────────▼────────┐
│ Auth   │  │  Auth   │  │Side   │  │ DashboardContent  │
│Branding│  │  Form   │  │bar    │  │    (Router)       │
└────────┘  └─────────┘  └───────┘  └───────┬───────────┘
                                             │
                    ┌────────────────────────┼──────────────┐
                    │                        │              │
            ┌───────▼────┐          ┌────────▼──────┐  ┌───▼─────┐
            │ Dashboard  │          │  FilesView    │  │Starred  │
            │   View     │          │               │  │  View   │
            └────────────┘          └───────────────┘  └─────────┘
                    │
            ┌───────┼───────┐
            │       │       │
        ┌───▼──┐ ┌──▼──┐ ┌─▼────┐
        │Recent│ │Shared│ │Trash │
        │ View │ │ View │ │ View │
        └──────┘ └──────┘ └──────┘
```

## 📂 File Structure

```
client/src/
│
├── 🚀 App.jsx                               # Main entry - State & Logic
│
├── 🌐 api/
│   └── api.js                               # API service layer
│
├── 🎨 components/
│   │
│   ├── 🔐 auth/                            # Authentication Module
│   │   ├── AuthPage.jsx                    # Container (Layout)
│   │   ├── AuthBranding.jsx                # Branding Section
│   │   └── AuthForm.jsx                    # Form Component
│   │
│   └── 📊 dashboard/                       # Dashboard Module
│       ├── Dashboard.jsx                   # Container (Layout)
│       ├── Sidebar.jsx                     # Navigation
│       ├── DashboardContent.jsx            # View Router
│       │
│       └── 📁 views/                       # Individual Views
│           ├── DashboardView.jsx           # Home/Stats
│           ├── FilesView.jsx               # Files Management
│           ├── StarredView.jsx             # Favorites
│           ├── RecentView.jsx              # Recent Files
│           ├── SharedView.jsx              # Shared Files
│           └── TrashView.jsx               # Deleted Files
│
└── 💅 index.css                            # Global Styles
```

## 🔄 Data Flow

### Authentication Flow
```
User Action
    │
    ▼
[Email/Password Input] → AuthForm
    │
    ▼
handleLogin/handleSignup → App.jsx
    │
    ▼
api.login/api.signup → Server
    │
    ▼
JWT Token + User Data ← Server
    │
    ▼
localStorage.setItem('authToken')
    │
    ▼
setIsAuthenticated(true)
    │
    ▼
Dashboard Rendered
```

### File Operations Flow
```
User clicks "My Files"
    │
    ▼
setCurrentPage('files') → Sidebar
    │
    ▼
DashboardContent → FilesView
    │
    ▼
Displays serverFiles from App state
    │
    ▼
User uploads file
    │
    ▼
api.uploadFile() → Server
    │
    ▼
fetchFilesForUser() → Refresh list
    │
    ▼
setServerFiles(newFiles)
    │
    ▼
FilesView re-renders with new data
```

## 📋 Component Responsibilities

### 🎯 App.jsx (Main Controller)
```javascript
Responsibilities:
├── State Management (Auth, Files, Storage)
├── API Calls (Login, Signup, File Operations)
├── Route Decision (Auth vs Dashboard)
└── Props Distribution to Children
```

### 🔐 Auth Module
```javascript
AuthPage (Container)
├── Layout: Side-by-side
├── AuthBranding (Left - 50%)
│   ├── Logo & Tagline
│   ├── Feature Highlights
│   └── Animated Background
└── AuthForm (Right - 50%)
    ├── Login/Signup Toggle
    ├── Form Inputs
    ├── Validation
    └── Submit Handlers
```

### 📊 Dashboard Module
```javascript
Dashboard (Container)
├── Layout: Sidebar + Content
├── Sidebar (Fixed Left - 288px)
│   ├── User Info
│   ├── Storage Bar
│   ├── Navigation Menu
│   └── Logout Button
└── DashboardContent (Flex - Remaining)
    └── Views (Conditional Render)
        ├── DashboardView (Home)
        ├── FilesView (File Manager)
        ├── StarredView (Favorites)
        ├── RecentView (Recent)
        ├── SharedView (Shared)
        └── TrashView (Deleted)
```

## 🎨 Component Props

### AuthPage Props (12)
```typescript
{
  authMode: 'login' | 'signup',
  setAuthMode: (mode) => void,
  handleLogin: (e) => Promise<void>,
  handleSignup: (e) => Promise<void>,
  isAuthLoading: boolean,
  authError: string,
  email: string,
  setEmail: (email) => void,
  password: string,
  setPassword: (pass) => void,
  fullName: string,
  setFullName: (name) => void,
  showPassword: boolean,
  setShowPassword: (show) => void,
  isAuthenticated: boolean,
  userData: User | null
}
```

### Dashboard Props (20+)
```typescript
{
  currentPage: PageType,
  setCurrentPage: (page) => void,
  userData: User,
  storageInfo: { used: number, limit: number },
  uploads: Upload[],
  serverFiles: File[],
  backups: Backup[],
  searchQuery: string,
  setSearchQuery: (query) => void,
  viewMode: 'grid' | 'list',
  setViewMode: (mode) => void,
  setShowUploadModal: (show) => void,
  setShowNewFolderModal: (show) => void,
  handleLogout: () => void,
  selectedFile: File | null,
  setSelectedFile: (file) => void,
  handleDownloadFile: (filename) => Promise<void>,
  handleDeleteFile: (filename) => Promise<void>,
  files: File[],
  setFiles: (files) => void,
  recentFiles: File[],
  trashedFiles: File[]
}
```

## ✨ Benefits of This Structure

### ✅ Maintainability
- Each component has ONE responsibility
- Easy to locate and fix bugs
- Clear file organization

### ✅ Scalability
- Add new views without touching existing code
- Extend components without breaking others
- Modular architecture allows team collaboration

### ✅ Reusability
- Components can be reused across features
- Consistent UI/UX patterns
- DRY (Don't Repeat Yourself) principle

### ✅ Testability
- Components can be tested in isolation
- Mock props easily for unit tests
- Integration tests are straightforward

### ✅ Performance
- Only necessary components re-render
- Can add React.memo for optimization
- Code splitting opportunities

## 🚀 Quick Start

### Run Development Server
```bash
cd client
npm run dev
```

### Component Access
```javascript
// Import any component
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import FilesView from './components/dashboard/views/FilesView';
```

### Add New View
1. Create file in `components/dashboard/views/YourView.jsx`
2. Import in `DashboardContent.jsx`
3. Add case in switch statement
4. Add nav item in `Sidebar.jsx`

## 📊 Component Metrics

| Component | Lines | Props | State | Complexity |
|-----------|-------|-------|-------|------------|
| App.jsx | ~280 | 0 | 15+ | Medium |
| AuthPage | ~45 | 16 | 0 | Low |
| AuthBranding | ~90 | 0 | 0 | Low |
| AuthForm | ~180 | 16 | 0 | Medium |
| Dashboard | ~55 | 20+ | 0 | Low |
| Sidebar | ~120 | 5 | 0 | Low |
| DashboardContent | ~70 | 20+ | 0 | Low |
| DashboardView | ~95 | 5 | 0 | Medium |
| FilesView | ~100 | 12 | 0 | Medium |
| Other Views | ~40-60 | 1-2 | 0 | Low |

**Total: ~1100 lines** (previously 1166 lines in single file)

## 🎯 Next Steps

### Immediate
- ✅ Component structure complete
- ✅ All views functional
- ✅ Authentication working
- ✅ File operations integrated

### Short Term
- Add UploadModal component
- Add NewFolderModal component
- Add FileContextMenu component
- Add file drag-and-drop

### Long Term
- Add unit tests
- Add Storybook documentation
- Implement advanced features
- Optimize performance

---

**Result**: Clean, professional, production-ready component architecture! 🎉
