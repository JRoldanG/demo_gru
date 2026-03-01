"use client";

import './globals.css';
import { Beaker, ShoppingBag } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import ShoppingCartDrawer from '@/components/ShoppingCart';

function Navbar() {
  const { itemCount, setIsCartOpen } = useCart();

  return (
    <nav className="glass-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <img src="/logo.png" alt="Gruinfacol S.A. Logo" />
        </div>
        <div className="nav-actions">
          <a href="#" style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)", transition: "color 0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "white"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>Productos</a>
          <button className="cart-trigger" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="cart-badge">{itemCount}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--glass-border)", padding: "var(--space-2xl) 0" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "var(--space-xl)" }}>

        <div>
          <img src="/logo.png" alt="Gruinfacol S.A." style={{ maxWidth: "200px", marginBottom: "var(--space-md)" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Más de 15 años de excelencia e investigación farmacéutica en Colombia. Mejorando la calidad de vida a través de la innovación científica.
          </p>
        </div>

        <div>
          <h4 style={{ color: "var(--trust-blue)", marginBottom: "var(--space-md)", fontSize: "1.1rem" }}>Líneas Destacadas</h4>
          <ul style={{ listStyle: "none", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>Línea Antibióticos</li>
            <li>Línea Nutricional</li>
            <li>Prevención HBP</li>
            <li>Línea Gastroentérica</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: "var(--trust-blue)", marginBottom: "var(--space-md)", fontSize: "1.1rem" }}>Contacto Central</h4>
          <ul style={{ listStyle: "none", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li><strong>Sede Principal:</strong> Bogotá, Colombia</li>
            <li><strong>Email:</strong> info@gruinfacol.com</li>
            <li><strong>Atención Médica:</strong> +57 (601) 000 0000</li>
          </ul>
        </div>

      </div>

      <div className="container" style={{ marginTop: "var(--space-xl)", paddingTop: "var(--space-md)", borderTop: "1px solid var(--glass-border)", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        © {new Date().getFullYear()} Gruinfacol S.A. Todos los derechos reservados.
      </div>
    </footer>
  );
}

// In Next.js App Router, layout.tsx needs html/body tags.
// Since we used 'use client' for the provider, we must wrap it correctly.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <title>Gruinfacol S.A. | Investigación Farmacéutica Colombiana</title>
        <meta name="description" content="Gruinfacol S.A. es una empresa colombiana dedicada a la investigación farmacéutica con más de 15 años de experiencia." />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <ShoppingCartDrawer />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
