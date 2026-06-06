import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: Array<'user' | 'admin'>;
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { session, role } = useAuth();
    const location = useLocation();

    if (!session) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // If logged in but role mismatch, redirect based on their proper role
        return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return <Outlet />;
};
