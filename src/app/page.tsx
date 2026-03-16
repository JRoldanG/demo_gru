import {
  ShieldAlert, Droplet, Baby, Activity, ArrowRight, Stethoscope,
  Pill, Syringe, HeartPulse, Brain, Eye, Wind, Leaf
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ContactForm from '@/components/ContactForm';

export default function Home() {
  const products: any[] = [
    {
      id: "linea_oftalmica",
      name: "Línea Oftálmica",
      description: "Norigran y Epritil. Tratamientos estériles de alta calidad para afecciones y cuidado ocular integral, incluyendo gotas oftálmicas medicadas para el alivio de infecciones y lubricación en la mucosa ocular.",
      price: 75000,
      category: "OFTALMICA",
      icon: <Eye size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-8",
      imageUrls: [
        "https://i.ibb.co/XxhT8S7f/P16.png",
        "https://i.ibb.co/1YwPF1Sq/P17.png"
      ]
    },
    {
      id: "linea_cutanea",
      name: "Línea Cutánea",
      description: "Virolips y Acicar-E. Cremas y geles dérmicos formulados para la hidratación, reparación tópica, manejo avanzado de quemaduras cutáneas menores y alivio focalizado de afecciones de la piel.",
      price: 75000,
      category: "CUTANEA",
      icon: <Droplet size={28} style={{ color: "var(--accent-cyan)" }} />,
      colSpanClass: "col-span-4",
      imageUrls: [
        "https://i.ibb.co/67TnwpN6/P9.png",
        "https://i.ibb.co/XrYZr2V1/P18.png"
      ]
    },
    {
      id: "linea_antiparasitarios",
      name: "Línea Antiparasitaria",
      description: "Zecnazol, Furotil y Trimebizol-F. Medicamentos orales en tabletas, cápsulas y suspensión con eficacia clínica garantizada contra infecciones parasitarias, amebiasis e integrales intestinales.",
      price: 75000,
      category: "ANTIPARASITARIOS",
      icon: <ShieldAlert size={28} style={{ color: "var(--trust-blue-light)" }} />,
      colSpanClass: "col-span-4",
      imageUrls: [
        "https://i.ibb.co/0pBRsxWZ/P15.png",
        "https://i.ibb.co/yBGTxVm3/P6.png",
        "https://i.ibb.co/VY2BzYDc/P13.png",
      ]
    },
    {
      id: "linea_analgesica",
      name: "Línea Analgésica",
      description: "Naprogel y Bufedol F. Rápido y efectivo manejo del dolor e inflamación general, focalizado en contusiones, alivio muscular, traumatismos leves y control del dolor osteoarticular sistémico.",
      price: 75000,
      category: "ANALGÉSICA",
      icon: <Activity size={28} style={{ color: "var(--adaptly-5)" }} />,
      colSpanClass: "col-span-4",
      imageUrls: [
        "https://i.ibb.co/CKq1jx16/P14.png",
        "https://i.ibb.co/Q7MfC1qw/P11.png"
      ]
    },
    {
      id: "linea_antibioticos",
      name: "Línea Antibióticos",
      description: "Amoxipen y Endamox. Antibioticoterapia de espectro específico administrable vía oral para erradicar patologías respiratorias o gástricas graves, combatiendo eficientemente cepas bacterianas agresivas.",
      price: 75000,
      category: "ANTIBIOTICOS",
      icon: <Pill size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-4",
      imageUrls: [
        "https://i.ibb.co/R4hKks6R/P5.png",
        "https://i.ibb.co/NdgSYywT/P4.png"
      ]
    },
    {
      id: "linea_antimicoticos",
      name: "Línea Antimicótica",
      description: "Multivex y Tricloben-D. Cremas y lociones de alto rendimiento para el tratamiento erradicatorio de la tiña, candidiasis tópica y control focalizado de afecciones causadas por dermatofitos.",
      price: 75000,
      category: "ANTIMICOTICOS",
      icon: <Syringe size={28} style={{ color: "var(--accent-teal)" }} />,
      colSpanClass: "col-span-6",
      imageUrls: [
         "https://i.ibb.co/SDWxC1Gs/P12.png",
         "https://i.ibb.co/n84KLdZL/P8.png"
      ]
    },
    {
      id: "linea_respiratoria",
      name: "Línea Respiratoria",
      description: "Broncodex Niños, Broncodex Adultos y Beromel. Jarabes y suspensiones con o sin azúcar dedicados al alivio expectorante, control de la tos, descongestión del tracto y cuidado fluido de las vías aéreas.",
      price: 75000,
      category: "RESPIRATORIA",
      icon: <Wind size={28} style={{ color: "var(--trust-blue)" }} />,
      colSpanClass: "col-span-6",
      imageUrls: [
         "https://i.ibb.co/V0nKmCV1/P2.png",
         "https://i.ibb.co/p68y7LL4/P3.png",
         "https://i.ibb.co/VcH8zsBV/P1.png"
      ]
    },
    {
      id: "linea_colagoga",
      name: "Línea Colagoga",
      description: "Bilifor. Farmacoterapia hepática moderna y efectiva, especializada para potenciar el metabolismo, mejorar la fluidez y apoyar de manera persistente la función saludable del hígado y la vesícula biliar.",
      price: 75000,
      category: "COLAGOGA",
      icon: <Leaf size={28} style={{ color: "var(--accent-cyan)" }} />,
      colSpanClass: "col-span-6",
      imageUrls: [
        "https://i.ibb.co/CpJPSkRq/P19.png"
      ]
    },
    {
      id: "linea_circulatoria",
      name: "Línea Circulatoria",
      description: "Venodix. Soporte terapéutico y antivaricoso de vanguardia, diseñado para favorecer profundamente la irrigación, disipar várices, alivianar edemas prolongados y proteger el endotelio circulatorio.",
      price: 75000,
      category: "CIRCULATORIA",
      icon: <HeartPulse size={28} style={{ color: "var(--trust-blue-light)" }} />,
      colSpanClass: "col-span-6",
      imageUrls: [
        "https://i.ibb.co/4RswjFg2/P10.png"
      ]
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
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: "var(--trust-blue)" }}>Nuestras <span className="text-gradient-primary">9 Líneas de Especialidad</span></h2>
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
