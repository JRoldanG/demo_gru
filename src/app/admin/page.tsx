"use client";

import React, { useEffect, useState } from 'react';
import { useAuth, PriceTier } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Users, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data: profiles, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error("Error fetching profiles:", error);
        } else {
            setUsersList(profiles || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated && user?.isAdmin) {
            fetchUsers();
        }
    }, [isAuthenticated, user]);

    if (!mounted || isInitializing) {
        return <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="animate-pulse" style={{ color: 'var(--trust-blue)' }}>Verificando sesión...</div></main>;
    }

    // Security check: Only render if user is flagged as admin
    if (!isAuthenticated || !user?.isAdmin) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <ShieldAlert size={64} style={{ color: '#ef4444', margin: '0 auto var(--space-md)' }} />
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Acceso Denegado</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No tienes permisos de Administrador.</p>
                    <Link href="/" className="button-primary" style={{ display: 'inline-block', marginTop: 'var(--space-md)' }}>Volver al Catálogo</Link>
                </div>
            </main>
        );
    }

    const handleChangeRole = async (userId: string, newRole: string) => {
        // Optimistic UI Update
        const previousUsers = [...usersList];
        setUsersList(usersList.map(u => u.id === userId ? { ...u, priceTier: newRole } : u));

        // Supabase DB Update
        const { error } = await supabase
            .from('profiles')
            .update({ priceTier: newRole })
            .eq('id', userId);

        if (error) {
            console.error("Error updating role:", error);
            // Revert on failure
            setUsersList(previousUsers);
            alert("Hubo un error al actualizar la lista de precios de este cliente. Inténtalo de nuevo.");
        } else {
            // Success Toast or similar could go here
            console.log("Tier updated securely in DB.");
        }
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(var(--space-xl))', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container">
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={(e: any) => e.currentTarget.style.color = 'var(--trust-blue-light)'} onMouseOut={(e: any) => e.currentTarget.style.color = 'var(--trust-blue)'}>
                        <ArrowLeft size={20} /> Salir del Panel
                    </Link>
                    <h1 className="kinetic-header" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 'var(--space-sm)' }}>
                        Panel de <span className="text-gradient-primary">Administración</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestiona los clientes en línea y asigna sus listas de precios dinámicas de forma segura.</p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h2 style={{ fontSize: '1.5rem', color: 'var(--trust-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={24} /> Lista de Clientes en Supabase
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Link href="/admin/products" className="button-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                Gestionar Productos
                            </Link>
                            <Link href="/ventas/orders" className="button-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: 'var(--accent-teal)' }}>
                                Gestionar Pedidos
                            </Link>
                            <button onClick={fetchUsers} style={{ background: 'none', border: '1px solid var(--trust-blue)', color: 'var(--trust-blue)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Recargar Datos
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                    <th style={{ padding: '1rem 0.5rem' }}>Nombre</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Correo</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Teléfono</th>
                                    <th style={{ padding: '1rem 0.5rem' }}>Lista de Precios Asignada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--trust-blue)' }}>
                                            Conectando base de datos...
                                        </td>
                                    </tr>
                                ) : usersList.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            Aún no se han registrado clientes en la página web.
                                        </td>
                                    </tr>
                                ) : (
                                    usersList.map((client) => {
                                        return (
                                            <tr key={client.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '1rem 0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{client.name}</td>
                                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{client.email}</td>
                                                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{client.phone}</td>
                                                <td style={{ padding: '1rem 0.5rem' }}>
                                                    <select
                                                        value={client.priceTier}
                                                        onChange={(e) => handleChangeRole(client.id, e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.5rem',
                                                            borderRadius: 'var(--radius-sm)',
                                                            border: '1px solid var(--glass-border)',
                                                            outline: 'none',
                                                            backgroundColor: 'white',
                                                            fontWeight: 600,
                                                            color: 'var(--trust-blue)'
                                                        }}
                                                    >
                                                        <option value="CLIENTE_FINAL">Cliente Final ($ 0 dscto)</option>
                                                        <option value="ACCIONISTA">Accionista (-20%)</option>
                                                        <option value="DROGUISTA">Droguista (-10%)</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
