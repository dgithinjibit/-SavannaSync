import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import * as authService from '../services/authService';
import { UserData, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signIn: typeof authService.signInWithEmail;
    signUp: typeof authService.signUpWithEmail;
    signOut: typeof authService.signOut;
    signInWithGoogle: typeof authService.signInWithGoogle;
    signInWithWallet: typeof authService.signInWithWallet;
    updateUserMetadata: (metadata: { full_name?: string; avatar_url?: string }) => Promise<User | null>;
    uploadProfilePhoto: (file: File) => Promise<string>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserData = useCallback((user: User | null) => {
        if (user) {
            const role = user.user_metadata?.role as UserRole;
            const schoolId = user.user_metadata?.school_id as string;
            const county = user.user_metadata?.county as string;
            const fullName = user.user_metadata?.full_name as string;
            const avatarUrl = user.user_metadata?.avatar_url as string;

            if (role && schoolId && county) {
                setUserData({
                    uid: user.id,
                    email: user.email,
                    role,
                    schoolId,
                    county,
                    fullName,
                    avatarUrl
                });
            } else {
                 console.warn("User metadata (role, school_id, county) is incomplete.");
                 setUserData(null);
            }
        } else {
            setUserData(null);
        }
    }, []);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            loadUserData(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null);
                loadUserData(session?.user ?? null);
                if (_event !== 'INITIAL_SESSION') {
                    setLoading(false);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [loadUserData]);

    const value: AuthContextType = {
        user,
        userData,
        loading,
        signIn: authService.signInWithEmail,
        signUp: authService.signUpWithEmail,
        signOut: authService.signOut,
        signInWithGoogle: authService.signInWithGoogle,
        signInWithWallet: authService.signInWithWallet,
        updateUserMetadata: (metadata) => authService.updateUserMetadata(metadata),
        uploadProfilePhoto: (file) => {
            if (!user) throw new Error("User not authenticated");
            return authService.uploadProfilePhoto(user.id, file);
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};