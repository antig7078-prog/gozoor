import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * Custom hook that provides a guard function for actions requiring authentication.
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   const handleAction = () => {
 *     if (!requireAuth()) return;
 *     // proceed with the action...
 *   };
 */
export const useRequireAuth = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    /**
     * Returns true if the user is authenticated. 
     * If not, shows a toast and redirects to login.
     * @param message - Optional custom message
     */
    const requireAuth = (message?: string): boolean => {
        if (user) return true;

        toast.error(message || 'لازم تسجل دخول الأول عشان تقدر تعمل العملية دي 🔐', {
            duration: 4000,
            style: {
                fontWeight: 700,
                direction: 'rtl',
            },
        });
        navigate('/login', { state: { from: window.location.pathname } });
        return false;
    };

    return requireAuth;
};
