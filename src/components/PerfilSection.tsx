import type { Perfil } from "@/lib/types";

interface PerfilSectionProps {
  perfil: Perfil;
}

export default function PerfilSection({ perfil }: PerfilSectionProps) {
  return (
    <section className="perfil" aria-label="Perfil del coleccionista">
      <div className="perfil-badge" aria-hidden="true">
        ⚽
      </div>
      <div className="perfil-info">
        <span className="perfil-rol">Capitán del álbum</span>
        <h2>{perfil.nombre}</h2>
        <div className="perfil-datos">
          <div className="perfil-item">
            <span className="perfil-icon" aria-hidden="true">
              📍
            </span>
            <span>{perfil.direccion}</span>
          </div>
          <div className="perfil-item">
            <span className="perfil-icon" aria-hidden="true">
              📞
            </span>
            <a href={`tel:${perfil.telefono}`} className="perfil-link">
              {perfil.telefono}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
