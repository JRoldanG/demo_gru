"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Search, Pill, Droplet, ShieldAlert, Wind, Activity, HeartPulse, Leaf, Syringe, Stethoscope, Brain, Eye, Baby, Package } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    useEffect(() => {
        if (!isInitializing) {
            fetchProducts();
        }
    }, [isAuthenticated, isInitializing]);

    // Restore scroll position after loading products
    useEffect(() => {
        if (!loading) {
            const savedScroll = sessionStorage.getItem('products_scroll_pos');
            if (savedScroll) {
                // Pequeño timeout para asegurar que el DOM ya pintó el grid
                setTimeout(() => {
                    window.scrollTo({ top: parseInt(savedScroll), behavior: 'instant' });
                }, 100);
            }
        }
    }, [loading]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // First fetch all available products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*')
                .eq('status', 'Disponible');

            if (productsError) throw productsError;

            // Base products mapped (everyone is considered Cliente Final primarily).
            let activeProducts: any[] = productsData?.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                vademecum: p.vademecum,
                price: p.price || 0, // Base price
                category: p.line,
                colSpanClass: "col-span-4",
                imageUrl: p.image_url
            })) || [];

            // If authenticated and HAS a special tier, override the price with `product_prices`
            if (isAuthenticated && user?.priceTier && user.priceTier !== 'CLIENTE_FINAL') {
                const { data: pricesData, error: pricesError } = await supabase
                    .from('product_prices')
                    .select('product_id, price')
                    .eq('price_tier', user.priceTier);

                if (!pricesError && pricesData) {
                    const priceMap = new Map();
                    pricesData.forEach(p => {
                        priceMap.set(p.product_id, p.price);
                    });

                    activeProducts = activeProducts.map(p => {
                        if (priceMap.has(p.id)) {
                            return { ...p, price: priceMap.get(p.id) };
                        }
                        return p;
                    });
                }
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

    const uniqueCategories = ['Todas', ...Array.from(new Set(productsList.map(p => p.category)))].filter(Boolean);

    const filteredProducts = productsList.filter(prod => {
        const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'Todas' || prod.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <main>
            <style jsx>{`
                .category-scroll::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div className="bg-medical-grid"></div>

            <section className="section" style={{ paddingTop: 'calc(var(--space-3xl) * 1.5)', minHeight: '40vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', backgroundColor: 'rgba(248, 250, 252, 0.95)', boxShadow: 'var(--shadow-md)', marginBottom: 'var(--space-2xl)' }}>
                <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: "900px" }}>
                    <h1 className="kinetic-header">
                        Catálogo de <span className="text-gradient-primary">Productos</span>
                    </h1>
                    <p className="text-sub" style={{ margin: 'var(--space-lg) auto', color: "var(--text-primary)", fontSize: "1.1rem", maxWidth: "100%" }}>
                        {isAuthenticated
                            ? <>Explora nuestra selecta gama de medicamentos y productos de investigación farmacéutica. Lista de precios asignada: <strong>{user?.priceTier?.replace('_', ' ')}</strong>.</>
                            : <>Explora nuestra selecta gama de medicamentos y productos de investigación farmacéutica.</>
                        }
                    </p>
                </div>
            </section>

            {/* Filters Section */}
            <section className="container section" style={{ paddingTop: 0, paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1rem' }}>
                    {/* Search Bar */}
                    <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar medicamentos, principios activos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--glass-bg)',
                                backdropFilter: 'blur(10px)',
                                fontSize: '1rem',
                                color: 'var(--text-primary)',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--trust-blue)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                    </div>

                    {/* Category Pills */}
                    <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        overflowX: 'auto',
                        paddingBottom: '0.5rem',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        justifyContent: uniqueCategories.length > 5 ? 'flex-start' : 'center'
                    }} className="category-scroll">
                        {uniqueCategories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '9999px',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    border: selectedCategory === category ? '1px solid var(--trust-blue)' : '1px solid var(--border-color)',
                                    backgroundColor: selectedCategory === category ? 'var(--trust-blue)' : 'transparent',
                                    color: selectedCategory === category ? 'white' : 'var(--text-secondary)',
                                    cursor: 'pointer'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="container section" style={{ paddingTop: 0, minHeight: '50vh' }}>
                {filteredProducts.length > 0 ? (
                    // 1. Obtenemos las categorías únicas dentro de los productos filtrados, ignorando 'Todas'
                    Array.from(new Set(filteredProducts.map(p => p.category)))
                        .filter(cat => cat !== 'Todas')
                        .sort((a, b) => a.localeCompare(b)) // Orden alfabético
                        .map((category) => {
                            // 2. Filtramos los productos que pertenecen a esta categoría
                            const categoryProducts = filteredProducts.filter(p => p.category === category);
                            
                            // 3. Renderizamos la sección de esta categoría concreta con su propio Grid
                            return (
                                <div key={category} style={{ marginBottom: '4rem' }}>
                                    <h2 style={{ 
                                        fontSize: '2rem', 
                                        color: 'var(--trust-blue)', 
                                        marginBottom: '1.5rem',
                                        borderBottom: '2px solid var(--glass-border)',
                                        paddingBottom: '0.5rem',
                                        display: 'inline-block',
                                        textTransform: 'uppercase'
                                    }}>
                                        LÍNEA {category}
                                    </h2>
                                    <div className="bento-grid">
                                        {categoryProducts.map((prod) => (
                                            <ProductCard
                                                key={prod.id}
                                                product={{
                                                    id: prod.id,
                                                    name: prod.name,
                                                    description: prod.description,
                                                    vademecum: prod.vademecum,
                                                    price: prod.price, 
                                                    category: prod.category
                                                }}
                                                icon={getIconForLine(prod.category)}
                                                colSpanClass={prod.colSpanClass}
                                                imageUrl={prod.imageUrl}
                                                showCartAndPrice={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })
                ) : (
                    <div className="bento-grid">
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <Search size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                            <p>No se encontraron productos que coincidan con tu búsqueda.</p>
                            {(searchQuery || selectedCategory !== 'Todas') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('Todas');
                                    }}
                                    style={{
                                        marginTop: '1rem',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--trust-blue)',
                                        textDecoration: 'underline',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
