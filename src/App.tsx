import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLayout } from './components/AdminLayout';
import { AddCourse } from './pages/AddCourse';
import { AdminCourses } from './pages/AdminCourses';
import { AdminUsers } from './pages/AdminUsers';
import { AdminOrders } from './pages/AdminOrders';
import { AdminCategories } from './pages/AdminCategories';
import { AdminSettings } from './pages/AdminSettings';
import { UserCourses } from './pages/UserCourses';
import { CourseDetails } from './pages/CourseDetails';
import { CoursePlayer } from './pages/CoursePlayer';
import { UserProfile } from './pages/UserProfile';
import { Checkout } from './pages/Checkout';
import { Favorites } from './pages/Favorites';
import { NotFound } from './pages/NotFound';

import { UserLayout } from './components/UserLayout';

import './index.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - General (Requires any login) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Protected Routes - Users Only */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/courses" element={<UserCourses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/courses/:id/player" element={<CoursePlayer />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<UserProfile />} />
            </Route>
          </Route>

          {/* Protected Routes - Admin Only wrapped with Layout */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/courses/new" element={<AddCourse />} />
              <Route path="/admin/courses/edit/:id" element={<AddCourse />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
