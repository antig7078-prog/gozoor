import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layouts/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

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
const ResetPassword = lazy(() => import('./pages/public/ResetPassword').then(m => ({ default: m.ResetPassword })));
const AboutUs = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('./pages/public/ContactPage').then(m => ({ default: m.ContactPage })));
const Terms = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.Terms })));
const Privacy = lazy(() => import('./pages/public/StaticPages').then(m => ({ default: m.Privacy })));
const NotFound = lazy(() => import('./pages/public/NotFound').then(m => ({ default: m.NotFound })));
const PublicProfile = lazy(() => import('./pages/public/PublicProfile').then(m => ({ default: m.PublicProfile })));

// Lazy loaded user pages
const UserDashboard = lazy(() => import('./pages/user/UserDashboard').then(m => ({ default: m.UserDashboard })));
const UserCourses = lazy(() => import('./pages/user/UserCourses').then(m => ({ default: m.UserCourses })));
const StudentsAlumniTab = lazy(() => import('./pages/user/StudentsAlumniTab').then(m => ({ default: m.StudentsAlumniTab })));
const CourseDetails = lazy(() => import('./pages/user/CourseDetails').then(m => ({ default: m.CourseDetails })));
const CoursePlayer = lazy(() => import('./pages/user/CoursePlayer').then(m => ({ default: m.CoursePlayer })));
const MyCourses = lazy(() => import('./pages/user/MyCourses').then(m => ({ default: m.MyCourses })));
const UserProfile = lazy(() => import('./pages/user/UserProfile').then(m => ({ default: m.UserProfile })));
const Checkout = lazy(() => import('./pages/user/Checkout').then(m => ({ default: m.Checkout })));
const Favorites = lazy(() => import('./pages/user/Favorites').then(m => ({ default: m.Favorites })));
const LearningPathsPage = lazy(() => import('./pages/user/learning-paths/LearningPathsPage').then(m => ({ default: m.LearningPathsPage })));
const WorkshopsPage = lazy(() => import('./pages/user/workshops/WorkshopsPage').then(m => ({ default: m.WorkshopsPage })));
const MessagesPage = lazy(() => import('./pages/user/messages/MessagesPage').then(m => ({ default: m.MessagesPage })));
const NotificationsPage = lazy(() => import('./pages/user/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// Lazy loaded marketplace/jobs/services pages
const ProductsPage = lazy(() => import('./pages/user/marketplace/ProductsPage').then(m => ({ default: m.ProductsPage })));
const ProductDetails = lazy(() => import('./pages/user/marketplace/ProductDetails').then(m => ({ default: m.ProductDetails })));
const Cart = lazy(() => import('./pages/user/marketplace/Cart').then(m => ({ default: m.Cart })));
const MarketplaceCheckout = lazy(() => import('./pages/user/marketplace/MarketplaceCheckout').then(m => ({ default: m.MarketplaceCheckout })));
const MarketOrders = lazy(() => import('./pages/user/marketplace/MarketOrders').then(m => ({ default: m.MarketOrders })));
const MerchantOrders = lazy(() => import('./pages/user/marketplace/MerchantOrders').then(m => ({ default: m.MerchantOrders })));
const UserProducts = lazy(() => import('./pages/user/marketplace/UserProducts').then(m => ({ default: m.UserProducts })));
const AddProduct = lazy(() => import('./pages/user/marketplace/AddProduct').then(m => ({ default: m.AddProduct })));
const JobsListingPage = lazy(() => import('./pages/user/jobs/JobsListingPage').then(m => ({ default: m.JobsListingPage })));
const JobDetailsPage = lazy(() => import('./pages/user/jobs/JobDetailsPage').then(m => ({ default: m.JobDetailsPage })));
const MyApplications = lazy(() => import('./pages/user/jobs/MyApplications').then(m => ({ default: m.MyApplications })));
const CreateJob = lazy(() => import('./pages/user/jobs/CreateJob').then(m => ({ default: m.CreateJob })));
const MyJobs = lazy(() => import('./pages/user/jobs/MyJobs').then(m => ({ default: m.MyJobs })));
const JobApplicants = lazy(() => import('./pages/user/jobs/JobApplicants').then(m => ({ default: m.JobApplicants })));
const ServicesPage = lazy(() => import('./pages/user/services/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetails = lazy(() => import('./pages/user/services/ServiceDetails').then(m => ({ default: m.ServiceDetails })));
const UserServices = lazy(() => import('./pages/user/services/UserServices').then(m => ({ default: m.UserServices })));
const AddService = lazy(() => import('./pages/user/services/AddService').then(m => ({ default: m.AddService })));
const ServiceOrders = lazy(() => import('./pages/user/services/ServiceOrders').then(m => ({ default: m.ServiceOrders })));
const ServiceOrderDetails = lazy(() => import('./pages/user/services/ServiceOrderDetails').then(m => ({ default: m.ServiceOrderDetails })));

// Lazy loaded new section pages
const CareersPage = lazy(() => import('./pages/user/careers/CareersPage').then(m => ({ default: m.CareersPage })));
const CommunityPage = lazy(() => import('./pages/user/community/CommunityPage').then(m => ({ default: m.CommunityPage })));

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
const AdminCommunity = lazy(() => import('./pages/admin/AdminCommunity').then(m => ({ default: m.AdminCommunity })));
const AdminLearningPaths = lazy(() => import('./pages/admin/AdminLearningPaths').then(m => ({ default: m.AdminLearningPaths })));
const AddLearningPath = lazy(() => import('./pages/admin/AddLearningPath').then(m => ({ default: m.AddLearningPath })));
const AdminVerifications = lazy(() => import('./pages/admin/AdminVerifications').then(m => ({ default: m.AdminVerifications })));

function App() {
  return (
    <ErrorBoundary>
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
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />

              {/* Public Browsing Routes - No auth required, uses top navbar layout */}
              <Route element={<PublicBrowseLayout />}>
                <Route path="/courses" element={<StudentsAlumniTab />} />
                <Route path="/courses/browse" element={<UserCourses />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/learning-paths" element={<LearningPathsPage />} />
                <Route path="/workshops" element={<WorkshopsPage />} />
                <Route path="/marketplace" element={<ProductsPage />} />
                <Route path="/marketplace/:id" element={<ProductDetails />} />
                <Route path="/jobs" element={<JobsListingPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetails />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/profile/:userId" element={<PublicProfile />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              {/* Protected Routes - User Dashboard (User Only) */}
              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route element={<UserLayout />}>
                  <Route path="/dashboard" element={<UserDashboard />} />
                </Route>
              </Route>

              {/* Protected Routes - Users and Admins (personal pages, actions) */}
              <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
                <Route element={<UserLayout />}>
                  <Route path="/my-courses" element={<MyCourses />} />
                  <Route path="/courses/:id/player" element={<CoursePlayer />} />
                  <Route path="/marketplace/checkout" element={<MarketplaceCheckout />} />
                  <Route path="/market-orders" element={<MarketOrders />} />
                  <Route path="/customer-orders" element={<MerchantOrders />} />
                  <Route path="/user-products" element={<UserProducts />} />
                  <Route path="/marketplace/add" element={<AddProduct />} />
                  <Route path="/my-applications" element={<MyApplications />} />
                  <Route path="/jobs/create" element={<CreateJob />} />
                  <Route path="/my-jobs" element={<MyJobs />} />
                  <Route path="/jobs/:id/applicants" element={<JobApplicants />} />
                  <Route path="/user-services" element={<UserServices />} />
                  <Route path="/services/add" element={<AddService />} />
                  <Route path="/service-orders" element={<ServiceOrders />} />
                  <Route path="/service-orders/:id" element={<ServiceOrderDetails />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
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
                  <Route path="/admin/community" element={<AdminCommunity />} />
                  <Route path="/admin/learning-paths" element={<AdminLearningPaths />} />
                  <Route path="/admin/learning-paths/new" element={<AddLearningPath />} />
                  <Route path="/admin/learning-paths/edit/:id" element={<AddLearningPath />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/verifications" element={<AdminVerifications />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
