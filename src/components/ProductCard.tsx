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

    const handleAdd = () => {
        addToCart(product);
        setIsAdded(true);

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
            className={`glass-panel product-card ${colSpanClass} ${!imageUrl ? 'no-image' : ''} group`}
            style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}
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
                        backgroundColor: 'rgba(15, 76, 129, 0.95)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        padding: 'var(--space-lg)',
                        zIndex: 10,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
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

            <style jsx>{`
                /* Disable standard background zoom/darkening if vademecum exists, 
                   since the overlay handles it */
                .product-card.group:hover::before {
                    opacity: ${product.vademecum ? '0.4' : '0.9'};
                }
                .product-card.group:hover .vademecum-overlay {
                    opacity: 1;
                }
            `}</style>

            <div className="product-card-header" style={{ position: 'relative', zIndex: 2 }}>
                <div className="product-icon-wrapper" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {icon}
                    {product.vademecum && (
                        <div title="Hover para ver detalles" style={{ display: 'flex', alignItems: 'center' }}>
                            <Info size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    )}
                </div>
                {showCartAndPrice && <div className="product-price">{formattedPrice}</div>}
            </div>

            <div className="product-info" style={{ position: 'relative', zIndex: 2 }}>
                <p style={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {product.category}
                </p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
            </div>

            {showCartAndPrice && (
                <button
                    className={`button-add-cart ${isAdded ? 'added' : ''}`}
                    onClick={handleAdd}
                >
                    {isAdded ? (
                        <>
                            <Check size={18} /> Agregado
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={18} /> Agregar al Carrito
                        </>
                    )}
                </button>
            )}
        </div>
    );
}
