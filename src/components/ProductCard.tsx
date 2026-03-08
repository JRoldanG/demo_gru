"use client";

import React, { useState } from 'react';
import { useCart, Product } from '@/context/CartContext';
import { Check, ShoppingCart, Info } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    icon: React.ReactNode;
    colSpanClass: string;
    imageUrl?: string;
    showCartAndPrice?: boolean;
}

export default function ProductCard({ product, icon, colSpanClass, imageUrl, showCartAndPrice = true }: ProductCardProps) {
    const { addToCart, getDiscountedPrice } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [quantity, setQuantity] = useState<number>(1);

    const handleAdd = () => {
        addToCart(product, quantity);
        setIsAdded(true);
        setQuantity(1);

        // Reset added state after 2 seconds for visual feedback
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    const finalPrice = getDiscountedPrice(product.price);

    // Format price as COP (Colombian Peso) for realism
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(finalPrice);

    const cardStyle = imageUrl ? { backgroundImage: `url(${imageUrl})` } : {};

    return (
        <div
            className={`glass-panel product-card ${colSpanClass} ${!imageUrl ? 'no-image' : ''}`}
            style={{ ...cardStyle, position: 'relative', overflow: 'hidden', transform: 'none' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Vademecum Overlay (appears on hover) */}
            {product.vademecum && (
                <div
                    className="vademecum-overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(15, 76, 129, 0.98)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        padding: 'var(--space-lg)',
                        paddingTop: 'calc(var(--space-lg) + 60px)',
                        zIndex: 10,
                        opacity: isHovered ? 1 : 0,
                        visibility: isHovered ? 'visible' : 'hidden',
                        transition: 'opacity 0.3s ease, visibility 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'var(--accent-teal) transparent'
                    }}
                >
                    <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent-cyan)', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>
                        Detalles Especializados
                    </h4>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                        {product.vademecum}
                    </p>
                </div>
            )}

            <div className="product-card-header" style={{ position: 'relative', zIndex: 11 }}>
                {product.vademecum && (
                    <div
                        className="product-icon-wrapper"
                        style={{
                            display: 'flex',
                            gap: '0.2rem',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 'auto',
                            padding: '0 0.5rem',
                            height: '28px',
                            backgroundColor: 'white',
                            borderRadius: '14px',
                            border: '1px solid var(--glass-border)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        <Info size={14} style={{ color: 'var(--trust-blue)' }} />
                        <span style={{ color: 'var(--trust-blue)', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Detalle</span>
                    </div>
                )}
                {showCartAndPrice && (
                    <div
                        className="product-price"
                        style={{
                            opacity: isHovered && product.vademecum ? 0 : 1,
                            visibility: isHovered && product.vademecum ? 'hidden' : 'visible',
                            transition: 'opacity 0.3s ease, visibility 0.3s ease'
                        }}
                    >
                        {formattedPrice}
                    </div>
                )}
            </div>

            <div
                className="product-info"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    opacity: isHovered && product.vademecum ? 0 : 1,
                    transition: 'opacity 0.3s ease'
                }}
            >
                <p style={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {product.category}
                </p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
            </div>

            {showCartAndPrice && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', position: 'relative', zIndex: 11 }}>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                            width: '80px',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--glass-border)',
                            outline: 'none',
                            textAlign: 'center',
                            fontWeight: 600,
                            backgroundColor: 'white'
                        }}
                    />
                    <button
                        className={`button-add-cart ${isAdded ? 'added' : ''}`}
                        onClick={handleAdd}
                        style={{ flex: 1 }}
                    >
                        {isAdded ? (
                            <>
                                <Check size={18} /> Agregado
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={18} /> Agregar
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
