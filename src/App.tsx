import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
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
import { ManageProducts } from './pages/admin/ManageProducts';
import { ManageJobs } from './pages/admin/ManageJobs';
import { ManageServices } from './pages/admin/ManageServices';
import { UserCourses } from './pages/UserCourses';
import { CourseDetails } from './pages/CourseDetails';
import { CoursePlayer } from './pages/CoursePlayer';
import { MyCourses } from './pages/MyCourses';
import { UserProfile } from './pages/UserProfile';
import { Checkout } from './pages/Checkout';
import { Favorites } from './pages/Favorites';
import { NotFound } from './pages/NotFound';
import { ProductsPage } from './pages/marketplace/ProductsPage';
import { ProductDetails } from './pages/marketplace/ProductDetails';
import { Cart } from './pages/marketplace/Cart';
import { MarketplaceCheckout } from './pages/marketplace/MarketplaceCheckout';
import { MarketOrders } from './pages/marketplace/MarketOrders';
import { UserProducts } from './pages/marketplace/UserProducts';
import { AddProduct } from './pages/marketplace/AddProduct';
import { JobsListingPage } from './pages/jobs/JobsListingPage';
import { JobDetailsPage } from './pages/jobs/JobDetailsPage';
import { MyApplications } from './pages/jobs/MyApplications';
import { ServicesPage } from './pages/services/ServicesPage';
import { ServiceDetails } from './pages/services/ServiceDetails';
import { UserServices } from './pages/services/UserServices';
import { AddService } from './pages/services/AddService';

import { UserLayout } from './components/UserLayout';

import './index.css';

function App() {
  return (
    <BrowserRouter basename="/gozoor">
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes - Users Only */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/courses" element={<UserCourses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/courses/:id/player" element={<CoursePlayer />} />
              <Route path="/marketplace" element={<ProductsPage />} />
              <Route path="/marketplace/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/marketplace/checkout" element={<MarketplaceCheckout />} />
              <Route path="/market-orders" element={<MarketOrders />} />
              <Route path="/user-products" element={<UserProducts />} />
              <Route path="/marketplace/add" element={<AddProduct />} />
              <Route path="/jobs" element={<JobsListingPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
              <Route path="/user-services" element={<UserServices />} />
              <Route path="/services/add" element={<AddService />} />
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
              <Route path="/admin/products" element={<ManageProducts />} />
              <Route path="/admin/jobs" element={<ManageJobs />} />
              <Route path="/admin/services" element={<ManageServices />} />
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
