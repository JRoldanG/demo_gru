"use client";

import React, { useState } from 'react';
import { useCart, Product } from '@/context/CartContext';
import { Check, ShoppingCart } from 'lucide-react';

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
            className={`glass-panel product-card ${colSpanClass} ${!imageUrl ? 'no-image' : ''}`}
            style={cardStyle}
        >
            <div className="product-card-header">
                <div className="product-icon-wrapper">
                    {icon}
                </div>
                {showCartAndPrice && <div className="product-price">{formattedPrice}</div>}
            </div>

            <div className="product-info">
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
