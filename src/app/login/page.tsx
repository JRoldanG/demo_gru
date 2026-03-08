"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                console.error("Login error:", error);
                if (error.message.includes("Email not confirmed")) {
                    throw new Error("Debes confirmar tu correo electrónico. Por favor, revisa tu bandeja de entrada o la carpeta de spam y haz clic en el enlace de confirmación.");
                }
                throw new Error(error.message || "Correo o contraseña incorrectos.");
            }

            if (data.session) {
                // Verificar si tiene un perfil asociado antes de navegar
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', data.session.user.id)
                    .single();

                if (profileError || !profileData) {
                    await supabase.auth.signOut();
                    throw new Error("Tu cuenta no está completamente configurada (falta perfil). Contacta soporte técnico o regístrate de nuevo.");
                }

                window.location.href = '/'; // redirect to home
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(var(--space-3xl) * 1.5)', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container" style={{ maxWidth: '500px' }}>
                <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--trust-blue-light)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--trust-blue)'}>
                        <ArrowLeft size={20} /> Volver a la Tienda
                    </a>
                    <h1 className="kinetic-header" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 'var(--space-sm)' }}>
                        Iniciar <span className="text-gradient-primary">Sesión</span>
                    </h1>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-xl)' }}>
                    <form onSubmit={handleLogin}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Correo Electrónico</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }}
                                        placeholder="tu@email.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Contraseña</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }}
                                        placeholder="********"
                                    />
                                </div>
                            </div>

                            {errorMsg && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 500, margin: '0.5rem 0' }}>{errorMsg}</p>}

                            <button type="submit" className="button-primary" style={{ width: '100%' }} disabled={isLoading}>
                                {isLoading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </div>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            ¿No tienes cuenta? <a href="/register" style={{ color: 'var(--trust-blue)', fontWeight: 600 }}>Regístrate aquí</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
