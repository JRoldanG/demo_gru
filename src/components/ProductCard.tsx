"use client";

import React, { useState } from 'react';
import { useCart, Product } from '@/context/CartContext';
import { Check, ShoppingCart, Info } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
    icon: React.ReactNode;
    colSpanClass: string;
    imageUrl?: string;
    imageUrls?: string[];
    showCartAndPrice?: boolean;
}

export default function ProductCard({ product, icon, colSpanClass, imageUrl, imageUrls, showCartAndPrice = true }: ProductCardProps) {
    const { addToCart, getDiscountedPrice } = useCart();
    const [isAdded, setIsAdded] = useState(false);
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
    const hasPictures = imageUrl || (imageUrls && imageUrls.length > 0);

    return (
        <div
            className={`glass-panel product-card ${colSpanClass} ${!hasPictures ? 'no-image' : ''}`}
            style={{ ...cardStyle, position: 'relative', overflow: 'hidden', transform: 'translateY(0)', transition: 'box-shadow 0.3s ease', display: 'flex', flexDirection: 'column', minHeight: '320px', padding: 0, backgroundSize: '85%', backgroundPosition: 'center 15%', backgroundRepeat: 'no-repeat' }}
        >
            {imageUrls && imageUrls.length > 0 && (
                <div style={{ position: 'absolute', top: '10%', left: 0, right: 0, height: '55%', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', pointerEvents: 'none' }}>
                    {imageUrls.map((url, idx) => {
                       const size = imageUrls.length === 1 ? '160px' : (130 - idx * 15) + 'px';
                       const isCenter = idx === 0;
                       return (
                        <div key={idx} style={{ 
                            width: size,
                            height: size,
                            position: 'relative',
                            zIndex: 10 - idx,
                            marginLeft: idx > 0 ? (imageUrls.length > 2 ? '-40px' : '-20px') : '0',
                            transform: `translateY(${isCenter ? '0' : '15px'})`,
                            filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.25))'
                        }}>
                            <img src={url} alt={`Composición ${product.name}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                       )
                    })}
                </div>
            )}
            <div style={{ flexGrow: 1, minHeight: '180px' }}></div>

            <div
                className="product-info-bottom"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 30%, transparent 60%)',
                    padding: 'var(--space-md)',
                    paddingTop: '3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}
            >
                {showCartAndPrice && (
                    <div
                        className="product-price"
                        style={{
                            alignSelf: 'flex-start',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 'var(--radius-full)',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            marginBottom: '0.25rem'
                        }}
                    >
                        {formattedPrice}
                    </div>
                )}

                <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{product.name}</h3>
                </div>

                {showCartAndPrice && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: '60px',
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--glass-border)',
                                    outline: 'none',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    backgroundColor: 'white',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <button
                                className={`button-add-cart ${isAdded ? 'added' : ''}`}
                                onClick={handleAdd}
                                style={{ flex: '1 1 auto', padding: '0.4rem', fontSize: '0.9rem', minWidth: '100px' }}
                            >
                                {isAdded ? (
                                    <>
                                        <Check size={16} /> Listo
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={16} /> Añadir
                                    </>
                                )}
                            </button>
                            <Link href={`/products/${product.id}`} passHref style={{ display: 'flex', flex: '0 0 auto' }}>
                                <button
                                    onClick={() => {
                                        if (typeof window !== 'undefined') {
                                            sessionStorage.setItem('products_scroll_pos', window.scrollY.toString());
                                        }
                                    }}
                                    className="button-primary"
                                    style={{
                                        width: 'auto',
                                        padding: '0.4rem 0.6rem',
                                        display: 'flex',
                                        gap: '0.4rem',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem'
                                    }}
                                    title="Ver detalle"
                                >
                                    <Info size={16} /> Detalle
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
