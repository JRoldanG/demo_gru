"use client";

import React, { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ShoppingCartDrawer() {
    const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, clearCart, getDiscountedPrice } = useCart();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    // Prevent hydration mismatch
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    const formattedTotal = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(cartTotal);

    return (
        <>
            <div
                className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
                onClick={() => setIsCartOpen(false)}
            />

            <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2><ShoppingBag size={20} className="text-gradient-primary" /> Tu Carrito</h2>
                    <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <div className="cart-items">
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                            <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-info">
                                    <h4>{item.name}</h4>
                                    <div className="cart-item-price">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(getDiscountedPrice(item.price))}
                                    </div>
                                </div>

                                <div className="cart-item-actions">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val) && val > 0) {
                                                updateQuantity(item.id, val);
                                            }
                                        }}
                                        style={{
                                            width: '65px',
                                            textAlign: 'center',
                                            fontSize: '0.9rem',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            outline: 'none',
                                            backgroundColor: 'var(--bg-color)',
                                            color: 'var(--text-primary)',
                                            padding: '0.2rem',
                                            margin: '0 0.25rem'
                                        }}
                                    />
                                    <button
                                        className="quantity-btn"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <button
                                        style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '0.5rem', cursor: 'pointer' }}
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span className="text-gradient-primary">{formattedTotal}</span>
                        </div>

                        <button
                            className="button-primary"
                            style={{ width: '100%', marginBottom: '0.75rem' }}
                            onClick={() => {
                                setIsCartOpen(false);
                                router.push('/checkout');
                            }}
                        >
                            Generar Orden
                        </button>

                        <button
                            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={clearCart}
                        >
                            Vaciar Carrito
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
