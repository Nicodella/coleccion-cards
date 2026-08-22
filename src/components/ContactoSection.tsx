import type { Perfil } from "@/lib/types";

interface ContactoSectionProps {
  perfil: Perfil | null;
}

function whatsappUrl(telefono: string): string {
  const digits = telefono.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export default function ContactoSection({ perfil }: ContactoSectionProps) {
  if (!perfil) {
    return (
      <div className="section-empty">
        <span aria-hidden="true">📞</span>
        <p>Datos de contacto no configurados todavía.</p>
        <p className="section-empty-hint">Configuralos desde el vestuario.</p>
      </div>
    );
  }

  const waLink = whatsappUrl(perfil.telefono);

  return (
    <section className="contacto-section" aria-label="Contacto">
      <header className="section-header">
        <h2>📞 Contacto</h2>
        <p>Escribime para consultas, intercambios o compras</p>
      </header>

      <div className="contacto-grid">
        <div className="contacto-card contacto-card-main">
          <span className="contacto-icon" aria-hidden="true">
            ⚽
          </span>
          <span className="contacto-rol">Capitán del álbum</span>
          <h3>{perfil.nombre}</h3>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon" aria-hidden="true">
            📍
          </span>
          <span className="contacto-label">Ubicación</span>
          <p>{perfil.direccion}</p>
        </div>

        <div className="contacto-card">
          <span className="contacto-icon" aria-hidden="true">
            📱
          </span>
          <span className="contacto-label">Teléfono</span>
          <a href={`tel:${perfil.telefono}`} className="contacto-link">
            {perfil.telefono}
          </a>
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="contacto-card contacto-whatsapp"
        >
          <span className="contacto-icon" aria-hidden="true">
            💬
          </span>
          <span className="contacto-label">WhatsApp</span>
          <p>Escribime ahora</p>
          <span className="contacto-cta">Abrir chat →</span>
        </a>
      </div>
    </section>
  );
}
