"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Pill, Droplet, ShieldAlert, Wind, Activity, HeartPulse, Leaf, Syringe, Stethoscope, Brain, Eye, Baby, Package } from 'lucide-react';

// Helper to map line names to icons, keeping the original page.tsx aesthetic
const getIconForLine = (line: string) => {
    switch (line) {
        case "Línea Antibióticos": return <Pill size={28} style={{ color: "var(--trust-blue)" }} />;
        case "Línea Antimicóticos": return <Droplet size={28} style={{ color: "var(--accent-cyan)" }} />;
        case "Antiparasitarios": return <ShieldAlert size={28} style={{ color: "var(--trust-blue-light)" }} />;
        case "Respiratoria & Antialérgica": return <Wind size={28} style={{ color: "var(--accent-teal)" }} />;
        case "Analgésica & Antiinflamatoria": return <Activity size={28} style={{ color: "var(--adaptly-5)" }} />;
        case "Línea Circulatoria": return <HeartPulse size={28} style={{ color: "var(--trust-blue)" }} />;
        case "Protectores Hepáticos": return <Leaf size={28} style={{ color: "var(--accent-teal)" }} />;
        case "Línea Gastroentérica": return <Syringe size={28} style={{ color: "var(--trust-blue-light)" }} />;
        case "Coadyuvante de Peso": return <Activity size={28} style={{ color: "var(--accent-cyan)" }} />;
        case "Prevención HBP": return <Stethoscope size={28} style={{ color: "var(--trust-blue)" }} />;
        case "Línea Nutricional": return <Brain size={28} style={{ color: "var(--adaptly-5)" }} />;
        case "Línea Oftálmica": return <Eye size={28} style={{ color: "var(--trust-blue)" }} />;
        case "Fórmulas Infantiles": return <Baby size={28} style={{ color: "var(--accent-teal)" }} />;
        case "Belleza e Higiene": return <Droplet size={28} style={{ color: "var(--accent-cyan)" }} />;
        case "Línea Dermatológica": return <ShieldAlert size={28} style={{ color: "var(--trust-blue-light)" }} />;
        default: return <Package size={28} style={{ color: "var(--trust-blue)" }} />;
    }
};

export default function ProductsPage() {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const router = useRouter();
    const [productsList, setProductsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isInitializing) {
            fetchProducts();
        }
    }, [isAuthenticated, isInitializing]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // First fetch all available products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'Disponible');

            if (productsError) throw productsError;

            let activeProducts: any[] = [];

            if (isAuthenticated) {
                // Fetch prices for the user's specific price tier
                const tier = user?.priceTier || 'CLIENTE_FINAL';
                const { data: pricesData, error: pricesError } = await supabase
                    .from('product_prices')
                    .select('product_id, price')
                    .eq('price_tier', tier);

                if (pricesError) throw pricesError;

                // Map prices to products
                const priceMap = new Map();
                if (pricesData) {
                    pricesData.forEach(p => {
                        priceMap.set(p.product_id, p.price);
                    });
                }

                activeProducts = productsData?.filter(p => priceMap.has(p.id)).map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: priceMap.get(p.id),
                    category: p.line,
                    colSpanClass: "col-span-4",
                    imageUrl: p.image_url
                })) || [];
            } else {
                // For non-authenticated, skip prices and don't filter by `product_prices`
                activeProducts = productsData?.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: 0,
                    category: p.line,
                    colSpanClass: "col-span-4",
                    imageUrl: p.image_url
                })) || [];
            }

            setProductsList(activeProducts);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'calc(248, 250, 252, 0.95)' }}>
                <div style={{ textAlign: 'center' }}>
                    <Activity className="animate-pulse" size={48} style={{ color: 'var(--trust-blue)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Cargando catálogo...</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <div className="bg-medical-grid"></div>

            <section className="section" style={{ paddingTop: 'calc(var(--space-3xl) * 1.5)', minHeight: '40vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: 'rgba(248, 250, 252, 0.95)', boxShadow: 'var(--shadow-md)', marginBottom: 'var(--space-2xl)' }}>
                <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: "900px" }}>
                    <h1 className="kinetic-header">
                        Catálogo de <span className="text-gradient-primary">Productos</span>
                    </h1>
                    <p className="text-sub" style={{ margin: 'var(--space-lg) auto', color: "var(--text-primary)", fontSize: "1.1rem", maxWidth: "100%" }}>
                        {isAuthenticated
                            ? <>Explora nuestra selecta gama de medicamentos y productos de investigación farmacéutica. Lista de precios asignada: <strong>{user?.priceTier?.replace('_', ' ')}</strong>.</>
                            : <>Inicia sesión o regístrate para ver nuestros precios y realizar pedidos.</>
                        }
                    </p>
                </div>
            </section>

            <section className="container section" style={{ paddingTop: 0, minHeight: '50vh' }}>
                <div className="bento-grid">
                    {productsList.length > 0 ? (
                        productsList.map((prod) => (
                            <ProductCard
                                key={prod.id}
                                product={{
                                    id: prod.id,
                                    name: prod.name,
                                    description: prod.description,
                                    price: prod.price, // the specific tier price we fetched
                                    category: prod.category
                                }}
                                icon={getIconForLine(prod.category)}
                                colSpanClass={prod.colSpanClass}
                                imageUrl={prod.imageUrl}
                                showCartAndPrice={isAuthenticated}
                            />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <p>No se encontraron productos disponibles para tu lista de precios actual.</p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
