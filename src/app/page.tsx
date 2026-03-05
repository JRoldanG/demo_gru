import {
  ShieldAlert, Droplet, Baby, Activity, ArrowRight, Stethoscope,
  Pill, Syringe, HeartPulse, Brain, Eye, Wind, Leaf
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ContactForm from '@/components/ContactForm';

export default function Home() {
  const products = [
    {
      id: "linea_1",
      name: "Línea Antibióticos",
      description: "Angifal (Azitromicina 500 mg), Diclomax, Epritil y Norigran. Tratamiento de infecciones del tracto urinario, respiratorio y sistémico.",
      price: 45000,
      category: "Infecciosas",
      icon: <Pill size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-8",
      imageUrl: "/assets/gruinfacol_hero_bg_1772251475738.png"
    },
    {
      id: "linea_2",
      name: "Línea Antimicóticos",
      description: "Medicamentos especializados para el tratamiento efectivo de infecciones por hongos.",
      price: 38000,
      category: "Dermatológica",
      icon: <Droplet size={28} style={{ color: "var(--accent-cyan)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_3",
      name: "Antiparasitarios",
      description: "Productos para el control y tratamiento de parásitos intestinales y amebas.",
      price: 25000,
      category: "Gastroentérica",
      icon: <ShieldAlert size={28} style={{ color: "var(--trust-blue-light)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_4",
      name: "Respiratoria & Antialérgica",
      description: "Incluye Broncodex Niños (jarabe sabor uva). Manejo de enfermedades respiratorias, alergias y gripe.",
      price: 32000,
      category: "Respiratoria",
      icon: <Wind size={28} style={{ color: "var(--accent-teal)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_5",
      name: "Analgésica & Antiinflamatoria",
      description: "Diclodol, Inoxicam (COX-2), Ambatcol y Bufedol. Alivio potente del dolor e inflamación.",
      price: 55000,
      category: "Alivio del Dolor",
      icon: <Activity size={28} style={{ color: "var(--adaptly-5)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_6",
      name: "Línea Circulatoria",
      description: "Venodix (Castaño de Indias). Indicado como fleboterápico, antivaricoso y manejo de edemas periféricos.",
      price: 68000,
      category: "Cardiovascular",
      icon: <HeartPulse size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-6"
    },
    {
      id: "linea_7",
      name: "Protectores Hepáticos",
      description: "Línea Colagoga y Colerética. Medicamentos para el funcionamiento y protección de vesícula biliar e hígado.",
      price: 72000,
      category: "Gastroentérica",
      icon: <Leaf size={28} style={{ color: "var(--accent-teal)" }} />,
      colSpanClass: "col-span-6"
    },
    {
      id: "linea_8",
      name: "Línea Gastroentérica",
      description: "Gasoprol (Lansoprazol 30mg) y Gastelvin (Caléndula). Tratamiento avanzado de úlceras y problemas digestivos.",
      price: 65000,
      category: "Gastroentérica",
      icon: <Syringe size={28} style={{ color: "var(--trust-blue-light)" }} />,
      colSpanClass: "col-span-8",
      imageUrl: "/assets/product_prost_bg_1772251487940.png"
    },
    {
      id: "linea_9",
      name: "Coadyuvante de Peso",
      description: "Productos de apoyo clínico para el control metabólico y reducción del peso corporal.",
      price: 110000,
      category: "Metabolismo",
      icon: <Activity size={28} style={{ color: "var(--accent-cyan)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_10",
      name: "Prevención HBP",
      description: "Hipoprost. Dirigida a la prevención biomédica y manejo de problemas de hipertrofia prostática.",
      price: 125000,
      category: "Urológica",
      icon: <Stethoscope size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_11",
      name: "Línea Nutricional",
      description: "Promevit Cerb, Promevit JR, G-Lac, Glucarnit e Isomel. Suplementos clave para cada etapa.",
      price: 85000,
      category: "Nutrición",
      icon: <Brain size={28} style={{ color: "var(--adaptly-5)" }} />,
      colSpanClass: "col-span-8",
      imageUrl: "/assets/product_nutri_bg_1772251498672.png"
    },
    {
      id: "linea_12",
      name: "Línea Oftálmica",
      description: "Productos oftalmológicos estériles para el cuidado y tratamiento de diversas afecciones oculares.",
      price: 45000,
      category: "Cuidado Ocular",
      icon: <Eye size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_13",
      name: "Fórmulas Infantiles",
      description: "Fórmulas éticas de nutrición especializada para garantizar el óptimo desarrollo de bebés y niños.",
      price: 75000,
      category: "Pediátrica",
      icon: <Baby size={28} style={{ color: "var(--accent-teal)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_14",
      name: "Belleza e Higiene",
      description: "Intibath y complementos. Higiene íntima y cuidado personal con los más altos estándares.",
      price: 42000,
      category: "Cuidado Personal",
      icon: <Droplet size={28} style={{ color: "var(--accent-cyan)" }} />,
      colSpanClass: "col-span-4"
    },
    {
      id: "linea_15",
      name: "Línea Dermatológica",
      description: "Dermocosmética farmacéutica y tratamientos especializados para el cuidado intensivo de afecciones de la piel.",
      price: 88000,
      category: "Dermatología",
      icon: <ShieldAlert size={28} style={{ color: "var(--trust-blue-light)" }} />,
      colSpanClass: "col-span-12"
    }
  ];

  return (
    <main>
      <div className="bg-medical-grid"></div>

      <section
        className="section"
        style={{
          paddingTop: 'calc(var(--space-3xl) * 1.5)',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: 'var(--space-2xl)'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: "900px" }}>
          <h1 className="kinetic-header">
            Más de 27 Años de<br />
            <span className="text-gradient-primary">Investigación Farmacéutica.</span>
          </h1>
          <p className="text-sub" style={{ margin: 'var(--space-lg) auto', color: "var(--text-primary)", fontSize: "1.1rem", maxWidth: "100%" }}>
            <strong>Gruinfacol S.A.</strong> es una empresa colombiana dedicada a la investigación farmacéutica. Combinamos el rigor científico con la excelencia de manufactura para llevar salud, calidad de vida y confianza a miles de especialistas y pacientes en toda la región.
          </p>
          <a href="/products" style={{ textDecoration: 'none' }}>
            <button className="button-primary" style={{ animation: 'slideUp 1s ease 0.3s forwards', opacity: 0, transform: 'translateY(30px)' }}>
              Ver Productos <ArrowRight size={18} />
            </button>
          </a>
        </div>
      </section>

      <section className="container section" style={{ paddingTop: 0 }}>
        <div style={{ marginBottom: "var(--space-xl)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--trust-blue)" }}>Nuestras <span className="text-gradient-primary">15 Líneas de Especialidad</span></h2>
            <p style={{ color: "var(--text-secondary)" }}>Adquiere nuestros desarrollos exclusivos directamente en nuestra plataforma digital.</p>
          </div>
        </div>

        <div className="bento-grid">
          {products.map((prod) => (
            <ProductCard
              key={prod.id}
              product={{
                id: prod.id,
                name: prod.name,
                description: prod.description,
                price: prod.price,
                category: prod.category
              }}
              icon={prod.icon}
              colSpanClass={prod.colSpanClass}
              imageUrl={prod.imageUrl}
              showCartAndPrice={false}
            />
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="section" style={{ backgroundColor: "var(--bg-color)" }}>
        <div className="container">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
