"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert, ArrowLeft, PackageCheck, Edit, FileText, CheckCircle, Truck, Info, Settings } from 'lucide-react';
import Link from 'next/link';

export default function VentasOrders() {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const [ordersList, setOrdersList] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        status: 'Pendiente',
        dispatch_info: '',
    });
    const [orderItems, setOrderItems] = useState<any[]>([]);

    const fetchOrders = async () => {
        setIsLoading(true);
        const { data: oData, error: oErr } = await supabase
            .from('orders')
            .select('*, profiles(name, email, phone)')
            .order('created_at', { ascending: false });

        if (oErr) console.error("Error fetching orders:", oErr);
        if (oData) {
            setOrdersList(oData);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated && (user?.isAdmin || user?.role === 'ventas')) {
            fetchOrders();
        }
    }, [isAuthenticated, user]);

    if (!mounted || isInitializing) {
        return <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="animate-pulse" style={{ color: 'var(--trust-blue)' }}>Verificando sesión...</div></main>;
    }

    if (!isAuthenticated || (!user?.isAdmin && user?.role !== 'ventas')) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <ShieldAlert size={64} style={{ color: '#ef4444', margin: '0 auto var(--space-md)' }} />
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Acceso Denegado</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>No tienes permisos de Ventas o Administrador.</p>
                </div>
            </main>
        );
    }

    const openOrderDetails = async (order: any) => {
        setSelectedOrder(order);
        setFormData({
            status: order.status || 'Pendiente',
            dispatch_info: order.dispatch_info || '',
        });

        // Fetch order items
        const { data: itemsData, error: itemsErr } = await supabase
            .from('order_items')
            .select('*, products(name)')
            .eq('order_id', order.id);

        if (itemsErr) console.error("Error fetching order items", itemsErr);
        if (itemsData) setOrderItems(itemsData);

        setIsFormOpen(true);
    };

    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        // Update main order
        await supabase
            .from('orders')
            .update({ status: formData.status, dispatch_info: formData.dispatch_info })
            .eq('id', selectedOrder.id);

        // Update items real availability
        for (const item of orderItems) {
            await supabase
                .from('order_items')
                .update({ real_availability: item.real_availability })
                .eq('id', item.id);
        }

        setIsFormOpen(false);
        fetchOrders();
    };

    const updateItemAvailability = (itemId: string, val: number) => {
        setOrderItems(orderItems.map(i => i.id === itemId ? { ...i, real_availability: val } : i));
    };

    const generatePreInvoice = () => {
        // Simple printable view
        let content = `
            <h2>Prefactura - Pedido ${selectedOrder.id}</h2>
            <p><strong>Cliente:</strong> ${selectedOrder.profiles?.name}</p>
            <p><strong>Email:</strong> ${selectedOrder.profiles?.email}</p>
            <p><strong>Teléfono:</strong> ${selectedOrder.profiles?.phone}</p>
            <p><strong>Estado:</strong> ${formData.status}</p>
            <p><strong>Info Despacho:</strong> ${formData.dispatch_info}</p>
            <hr/>
            <table border="1" cellpadding="5" cellspacing="0" style="width: 100%">
                <tr><th>Producto</th><th>Cant. Pedida</th><th>Cant. Real</th><th>Precio Unit</th><th>Subtotal Real</th></tr>
        `;

        let totalReal = 0;
        for (const item of orderItems) {
            const sub = item.real_availability * item.unit_price;
            totalReal += sub;
            content += `
                <tr>
                    <td>${item.products?.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.real_availability}</td>
                    <td>$${item.unit_price.toLocaleString('es-CO')}</td>
                    <td>$${sub.toLocaleString('es-CO')}</td>
                </tr>
            `;
        }
        content += `</table><h3>Total Final: $${totalReal.toLocaleString('es-CO')}</h3>`;

        const win = window.open('', '_blank');
        if (win) {
            win.document.write(`<html><head><title>Prefactura</title><style>body { font-family: sans-serif; padding: 2rem; }</style></head><body>${content}</body></html>`);
            win.document.close();
        }
    };

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(var(--space-xl))', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <Link href={user?.isAdmin ? "/admin" : "/"} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500 }}>
                        <ArrowLeft size={20} /> Volver
                    </Link>
                    <h1 className="kinetic-header" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 'var(--space-sm)' }}>
                        Gestión de <span className="text-gradient-primary">Ventas y Pedidos</span>
                    </h1>
                </div>

                {isFormOpen && selectedOrder && (
                    <div className="glass-panel" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 style={{ color: 'var(--trust-blue)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Settings size={22} /> Detalles del Pedido</h2>
                            <button onClick={() => setIsFormOpen(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.3rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Cerrar</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Cliente</h3>
                                <p><strong>Nombre:</strong> {selectedOrder.profiles?.name}</p>
                                <p><strong>Email:</strong> {selectedOrder.profiles?.email}</p>
                                <p><strong>Teléfono:</strong> {selectedOrder.profiles?.phone}</p>

                                <form onSubmit={handleSaveOrder} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Estado del Pedido</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Procesando">Procesando</option>
                                            <option value="Despachado">Despachado</option>
                                            <option value="Entregado">Entregado</option>
                                            <option value="Cancelado">Cancelado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Información de Despacho (Guía, Transp.)</label>
                                        <textarea value={formData.dispatch_info} onChange={e => setFormData({ ...formData, dispatch_info: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} rows={3}></textarea>
                                    </div>
                                    <button type="submit" className="button-primary" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Guardar Cambios</button>
                                    <button type="button" onClick={generatePreInvoice} style={{ padding: '0.8rem', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}><FileText size={18} /> Generar Prefactura</button>
                                </form>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Ítems del Pedido</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Ajusta la "Disponibilidad Real" si no hay stock suficiente para despachar.</p>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                            <th style={{ padding: '0.5rem' }}>Producto</th>
                                            <th style={{ padding: '0.5rem' }}>Cant. Pedida</th>
                                            <th style={{ padding: '0.5rem' }}>Cant. Despachar</th>
                                            <th style={{ padding: '0.5rem' }}>P.Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '0.5rem' }}>{item.products?.name}</td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input type="number" min="0" max={item.quantity} value={item.real_availability} onChange={e => updateItemAvailability(item.id, Number(e.target.value))} style={{ width: '60px', padding: '0.3rem', border: '1px solid var(--trust-blue)' }} />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>${item.unit_price?.toLocaleString('es-CO')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                <div className="glass-panel" style={{ padding: 'var(--space-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem 0.5rem' }}>ID Pedido (UUID cortado)</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Fecha</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Cliente</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Estado</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Total Solicitado</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Cargando pedidos...</td></tr>
                            ) : ordersList.map(o => (
                                <tr key={o.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontFamily: 'monospace' }}>{o.id.substring(0, 8)}...</td>
                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>{o.profiles?.name}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', backgroundColor: o.status === 'Despachado' || o.status === 'Entregado' ? '#dcfce7' : (o.status === 'Pendiente' ? '#fef9c3' : '#e0e7ff'), color: '#374151' }}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--trust-blue)' }}>${o.total?.toLocaleString('es-CO')}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <button onClick={() => openOrderDetails(o)} className="button-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Gestionar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
