"use client";

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, ShoppingBag, Truck, MapPin, Mail, Phone, User, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        setIsSubmitting(true);
        setErrorMsg("");

        try {
            const response = await fetch('/api/send-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    formData,
                    items,
                    total: cartTotal
                }),
            });

            if (!response.ok) {
                throw new Error('Hubo un problema procesando tu orden.');
            }

            setIsSuccess(true);
            clearCart();
        } catch (err: any) {
            setErrorMsg(err.message || 'Error de conexión.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formattedTotal = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(cartTotal);

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(var(--space-3xl) * 1.5)', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>

                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500, transition: 'var(--transition-fast)' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--trust-blue-light)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--trust-blue)'}>
                        <ArrowLeft size={20} /> Volver a la Tienda
                    </a>
                    <h1 className="kinetic-header" style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', marginTop: 'var(--space-sm)' }}>
                        Finalizar <span className="text-gradient-primary">Compra</span>
                    </h1>
                    <p className="text-sub" style={{ marginTop: '0.5rem' }}>Completa tus datos para enviar la solicitud de pedido.</p>
                </div>

                {isSuccess ? (
                    <div className="glass-panel" style={{ padding: 'var(--space-3xl) var(--space-xl)', textAlign: 'center', margin: '4rem auto', maxWidth: '600px' }}>
                        <CheckCircle size={64} style={{ color: 'var(--accent-teal)', margin: '0 auto var(--space-md)' }} />
                        <h2 style={{ fontSize: '2rem', color: 'var(--trust-blue)', marginBottom: 'var(--space-sm)' }}>¡Pedido Confirmado!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
                            Hemos recibido tu solicitud y se ha enviado un correo a nuestro equipo con los detalles de tu compra. Nos contactaremos contigo muy pronto al correo <strong>{formData.email}</strong> o al teléfono <strong>{formData.phone}</strong> para coordinar el pago y el envío.
                        </p>
                        <a href="/" className="button-primary" style={{ display: 'inline-flex' }}>Volver al Inicio</a>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-2xl)' }}>

                        {/* Form Column */}
                        <div className="glass-panel" style={{ padding: 'var(--space-xl)' }}>
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--trust-blue)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={24} /> Datos de Envío
                            </h2>

                            <form id="checkout-form" onSubmit={handlePlaceOrder}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>

                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Nombre Completo *</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none', transition: 'var(--transition-fast)' }}
                                                placeholder="Ej. Juan Pérez"
                                            />
                                        </div>
                                    </div>

                                    {/* Email and Phone */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                                        <div>
                                            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Correo Electrónico *</label>
                                            <div style={{ position: 'relative' }}>
                                                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }}
                                                    placeholder="tu@email.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Teléfono *</label>
                                            <div style={{ position: 'relative' }}>
                                                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }}
                                                    placeholder="Móvil"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label htmlFor="address" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Dirección de Entrega *</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                required
                                                value={formData.address}
                                                onChange={handleChange}
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }}
                                                placeholder="Calle, Carrera, Número..."
                                            />
                                        </div>
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label htmlFor="city" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Ciudad *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            required
                                            value={formData.city}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none' }}
                                            placeholder="Ej. Bogotá"
                                        />
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label htmlFor="notes" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Notas Adicionales</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows={3}
                                            value={formData.notes}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', outline: 'none', resize: 'vertical' }}
                                            placeholder="Instrucciones para la entrega (opcional)"
                                        ></textarea>
                                    </div>

                                </div>
                            </form>
                        </div>

                        {/* Order Summary Column */}
                        <div>
                            <div className="glass-panel" style={{ padding: 'var(--space-xl)', position: 'sticky', top: '120px' }}>
                                <h2 style={{ fontSize: '1.5rem', color: 'var(--trust-blue)', marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShoppingBag size={24} /> Resumen del Pedido
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {items.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-md) 0' }}>No hay productos en tu pedido.</p>
                                    ) : (
                                        items.map(item => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{item.name}</h4>
                                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cant: {item.quantity}</span>
                                                </div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                    ${(item.price * item.quantity).toLocaleString('es-CO')}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div style={{ borderTop: '2px dashed var(--glass-border)', paddingTop: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        <span>Subtotal</span>
                                        <span>{formattedTotal}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                        <span>Envío</span>
                                        <span>Por calcular</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 800, color: 'var(--trust-blue)' }}>
                                        <span>Total Estimado</span>
                                        <span>{formattedTotal}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    form="checkout-form"
                                    className="button-primary"
                                    style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', opacity: isSubmitting ? 0.7 : 1 }}
                                    disabled={items.length === 0 || isSubmitting}
                                >
                                    {isSubmitting ? 'Procesando...' : <><CheckCircle size={20} /> Confirmar Pedido Seguro</>}
                                </button>
                                {errorMsg && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '1rem', fontWeight: 500 }}>{errorMsg}</p>}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                    Al confirmar, se enviará una notificación a nuestras oficinas.
                                </p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </main>
    );
}
