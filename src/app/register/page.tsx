"use client";

import React, { useState } from 'react';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { ArrowLeft, User, Mail, Lock, Phone, MapPin, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        idType: 'CC',
        idNumber: '',
        phone: '',
        address: '',
        city: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        try {
            // Verify if user already exists
            const usersStr = localStorage.getItem('gru_mock_users') || '[]';
            const users: any[] = JSON.parse(usersStr);

            if (users.find(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
                throw new Error('El correo electrónico ya está registrado.');
            }

            // Create new User object
            const newUser = {
                id: Date.now().toString(),
                name: formData.name,
                email: formData.email,
                idType: formData.idType,
                idNumber: formData.idNumber,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                priceTier: 'CLIENTE_FINAL', // Default
                password: formData.password // Saved only for mock purposes internally
            };

            // Notify Admin by Email
            const response = await fetch('/api/notify-registration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    idType: newUser.idType,
                    idNumber: newUser.idNumber,
                    phone: newUser.phone,
                    role: newUser.priceTier
                })
            });

            if (!response.ok) {
                console.error("Warning: Could not send email notification to admin");
            }

            // Save new user to pseudo DB
            users.push(newUser);
            localStorage.setItem('gru_mock_users', JSON.stringify(users));

            // Log user in securely (without password)
            const { password, ...userProfile } = newUser;
            login(userProfile as UserProfile);

            window.location.href = '/'; // Direct Home

        } catch (err: any) {
            setErrorMsg(err.message || "Error al registrar la cuenta.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(var(--space-xl))', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--trust-blue-light)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--trust-blue)'}>
                        <ArrowLeft size={20} /> Volver a la Tienda
                    </a>
                    <h1 className="kinetic-header" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginTop: 'var(--space-sm)' }}>
                        Crear <span className="text-gradient-primary">Cuenta</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Regístrate para ver el catálogo y hacer pedidos más rápido.</p>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-xl)' }}>
                    <form onSubmit={handleRegister}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {/* Nombre Completo */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Nombre y Apellido *</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="Ej. Juan Pérez" />
                                </div>
                            </div>

                            {/* Identificación */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Tipo ID</label>
                                    <select name="idType" value={formData.idType} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none', backgroundColor: 'white' }}>
                                        <option value="CC">C.C.</option>
                                        <option value="NIT">NIT</option>
                                        <option value="CE">C.E.</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>N° Documento *</label>
                                    <input type="text" name="idNumber" required value={formData.idNumber} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="123456789" />
                                </div>
                            </div>

                            {/* Email and Phone */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1.5fr) 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Correo Electrónico *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="tu@email.com" />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Teléfono *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="Móvil" />
                                    </div>
                                </div>
                            </div>

                            {/* Direccion City */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-md)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Dirección Principal *</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input type="text" name="address" required value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="Calle..." />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Ciudad *</label>
                                    <input type="text" name="city" required value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="Ej. Bogotá" />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Contraseña Segura *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input type="password" name="password" required value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }} placeholder="Mínimo 6 caracteres" minLength={6} />
                                </div>
                            </div>

                            {errorMsg && <p style={{ color: '#ef4444', textAlign: 'center', fontWeight: 500, margin: '0.5rem 0' }}>{errorMsg}</p>}

                            <button type="submit" className="button-primary" style={{ width: '100%', opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
                                {isSubmitting ? 'Registrando cuenta...' : <><CheckCircle size={20} /> Crear Cuenta</>}
                            </button>
                        </div>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            ¿Ya tienes cuenta? <a href="/login" style={{ color: 'var(--trust-blue)', fontWeight: 600 }}>Inicia Sesión</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
