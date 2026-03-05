"use client";

import React, { useEffect, useState } from 'react';
import { useAuth, PriceTier } from '@/context/AuthContext';
import { Users, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [usersList, setUsersList] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load all simulated users
        const mockData = localStorage.getItem('gru_mock_users');
        if (mockData) {
            setUsersList(JSON.parse(mockData));
        }
    }, []);

    if (!mounted) return null;

    // Security check: Only render if user is flagged as admin
    if (!isAuthenticated || !user?.isAdmin) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <ShieldAlert size={64} style={{ color: '#ef4444', margin: '0 auto var(--space-md)' }} />
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Acceso Denegado</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No tienes permisos de Administrador.</p>
                    <a href="/" className="button-primary" style={{ display: 'inline-block', marginTop: 'var(--space-md)' }}>Volver al Catálogo</a>
                </div>
            </main>
        );
    }

    const handleChangeRole = (userId: string, newRole: string) => {
        const updatedUsers = usersList.map(u => {
            if (u.id === userId) {
                return { ...u, priceTier: newRole };
            }
            return u;
        });
        setUsersList(updatedUsers);
        localStorage.setItem('gru_mock_users', JSON.stringify(updatedUsers));
        alert('Lista de precios actualizada para el cliente.');
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(var(--space-xl))', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container">
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--trust-blue-light)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--trust-blue)'}>
                        <ArrowLeft size={20} /> Salir del Panel
                    </a>
                    <h1 className="kinetic-header" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 'var(--space-sm)' }}>
                        Panel de <span className="text-gradient-primary">Administración</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Gestiona los clientes y asigna sus listas de precios dinámicas.</p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-xl)' }}>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--trust-blue)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={24} /> Lista de Clientes Registrados
                    </h2>

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
                                {usersList.filter(u => !u.isAdmin).length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                            Aún no se han registrado clientes en la página web.
                                        </td>
                                    </tr>
                                ) : (
                                    usersList.map((client) => {
                                        if (client.isAdmin) return null; // No list admins
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
