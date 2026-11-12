import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { HistoryPage } from './pages/HistoryPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { ServicesPage } from './pages/ServicesPage';
import { SettingsPage } from './pages/SettingsPage';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-origin-subtle">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-origin-ink text-white flex items-center justify-center font-semibold animate-pulse">
            O
          </div>
          <span className="text-xs text-origin-faint">Initializing ORIGIN AI...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { AppShell } from './components/layout/AppShell';
// import { DashboardPage } from './pages/DashboardPage';
// import { WorkspacePage } from './pages/WorkspacePage';
// import { HistoryPage } from './pages/HistoryPage';
// import { ApprovalsPage } from './pages/ApprovalsPage';
// import { DirectoryPage } from './pages/DirectoryPage';
// import { ServicesPage } from './pages/ServicesPage';
// import { SettingsPage } from './pages/SettingsPage';

// export function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <Routes>
//           <Route element={<AppShell />}>
//             <Route path="/" element={<DashboardPage />} />
//             <Route path="/workspace" element={<WorkspacePage />} />
//             <Route path="/history" element={<HistoryPage />} />
//             <Route path="/approvals" element={<ApprovalsPage />} />
//             <Route path="/directory" element={<DirectoryPage />} />
//             <Route path="/services" element={<ServicesPage />} />
//             <Route path="/settings" element={<SettingsPage />} />
//           </Route>
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

