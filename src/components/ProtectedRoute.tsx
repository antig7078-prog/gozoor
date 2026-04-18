import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    allowedRoles?: Array<'user' | 'admin'>;
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { session, role } = useAuth();

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // If logged in but role mismatch, redirect based on their proper role
        return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return <Outlet />;
};
