"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert, ArrowLeft, Plus, Edit, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

export default function AdminProducts() {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const [productsList, setProductsList] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [formError, setFormError] = useState('');
    const [formTrace, setFormTrace] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLine, setSelectedLine] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', vademecum: '', line: '', invima_registration: '', status: 'Disponible', image_url: '',
        price_cliente: 0, price_accionista: 0, price_droguista: 0
    });

    // Helper para evitar hangs infinitos
    const withTimeout = async <T,>(promiseLike: PromiseLike<T>, ms: number = 10000): Promise<T> => {
        let timer: NodeJS.Timeout;
        const fallback = new Promise<T>((resolve, reject) => {
            timer = setTimeout(() => reject(new Error('La operación tardó demasiado (Timeout)')), ms);
        });
        return Promise.race([Promise.resolve(promiseLike), fallback]).finally(() => clearTimeout(timer));
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        const { data: prods, error: prodErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (prodErr) console.error("Error fetching products:", prodErr);

        const { data: prices, error: priceErr } = await supabase.from('product_prices').select('*');
        if (priceErr) console.error("Error fetching prices:", priceErr);

        if (prods && prices) {
            const mapped = prods.map(p => {
                const myPrices = prices.filter(pr => pr.product_id === p.id);
                return {
                    ...p,
                    price_cliente: p.price || 0, // Fallback to p.price for base client price
                    price_accionista: myPrices.find(pr => pr.price_tier === 'ACCIONISTA')?.price || 0,
                    price_droguista: myPrices.find(pr => pr.price_tier === 'DROGUISTA')?.price || 0,
                };
            });
            setProductsList(mapped);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        setMounted(true);
        if (isAuthenticated && user?.isAdmin) {
            fetchProducts();
        }
    }, [isAuthenticated, user]);

    if (!mounted || isInitializing) {
        return <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div className="animate-pulse" style={{ color: 'var(--trust-blue)' }}>Verificando sesión...</div></main>;
    }

    if (!isAuthenticated || !user?.isAdmin) {
        return (
            <main style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <ShieldAlert size={64} style={{ color: '#ef4444', margin: '0 auto var(--space-md)' }} />
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>Acceso Denegado</h1>
                </div>
            </main>
        );
    }

    const handleOpenForm = (prod: any = null) => {
        if (prod) {
            setEditingProduct(prod);
            setFormData({
                name: prod.name, description: prod.description, vademecum: prod.vademecum || '', line: prod.line,
                invima_registration: prod.invima_registration, status: prod.status, image_url: prod.image_url || '',
                price_cliente: prod.price_cliente, price_accionista: prod.price_accionista, price_droguista: prod.price_droguista
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', description: '', vademecum: '', line: '', invima_registration: '', status: 'Disponible', image_url: '',
                price_cliente: 0, price_accionista: 0, price_droguista: 0
            });
        }
        setFormError('');
        setFormTrace('');
        setImageFile(null);
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');
        setFormTrace('');

        try {
            let finalImageUrl = formData.image_url;

            // 1. Upload image if a new file was selected
            if (imageFile) {
                setIsUploadingImage(true);
                setFormTrace('Iniciando subida de imagen a ImgBB...');

                const uploadData = new FormData();
                uploadData.append('image', imageFile);

                const apiKey = process.env.NEXT_PUBLIC_IMAGE_API_KEY;
                if (!apiKey) throw new Error("No se encontró la API Key de ImgBB (NEXT_PUBLIC_IMAGE_API_KEY)");

                setFormTrace('Contactando API de ImgBB...');
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                    method: 'POST',
                    body: uploadData,
                });

                setFormTrace('Respuesta de ImgBB recibida. Leyendo JSON...');
                const result = await response.json();

                if (result.success && result.data && result.data.url) {
                    finalImageUrl = result.data.url;
                    setFormTrace('Imagen subida con éxito: ' + finalImageUrl);
                } else {
                    throw new Error("Error alojando la imagen en ImgBB. Detalles: " + (result.error?.message || JSON.stringify(result)));
                }

                // Done uploading image, immediately reset state so UI shows "Guardando..."
                setIsUploadingImage(false);
            }

            // 2. Save product to Supabase
            setFormTrace('Guardando en la base de datos (Supabase)...');
            const prodData = {
                name: formData.name, description: formData.description, vademecum: formData.vademecum, line: formData.line,
                invima_registration: formData.invima_registration, status: formData.status, image_url: finalImageUrl,
                price: formData.price_cliente
            };

            let targetId = editingProduct?.id;
            const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            // BULLETPROOF: Bypassing Supabase JS Client entirely to avoid React/Vercel promise lock deadlocks
            let token = sbKey;
            try {
                const sessionStr = localStorage.getItem('gruinfacol-auth-token');
                if (sessionStr) {
                    const sessionData = JSON.parse(sessionStr);
                    if (sessionData && sessionData.access_token) {
                        token = sessionData.access_token;
                    }
                }
            } catch (e) { }

            const fetchHeaders = {
                'Content-Type': 'application/json',
                'apikey': sbKey as string,
                'Authorization': `Bearer ${token}`
            };

            if (targetId) {
                const res = await fetch(`${sbUrl}/rest/v1/products?id=eq.${targetId}`, {
                    method: 'PATCH',
                    headers: fetchHeaders,
                    body: JSON.stringify(prodData)
                });
                if (!res.ok) throw new Error("Error actualizando producto: " + await res.text());
            } else {
                const res = await fetch(`${sbUrl}/rest/v1/products`, {
                    method: 'POST',
                    headers: { ...fetchHeaders, 'Prefer': 'return=representation' },
                    body: JSON.stringify(prodData)
                });
                if (!res.ok) throw new Error("Error creando producto: " + await res.text());
                const data = await res.json();
                if (!data || data.length === 0) throw new Error("Error: El producto se creó en blanco.");
                targetId = data[0].id;
            }

            // 3. Save Prices
            setFormTrace('Asignando las listas de precios...');
            const prices = [
                { product_id: targetId, price_tier: 'ACCIONISTA', price: formData.price_accionista },
                { product_id: targetId, price_tier: 'DROGUISTA', price: formData.price_droguista }
            ];

            const priceRes = await fetch(`${sbUrl}/rest/v1/product_prices?on_conflict=product_id,price_tier`, {
                method: 'POST',
                headers: { ...fetchHeaders, 'Prefer': 'resolution=merge-duplicates' },
                body: JSON.stringify(prices)
            });
            if (!priceRes.ok) console.error("Error upserting price:", await priceRes.text());

            // 4. Success
            setFormTrace('¡Finalizado! Refrescando vista...');
            setIsFormOpen(false);
            setFormTrace('');
            fetchProducts();

        } catch (err: any) {
            console.error("Catch Error in handleSave:", err);
            setFormError(err.message || 'Error Desconocido');
        } finally {
            setIsSubmitting(false);
            setIsUploadingImage(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
        }
    };

    const uniqueLines = Array.from(new Set(productsList.map(p => p.line))).filter(Boolean).sort();

    const filteredProducts = productsList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.line && p.line.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.vademecum && p.vademecum.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesLine = selectedLine === '' || p.line === selectedLine;

        return matchesSearch && matchesLine;
    });

    return (
        <main style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', paddingTop: 'calc(100px + var(--space-xl))', paddingBottom: 'var(--space-3xl)' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                <div style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--trust-blue)', fontWeight: 500 }}>
                            <ArrowLeft size={20} /> Volver al Panel
                        </Link>
                        <h1 className="kinetic-header" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 'var(--space-sm)' }}>
                            Gestión de <span className="text-gradient-primary">Productos</span>
                        </h1>
                    </div>
                    <button onClick={() => handleOpenForm()} className="button-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Nuevo Producto
                    </button>
                </div>

                {isFormOpen && (
                    <div className="glass-panel" style={{ padding: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                        <h2 style={{ color: 'var(--trust-blue)', marginBottom: '1rem' }}>{editingProduct ? 'Editar Producto' : 'Crear Producto'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Nombre</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Línea</label>
                                <input required type="text" value={formData.line} onChange={e => setFormData({ ...formData, line: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Descripción (Corta)</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', minHeight: '60px' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Vademécum / Detalles Especializados (Opcional)</label>
                                <textarea value={formData.vademecum} onChange={e => setFormData({ ...formData, vademecum: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', minHeight: '120px' }} placeholder="Ingrese información detallada, contraindicaciones, posología, etc." />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Reg Invima</label>
                                <input type="text" value={formData.invima_registration} onChange={e => setFormData({ ...formData, invima_registration: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Estado</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }}>
                                    <option value="Disponible">Disponible</option>
                                    <option value="Agotado">Agotado</option>
                                </select>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Imagen del Producto</label>

                                {formData.image_url ? (
                                    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Imagen actual guardada:</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={formData.image_url} alt="Producto" style={{ width: '60px', height: '60px', objectFit: 'contain', backgroundColor: 'white', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                                            <a href={formData.image_url} target="_blank" rel="noreferrer" style={{ color: 'var(--trust-blue)', textDecoration: 'underline', fontSize: '0.9rem' }}>Ver imagen</a>
                                        </div>
                                    </div>
                                ) : null}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="imageUpload"
                                        onChange={e => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="imageUpload" className="button-primary" style={{ display: 'inline-flex', padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer', backgroundColor: imageFile ? 'var(--accent-teal)' : 'var(--trust-blue)', margin: 0 }}>
                                        {imageFile ? 'Imagen seleccionada' : formData.image_url ? 'Seleccionar otra imagen' : 'Seleccionar imagen'}
                                    </label>
                                    {imageFile && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{imageFile.name}</span>}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Precio Final ($)</label>
                                <input required type="number" value={formData.price_cliente} onChange={e => setFormData({ ...formData, price_cliente: Number(e.target.value) })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Precio Accionista ($)</label>
                                <input required type="number" value={formData.price_accionista} onChange={e => setFormData({ ...formData, price_accionista: Number(e.target.value) })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Precio Droguista ($)</label>
                                <input required type="number" value={formData.price_droguista} onChange={e => setFormData({ ...formData, price_droguista: Number(e.target.value) })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
                                {formTrace && !formError && (
                                    <div style={{ padding: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #bae6fd' }}>
                                        Estatus lógico: {formTrace}
                                    </div>
                                )}
                                {formError && (
                                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                                        {formError}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="button-primary" disabled={isSubmitting || isUploadingImage} style={{ opacity: (isSubmitting || isUploadingImage) ? 0.7 : 1 }}>
                                        {isUploadingImage ? 'Subiendo imagen...' : isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                                    </button>
                                    <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--glass-border)', borderRadius: '4px', backgroundColor: 'transparent', cursor: 'pointer' }} disabled={isSubmitting || isUploadingImage}>Cancelar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, línea, componente o descripción..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '4px',
                                border: '1px solid var(--glass-border)',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <select
                        value={selectedLine}
                        onChange={(e) => setSelectedLine(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '4px',
                            border: '1px solid var(--glass-border)',
                            outline: 'none',
                            backgroundColor: 'white',
                            minWidth: '200px'
                        }}
                    >
                        <option value="">Todas las Líneas</option>
                        {uniqueLines.map(line => (
                            <option key={line as string} value={line as string}>{line as string}</option>
                        ))}
                    </select>
                </div>

                <div className="glass-panel" style={{ padding: 'var(--space-md)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '1rem 0.5rem' }}>Nombre</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Línea</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Estado</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Precio Final</th>
                                <th style={{ padding: '1rem 0.5rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{p.name}</td>
                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{p.line}</td>
                                    <td style={{ padding: '1rem 0.5rem' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.8rem', backgroundColor: p.status === 'Disponible' ? '#dcfce7' : '#fee2e2', color: p.status === 'Disponible' ? '#166534' : '#991b1b' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 0.5rem', color: 'var(--trust-blue)' }}>${p.price_cliente?.toLocaleString('es-CO')}</td>
                                    <td style={{ padding: '1rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleOpenForm(p)} style={{ background: 'none', border: 'none', color: 'var(--trust-blue)', cursor: 'pointer' }}><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
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
