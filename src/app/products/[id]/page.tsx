"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Activity, ArrowLeft, Check, ShoppingCart } from 'lucide-react';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isInitializing } = useAuth();
    const { addToCart, getDiscountedPrice } = useCart();
    
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitializing && params?.id) {
            fetchProductData();
        }
    }, [isInitializing, params?.id, isAuthenticated]);

    const fetchProductData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch product data
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            if (productError || !productData) {
                setError("Producto no encontrado");
                setLoading(false);
                return;
            }

            // Determine base price
            let finalProductPrice = Number(productData.price) || 0;

            // If authenticated and HAS a special tier, override the price with `product_prices`
            if (isAuthenticated && user?.priceTier && user.priceTier !== 'CLIENTE_FINAL') {
                const { data: priceData, error: priceError } = await supabase
                    .from('product_prices')
                    .select('price')
                    .eq('product_id', params.id)
                    .eq('price_tier', user.priceTier)
                    .maybeSingle();

                if (!priceError && priceData && typeof priceData.price === 'number') {
                    finalProductPrice = priceData.price;
                }
            }

            setProduct({
                ...productData,
                price: finalProductPrice,
                category: productData.line || 'General',
                imageUrl: productData.image_url
            });
        } catch (err) {
            console.error("Error fetching product details", err);
            setError("Error al cargar la información del producto");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        if (product) {
            addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
                vademecum: product.vademecum,
                category: product.category,
                imageUrl: product.imageUrl
            }, quantity);
            
            setIsAdded(true);
            setQuantity(1);
            setTimeout(() => { setIsAdded(false); }, 2000);
        }
    };

    if (loading || isInitializing) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ textAlign: 'center' }}>
                    <Activity className="animate-pulse" size={48} style={{ color: 'var(--trust-blue)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando detalles del producto...</p>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
                    <button onClick={() => router.push('/products')} className="button-primary">Volver a Productos</button>
                </div>
            </main>
        );
    }

    const finalPrice = getDiscountedPrice(product.price);
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(finalPrice);

    return (
        <main style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem' }}>
            <div className="bg-medical-grid"></div>
            
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--trust-blue)',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        marginBottom: '2rem',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(-5px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                    <ArrowLeft size={20} /> Volver a Productos
                </button>

                {/* Detail Layout Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* Header: Title and Description (Full Width) */}
                    <div className="glass-panel" style={{ padding: 'var(--space-xl)' }}>
                        <p style={{ color: 'var(--trust-blue)', fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem", fontSize: '0.85rem' }}>
                            LÍNEA {product.category?.toUpperCase() || 'GENERAL'}
                        </p>
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2, textTransform: 'uppercase' }}>
                            {product.name}
                        </h1>
                        {product.description && (
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                {product.description}
                            </p>
                        )}
                    </div>

                    {/* Main Content: Left (Image) & Right (Vademecum) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
                        
                        {/* Image Section (Left Column) */}
                        <div className="glass-panel" style={{ flex: '1 1 40%', minWidth: '300px', display: 'flex', flexDirection: 'column', padding: 'var(--space-md)', backgroundColor: 'white' }}>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                                {product.imageUrl ? (
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            maxHeight: '600px',
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                        }}
                                    />
                                ) : (
                                    <div style={{ color: 'var(--text-muted)' }}>Sin imagen disponible</div>
                                )}
                            </div>
                        </div>

                        {/* Vademecum Section (Right Column) */}
                        <div className="glass-panel" style={{ flex: '1 1 55%', minWidth: '350px', display: 'flex', flexDirection: 'column', padding: 'var(--space-md)' }}>
                            <div style={{ marginBottom: 'auto' }}>
                                {product.vademecum ? (
                                    <div style={{ 
                                        backgroundColor: 'rgba(15, 76, 129, 0.03)', 
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '12px',
                                        padding: '1.5rem'
                                    }}>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--trust-blue)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Activity size={18} /> Información de Vademécum
                                        </h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                            {product.vademecum}
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No hay información de vademécum disponible para este producto.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Actions (Full Width Bottom Section) */}
                    <div className="glass-panel" style={{ 
                        padding: 'var(--space-xl)',
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '2rem',
                        background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(240,248,255,0.7))'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Precio final:</span>
                            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--trust-blue)' }}>{formattedPrice}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ width: '40px', height: '40px', background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >-</button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{
                                        width: '60px',
                                        height: '40px',
                                        border: 'none',
                                        outline: 'none',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        backgroundColor: 'transparent',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    style={{ width: '40px', height: '40px', background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >+</button>
                            </div>
                            <button
                                className={`button-add-cart ${isAdded ? 'added' : ''}`}
                                onClick={handleAdd}
                                style={{ flex: 1, padding: '1rem 2rem', fontSize: '1.1rem', minWidth: '200px', backgroundColor: isAdded ? 'var(--accent-teal)' : 'var(--trust-blue)', color: 'white' }}
                            >
                                {isAdded ? (
                                    <>
                                        <Check size={20} /> Agregado al carrito
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={20} /> Comprar ahora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
