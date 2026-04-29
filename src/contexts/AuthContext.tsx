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
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            // Default to 'user' if role metadata is not found
            setRole(session?.user?.user_metadata?.role ?? (session ? 'user' : null));
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setRole(session?.user?.user_metadata?.role ?? (session ? 'user' : null));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
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
                        <div className="w-20 h-20 bg-gradient-to-tr from-brand-primary-hover to-brand-accent rounded-3xl shadow-2xl shadow-brand-primary/20 flex items-center justify-center animate-pulse">
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
