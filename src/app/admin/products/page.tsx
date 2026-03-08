"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ShieldAlert, ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminProducts() {
    const { user, isAuthenticated, isInitializing } = useAuth();
    const [productsList, setProductsList] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [formError, setFormError] = useState('');

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', line: '', invima_registration: '', status: 'Disponible', image_url: '',
        price_cliente: 0, price_accionista: 0, price_droguista: 0
    });

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
                    price_cliente: myPrices.find(pr => pr.price_tier === 'CLIENTE_FINAL')?.price || 0,
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
                name: prod.name, description: prod.description, line: prod.line,
                invima_registration: prod.invima_registration, status: prod.status, image_url: prod.image_url || '',
                price_cliente: prod.price_cliente, price_accionista: prod.price_accionista, price_droguista: prod.price_droguista
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '', description: '', line: '', invima_registration: '', status: 'Disponible', image_url: '',
                price_cliente: 0, price_accionista: 0, price_droguista: 0
            });
        }
        setFormError('');
        setImageFile(null);
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        let finalImageUrl = formData.image_url;

        // 1. Upload image if a new file was selected
        if (imageFile) {
            setIsUploadingImage(true);
            try {
                const uploadData = new FormData();
                // ImgBB requires 'image'
                uploadData.append('image', imageFile);

                // Use the API key provided in the environment variable
                const apiKey = process.env.NEXT_PUBLIC_IMAGE_API_KEY;
                if (!apiKey) {
                    throw new Error("No se encontró la API Key de ImgBB (NEXT_PUBLIC_IMAGE_API_KEY)");
                }

                // ImgBB expects the key in the URL query string
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                    method: 'POST',
                    body: uploadData,
                });

                const result = await response.json();

                // ImgBB specific response structure
                if (result.success && result.data && result.data.url) {
                    finalImageUrl = result.data.url;
                } else {
                    throw new Error("Error alojando la imagen en ImgBB. Detalles: " + (result.error?.message || JSON.stringify(result)));
                }
            } catch (err: any) {
                setFormError("Error subiendo la imagen: " + err.message);
                setIsSubmitting(false);
                setIsUploadingImage(false);
                return;
            }
            setIsUploadingImage(false);
        }

        try {
            const prodData = {
                name: formData.name, description: formData.description, line: formData.line,
                invima_registration: formData.invima_registration, status: formData.status, image_url: finalImageUrl
            };

            let targetId = editingProduct?.id;

            if (targetId) {
                const { error: updateErr } = await supabase.from('products').update(prodData).eq('id', targetId);
                if (updateErr) {
                    setFormError("Error actualizando producto: " + updateErr.message);
                    setIsSubmitting(false);
                    return;
                }
            } else {
                const { data, error } = await supabase.from('products').insert([prodData]).select().single();
                if (error) {
                    setFormError("Error creando producto: " + error.message);
                    setIsSubmitting(false);
                    return;
                }
                targetId = data.id;
            }

            const prices = [
                { product_id: targetId, price_tier: 'CLIENTE_FINAL', price: formData.price_cliente },
                { product_id: targetId, price_tier: 'ACCIONISTA', price: formData.price_accionista },
                { product_id: targetId, price_tier: 'DROGUISTA', price: formData.price_droguista }
            ];

            for (const p of prices) {
                const { error: priceErr } = await supabase.from('product_prices').upsert(p, { onConflict: 'product_id,price_tier' });
                if (priceErr) {
                    console.error("Error upserting price:", priceErr);
                    // It might fail if the constraint doesn't exactly match
                }
            }

            setIsFormOpen(false);
            fetchProducts();
        } catch (err: any) {
            setFormError("Error inesperado: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de eliminar este producto?")) {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
        }
    };

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
                                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Descripción</label>
                                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)' }} />
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
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setImageFile(e.target.files[0]);
                                        }
                                    }}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--glass-border)', backgroundColor: 'white' }}
                                />
                                {formData.image_url && !imageFile && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                        Imagen actual guardada: <a href={formData.image_url} target="_blank" rel="noreferrer" style={{ color: 'var(--trust-blue)' }}>Ver imagen</a>
                                    </p>
                                )}
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
                                {formError && (
                                    <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.9rem' }}>
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
                            ) : productsList.map(p => (
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
