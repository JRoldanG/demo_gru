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
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data) {
            setUser(data as UserProfile);
        } else {
            console.error("Error fetching profile:", error);
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
        // Initial fetch
        refreshProfile();

        // Listen for auth state changes (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        window.location.href = '/login'; // Force redirect to prevent layout bug
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, refreshProfile }}>
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
