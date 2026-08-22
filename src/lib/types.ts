export interface Perfil {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Foto {
  id: string;
  url: string;
  orden: number;
}

export interface Item {
  id: string;
  nombre: string;
  descripcion: string;
  en_venta: boolean;
  precio: number | null;
  cantidad_venta: number;
  fotos: Foto[];
}

export interface CategoriaColores {
  color_accent: string;
  color_border: string;
  color_badge_bg: string;
  color_badge_text: string;
  emoji: string;
}

export interface Categoria extends CategoriaColores {
  id: string;
  nombre: string;
  items: Item[];
}

export interface CategoriaSimple extends CategoriaColores {
  id: string;
  nombre: string;
}

export interface ItemAdmin extends Item {
  categoria_id: string;
  categoria_ids: string[];
  categoria_nombre: string;
}
