"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';

export type PriceTier = 'CLIENTE_FINAL' | 'ACCIONISTA' | 'DROGUISTA';

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    idType: string;
    idNumber: string;
    phone: string;
    address: string;
    city: string;
    priceTier: PriceTier;
    isAdmin?: boolean;
    role?: string;
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                console.warn("El usuario no tiene un perfil en la tabla 'profiles'.");
            } else {
                console.error("Error fetching profile:", error.message || error);
            }
            setUser(null);
            return;
        }

        if (data) {
            setUser(data as UserProfile);
        } else {
            setUser(null);
        }
    };

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            await fetchProfile(session.user.id);
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Error initSession:", err);
                setUser(null);
            } finally {
                if (mounted) setIsInitializing(false);
            }
        };

        // Listen for auth state changes (login, logout, and the INITIAL_SESSION on mount)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            try {
                if (event === 'INITIAL_SESSION') return;
                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Error auth change:", err);
            } finally {
                if (mounted) setIsInitializing(false);
            }
        });

        initSession();

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/login'; // Force redirect to prevent layout bug
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitializing, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
