"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

interface AuthContextType {
    user: UserProfile | null;
    isAuthenticated: boolean;
    login: (user: UserProfile) => void;
    logout: () => void;
    updateTier: (newTier: PriceTier) => void; // Utility for testing mock
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Hydrate from localStorage
        const storedUser = localStorage.getItem('gru_current_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error loading user session", error);
                localStorage.removeItem('gru_current_user');
            }
        }
    }, []);

    const login = (newUser: UserProfile) => {
        setUser(newUser);
        localStorage.setItem('gru_current_user', JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('gru_current_user');
    };

    const updateTier = (newTier: PriceTier) => {
        if (user) {
            const updatedUser = { ...user, priceTier: newTier };
            setUser(updatedUser);
            localStorage.setItem('gru_current_user', JSON.stringify(updatedUser));
        }
    };

    // Return empty fragment or nothing until mounted to avoid hydration differences
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateTier }}>
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
