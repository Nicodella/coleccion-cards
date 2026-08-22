export function whatsappUrl(telefono: string, text?: string): string {
  const digits = telefono.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  if (!text?.trim()) return base;
  return `${base}?text=${encodeURIComponent(text.trim())}`;
}

export function mensajeConsultaCard(nombre: string, precioLabel: string | null): string {
  const precioPart = precioLabel ? ` (${precioLabel})` : "";
  return `Hola! Me interesa la card "${nombre}"${precioPart}. ¿Sigue disponible?`;
}
