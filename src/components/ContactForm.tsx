"use client";

import React, { useState } from 'react';
import { Send, User, Mail, MessageSquare } from 'lucide-react';

export default function ContactForm() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");
        // Simulate network request
        setTimeout(() => {
            setStatus("success");
            // Reset form after seeing success message
            setTimeout(() => setStatus("idle"), 3000);
        }, 1200);
    };

    return (
        <div className="glass-panel" style={{ padding: "var(--space-xl)", maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: "var(--space-lg)" }}>
                <h3 style={{ fontSize: "1.75rem", color: "var(--trust-blue)", marginBottom: "0.5rem" }}>Contáctenos</h3>
                <p style={{ color: "var(--text-secondary)" }}>¿Desea más información sobre nuestras líneas o representarnos médicamente? Escríbanos.</p>
            </div>

            {status === "success" ? (
                <div style={{ textAlign: "center", padding: "var(--space-lg)", background: "rgba(0, 140, 69, 0.1)", borderRadius: "var(--radius-md)", color: "var(--accent-teal)" }}>
                    <div style={{ display: "inline-flex", background: "white", padding: "1rem", borderRadius: "50%", marginBottom: "1rem", boxShadow: "var(--shadow-sm)" }}>
                        <Send size={32} />
                    </div>
                    <h4 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>¡Mensaje Enviado!</h4>
                    <p>Un asesor médico se pondrá en contacto pronto.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                    <div className="input-group" style={{ position: "relative" }}>
                        <User size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            placeholder="Nombre Completo / Institución"
                            required
                            style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "white", fontFamily: "inherit", fontSize: "0.95rem" }}
                        />
                    </div>

                    <div className="input-group" style={{ position: "relative" }}>
                        <Mail size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            required
                            style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "white", fontFamily: "inherit", fontSize: "0.95rem" }}
                        />
                    </div>

                    <div className="input-group" style={{ position: "relative" }}>
                        <MessageSquare size={18} style={{ position: "absolute", left: "1rem", top: "1rem", color: "var(--text-muted)" }} />
                        <textarea
                            placeholder="¿Cómo podemos ayudarle?"
                            rows={4}
                            required
                            style={{ width: "100%", padding: "0.85rem 1rem 0.85rem 2.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--glass-border)", background: "white", fontFamily: "inherit", fontSize: "0.95rem", resize: "vertical" }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="button-primary"
                        disabled={status === "submitting"}
                        style={{ width: "100%", marginTop: "var(--space-sm)", opacity: status === "submitting" ? 0.7 : 1 }}
                    >
                        {status === "submitting" ? "Enviando..." : (
                            <>Enviar Mensaje <Send size={18} /></>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
