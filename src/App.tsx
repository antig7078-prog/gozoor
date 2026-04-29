import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/shared/LoadingSpinner';

// Layouts (Keep synchronous)
import { AdminLayout } from './components/layouts/AdminLayout';
import { UserLayout } from './components/layouts/UserLayout';
import { PublicBrowseLayout } from './components/layouts/PublicBrowseLayout';
import './index.css';

// Lazy loaded public pages
const LandingPage = lazy(() => import('./pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const Login = lazy(() => import('./pages/public/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/public/Signup').then(m => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('./pages/public/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const AboutUs = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.ContactUs })));
const Terms = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.Privacy })));
const NotFound = lazy(() => import('./pages/public/NotFound').then(m => ({ default: m.NotFound })));

// Lazy loaded user pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const UserCourses = lazy(() => import('./pages/user/UserCourses').then(m => ({ default: m.UserCourses })));
const CourseDetails = lazy(() => import('./pages/user/CourseDetails').then(m => ({ default: m.CourseDetails })));
const CoursePlayer = lazy(() => import('./pages/user/CoursePlayer').then(m => ({ default: m.CoursePlayer })));
const MyCourses = lazy(() => import('./pages/user/MyCourses').then(m => ({ default: m.MyCourses })));
const UserProfile = lazy(() => import('./pages/user/UserProfile').then(m => ({ default: m.UserProfile })));
const Checkout = lazy(() => import('./pages/user/Checkout').then(m => ({ default: m.Checkout })));
const Favorites = lazy(() => import('./pages/user/Favorites').then(m => ({ default: m.Favorites })));

// Lazy loaded marketplace/jobs/services pages
const ProductsPage = lazy(() => import('./pages/user/marketplace/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetails = lazy(() => import('./pages/user/marketplace/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./pages/user/marketplace/Cart').then(m => ({ default: m.Cart })));
const MarketplaceCheckout = lazy(() => import('./pages/user/marketplace/MarketplaceCheckout').then(m => ({ default: m.MarketplaceCheckout })));
const MarketOrders = lazy(() => import('./pages/user/marketplace/MarketOrders').then(m => ({ default: m.MarketOrders })));
const UserProducts = lazy(() => import('./pages/user/marketplace/UserProducts').then(m => ({ default: m.UserProducts })));
const AddProduct = lazy(() => import('./pages/user/marketplace/AddProduct').then(m => ({ default: m.AddProduct })));
const JobsListingPage = lazy(() => import('./pages/user/jobs/JobsListingPage').then(m => ({ default: m.JobsListingPage })));
const JobDetailsPage = lazy(() => import('./pages/user/jobs/JobDetailsPage').then(m => ({ default: m.JobDetailsPage })));
const MyApplications = lazy(() => import('./pages/user/jobs/MyApplications').then(m => ({ default: m.MyApplications })));
const ServicesPage = lazy(() => import('./pages/user/services/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetails = lazy(() => import('./pages/user/services/ServiceDetails').then(m => ({ default: m.ServiceDetails })));
const UserServices = lazy(() => import('./pages/user/services/UserServices').then(m => ({ default: m.UserServices })));
const AddService = lazy(() => import('./pages/user/services/AddService').then(m => ({ default: m.AddService })));

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses').then(m => ({ default: m.AdminCourses })));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AddCourse = lazy(() => import('./pages/admin/AddCourse').then(m => ({ default: m.AddCourse })));
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts').then(m => ({ default: m.ManageProducts })));
const ManageJobs = lazy(() => import('./pages/admin/ManageJobs').then(m => ({ default: m.ManageJobs })));
const ManageServices = lazy(() => import('./pages/admin/ManageServices').then(m => ({ default: m.ManageServices })));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates').then(m => ({ default: m.AdminCertificates })));
const AdminEnrollments = lazy(() => import('./pages/admin/AdminEnrollments').then(m => ({ default: m.AdminEnrollments })));

function App() {
  return (
    <BrowserRouter basename="/gozoor">
      <AuthProvider>
        <Toaster position="top-center" />
        <Suspense fallback={<LoadingSpinner fullPage message="جاري التحميل..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Public Browsing Routes - No auth required, uses top navbar layout */}
            <Route element={<PublicBrowseLayout />}>
              <Route path="/courses" element={<UserCourses />} />
              <Route path="/courses/:id" element={<CourseDetails />} />
              <Route path="/marketplace" element={<ProductsPage />} />
              <Route path="/marketplace/:id" element={<ProductDetails />} />
              <Route path="/jobs" element={<JobsListingPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetails />} />
            </Route>

            {/* Protected Routes - Users Only (dashboard, personal pages, actions) */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/courses/:id/player" element={<CoursePlayer />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/marketplace/checkout" element={<MarketplaceCheckout />} />
                <Route path="/market-orders" element={<MarketOrders />} />
                <Route path="/user-products" element={<UserProducts />} />
                <Route path="/marketplace/add" element={<AddProduct />} />
                <Route path="/my-applications" element={<MyApplications />} />
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
                <Route path="/admin/enrollments" element={<AdminEnrollments />} />
                <Route path="/admin/certificates" element={<AdminCertificates />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
