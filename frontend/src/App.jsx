import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import DashboardDispatcher from './pages/DashboardDispatcher';

import Projects from './pages/Projects';
import ProjectOverview from './pages/ProjectOverview';
import Tasks from './pages/Tasks';
import Timesheets from './pages/Timesheets';
import Issues from './pages/Issues';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import NotificationsPage from './pages/NotificationsPage';

import Milestones from './pages/Milestones';

// Fallback page
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-slate-600 text-lg">
    404 — Page Not Found
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ================= Public Routes ================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ================= Protected App ================= */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Default */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Core Pages */}
              <Route path="dashboard" element={<DashboardDispatcher />} />

              {/* Restricted Projects Access */}
              <Route element={<ProtectedRoute allowedRoles={['Super Admin', 'Project Admin', 'Project Manager']} />}>
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectOverview />} />
              </Route>

              <Route path="tasks" element={<Tasks />} />
              <Route path="milestones" element={<Milestones />} />
              <Route path="timesheets" element={<Timesheets />} />
              <Route path="issues" element={<Issues />} />
              <Route path="documents" element={<Documents />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Route>

          {/* ================= Fallback ================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
