import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

import { Leaf } from 'lucide-react';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: 'user' | 'admin' | null;
    signOut: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    signOut: async () => { },
    loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'user' | 'admin' | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const checkUser = async (currentSession: Session | null) => {
            if (!currentSession) {
                if (active) {
                    setSession(null);
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                }
                return;
            }

            if (active) {
                setSession(currentSession);
                setUser(currentSession.user);
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', currentSession.user.id)
                    .single();

                if (active) {
                    if (error) {
                        if (error.code === 'PGRST116') {
                            // User has an auth session but no profile row (user deleted or corrupted state)
                            await supabase.auth.signOut();
                            // Clean up remaining localStorage tokens
                            Object.keys(localStorage).forEach(key => {
                                if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
                                    localStorage.removeItem(key);
                                }
                            });
                            setSession(null);
                            setUser(null);
                            setRole(null);
                            setLoading(false);
                            return;
                        }
                        setRole('user');
                    } else if (data) {
                        setRole(data.role as 'user' | 'admin');
                    } else {
                        setRole('user');
                    }
                }
            } catch (err) {
                if (active) {
                    setRole('user');
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            checkUser(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                // Clear localStorage related to supabase token or session if it gets corrupted
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
                        localStorage.removeItem(key);
                    }
                });
            }
            checkUser(session);
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, role, signOut, loading }}>
            {/* Show a premium full screen loader while initializing */}
            {loading ? (
                <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg text-white">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 bg-brand-primary rounded-3xl shadow-2xl shadow-brand-primary/20 flex items-center justify-center animate-pulse">
                            <Leaf className="w-10 h-10 text-white" />
                        </div>
                        <div className="absolute -inset-4 border-2 border-brand-primary/10 rounded-[2rem] animate-[spin_4s_linear_infinite]"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
