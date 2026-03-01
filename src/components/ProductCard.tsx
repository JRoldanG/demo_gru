"use client";

import React, { useState } from 'react';
import { useCart, Product } from '@/context/CartContext';
import { Check, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    icon: React.ReactNode;
    colSpanClass: string;
    imageUrl?: string;
}

export default function ProductCard({ product, icon, colSpanClass, imageUrl }: ProductCardProps) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAdd = () => {
        addToCart(product);
        setIsAdded(true);

        // Reset added state after 2 seconds for visual feedback
        setTimeout(() => {
            setIsAdded(false);
        }, 2000);
    };

    // Format price as COP (Colombian Peso) for realism
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(product.price);

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
                <div className="product-price">{formattedPrice}</div>
            </div>

            <div className="product-info">
                <p style={{ fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    {product.category}
                </p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
            </div>

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
        </div>
    );
}
