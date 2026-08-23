"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_COLORES,
  suggestColores,
  themeStyle,
  type CategoriaColores,
} from "@/lib/categoryTheme";
import type { CategoriaSimple, ItemAdmin } from "@/lib/types";
import styles from "./admin.module.css";

type CategoriaForm = CategoriaColores & { nombre: string };

const FORM_VACIO: CategoriaForm = {
  nombre: "",
  ...DEFAULT_COLORES,
};

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null);
  const [loginStep, setLoginStep] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [totpEnrolled, setTotpEnrolled] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [mensajeEsError, setMensajeEsError] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [catForm, setCatForm] = useState<CategoriaForm>(FORM_VACIO);

  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);
  const [items, setItems] = useState<ItemAdmin[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroDescripcion, setFiltroDescripcion] = useState("");
  const [paginaItems, setPaginaItems] = useState(1);
  const [visitasStats, setVisitasStats] = useState<{
    visitantes: number;
    porSeccion: { seccion: string; visitas: number; ips: number }[];
  } | null>(null);

  const [itemForm, setItemForm] = useState({
    categoria_ids: [] as string[],
    nombre: "",
    descripcion: "",
    en_venta: false,
    precio: "",
    cantidad_venta: "1",
  });
  const [fotos, setFotos] = useState<FileList | null>(null);

  const verificarSesion = useCallback(async () => {
    const res = await fetch("/api/admin/session");
    const data = await res.json();
    setAutenticado(data.authenticated);
  }, []);

  const cargarCategorias = useCallback(async () => {
    const res = await fetch("/api/categorias");
    if (res.ok) {
      const data = await res.json();
      setCategorias(data);
    } else {
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        setMensaje(data.error);
        setMensajeEsError(true);
      }
    }
  }, []);

  const cargarItems = useCallback(async () => {
    const res = await fetch("/api/items");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setItems([]);
      if (data.error) {
        setMensaje(data.error);
        setMensajeEsError(true);
      }
    }
  }, []);

  const cargarVisitas = useCallback(async () => {
    const res = await fetch("/api/admin/visitas");
    if (res.ok) {
      const data = await res.json();
      setVisitasStats({
        visitantes: data.visitantes ?? 0,
        porSeccion: data.porSeccion ?? [],
      });
    }
  }, []);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  useEffect(() => {
    if (loginStep !== "otp") return;

    let cancelled = false;
    setTotpEnrolled(null);
    setTotpSecret("");
    setTotpUri("");

    (async () => {
      const res = await fetch("/api/admin/totp-setup");
      if (cancelled) return;
      if (!res.ok) {
        setTotpEnrolled(false);
        return;
      }
      const data = await res.json();
      const enrolled = Boolean(data.enrolled);
      setTotpEnrolled(enrolled);
      if (!enrolled) {
        setTotpSecret(data.secret ?? "");
        setTotpUri(data.uri ?? "");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loginStep]);

  useEffect(() => {
    if (autenticado) {
      cargarCategorias();
      cargarItems();
      cargarVisitas();
    }
  }, [autenticado, cargarCategorias, cargarItems, cargarVisitas]);

  function mostrarMensaje(texto: string, esError = false) {
    setMensaje(texto);
    setMensajeEsError(esError);
  }

  function resetCatForm() {
    setEditandoId(null);
    setCatForm(FORM_VACIO);
  }

  function aplicarSugerencia(nombre: string) {
    const sugerido = suggestColores(nombre);
    setCatForm((prev) => ({ ...prev, nombre, ...sugerido }));
  }

  function iniciarEdicion(cat: CategoriaSimple) {
    setEditandoId(cat.id);
    setCatForm({
      nombre: cat.nombre,
      color_accent: cat.color_accent,
      color_border: cat.color_border,
      color_badge_bg: cat.color_badge_bg,
      color_badge_text: cat.color_badge_text,
      emoji: cat.emoji,
    });
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok && data.requiresOtp) {
      setLoginStep("otp");
      setPassword("");
      setOtp("");
      setTotpEnrolled(null);
      setTotpSecret("");
      setTotpUri("");
      return;
    }

    if (res.ok) {
      setAutenticado(true);
      setPassword("");
    } else {
      setError(data.error ?? "Contraseña incorrecta — probá de nuevo, capitán");
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: otp }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (res.ok) {
      setAutenticado(true);
      setOtp("");
      setLoginStep("password");
    } else {
      setError(data.error ?? "Código incorrecto");
    }
  }

  function volverAPassword() {
    setLoginStep("password");
    setOtp("");
    setError("");
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAutenticado(false);
    setMensaje("");
    resetCatForm();
    resetItemForm();
  }

  async function handleGuardarCategoria(e: FormEvent) {
    e.preventDefault();
    mostrarMensaje("");
    setLoading(true);

    const res = editandoId
      ? await fetch(`/api/categorias/${editandoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        })
      : await fetch("/api/categorias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });

    setLoading(false);

    if (res.ok) {
      const eraEdicion = Boolean(editandoId);
      resetCatForm();
      mostrarMensaje(eraEdicion ? "✅ Categoría actualizada" : "⚽ Categoría creada");
      cargarCategorias();
    } else {
      const data = await res.json();
      mostrarMensaje(data.error ?? "Error al guardar categoría", true);
    }
  }

  async function handleEliminarCategoria(id: string, nombre: string) {
    if (
      !window.confirm(
        `¿Eliminar "${nombre}"? Se borran también todas sus cards.`
      )
    ) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/categorias/${id}`, { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      if (editandoId === id) resetCatForm();
      mostrarMensaje("🗑️ Categoría eliminada");
      cargarCategorias();
    } else {
      const data = await res.json();
      mostrarMensaje(data.error ?? "Error al eliminar", true);
    }
  }

  function resetItemForm() {
    setEditandoItemId(null);
    setItemForm({
      categoria_ids: [],
      nombre: "",
      descripcion: "",
      en_venta: false,
      precio: "",
      cantidad_venta: "1",
    });
    setFotos(null);
    const input = document.getElementById("fotos-input") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  function iniciarEdicionItem(item: ItemAdmin) {
    setEditandoItemId(item.id);
    setItemForm({
      categoria_ids:
        item.categoria_ids?.length > 0
          ? item.categoria_ids
          : item.categoria_id
            ? [item.categoria_id]
            : [],
      nombre: item.nombre,
      descripcion: item.descripcion,
      en_venta: item.en_venta,
      precio: item.precio != null ? String(item.precio) : "",
      cantidad_venta: String(item.cantidad_venta > 0 ? item.cantidad_venta : 1),
    });
    setFotos(null);
    const input = document.getElementById("fotos-input") as HTMLInputElement | null;
    if (input) input.value = "";
    mostrarMensaje("");
    requestAnimationFrame(() => {
      document
        .getElementById("item-form-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleCategoriaItem(catId: string) {
    setItemForm((prev) => {
      const has = prev.categoria_ids.includes(catId);
      return {
        ...prev,
        categoria_ids: has
          ? prev.categoria_ids.filter((id) => id !== catId)
          : [...prev.categoria_ids, catId],
      };
    });
  }

  async function handleGuardarItem(e: FormEvent) {
    e.preventDefault();
    mostrarMensaje("");

    if (itemForm.categoria_ids.length === 0) {
      mostrarMensaje("Seleccioná al menos una categoría", true);
      return;
    }

    const esEdicion = Boolean(editandoItemId);

    if (!esEdicion && (!fotos || fotos.length === 0)) {
      mostrarMensaje("Subí al menos una foto", true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    itemForm.categoria_ids.forEach((id) => formData.append("categoria_ids", id));
    formData.append("nombre", itemForm.nombre);
    formData.append("descripcion", itemForm.descripcion);
    formData.append("en_venta", String(itemForm.en_venta));
    formData.append("precio", itemForm.en_venta ? itemForm.precio : "");
    formData.append(
      "cantidad_venta",
      itemForm.en_venta ? itemForm.cantidad_venta : "0"
    );

    if (fotos) {
      Array.from(fotos).forEach((file) => {
        formData.append("fotos", file);
      });
    }

    const res = esEdicion
      ? await fetch(`/api/items/${editandoItemId}`, { method: "PATCH", body: formData })
      : await fetch("/api/items", { method: "POST", body: formData });

    setLoading(false);

    if (res.ok) {
      resetItemForm();
      mostrarMensaje(esEdicion ? "✅ Card actualizada" : "🏆 Card agregada al álbum");
      cargarItems();
    } else {
      const data = await res.json();
      mostrarMensaje(data.error ?? "Error al guardar card", true);
    }
  }

  async function handleEliminarItem(id: string, nombre: string) {
    if (!window.confirm(`¿Eliminar la card "${nombre}"?`)) {
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    setLoading(false);

    if (res.ok) {
      if (editandoItemId === id) resetItemForm();
      mostrarMensaje("🗑️ Card eliminada");
      cargarItems();
    } else {
      const data = await res.json();
      mostrarMensaje(data.error ?? "Error al eliminar", true);
    }
  }

  const PAGE_SIZE = 10;

  const itemsFiltrados = items.filter((item) => {
    if (
      filtroCategoria &&
      !(item.categoria_ids?.includes(filtroCategoria) || item.categoria_id === filtroCategoria)
    ) {
      return false;
    }
    const qNombre = filtroNombre.trim().toLowerCase();
    if (qNombre && !item.nombre.toLowerCase().includes(qNombre)) {
      return false;
    }
    const qDesc = filtroDescripcion.trim().toLowerCase();
    if (qDesc && !(item.descripcion ?? "").toLowerCase().includes(qDesc)) {
      return false;
    }
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(itemsFiltrados.length / PAGE_SIZE));
  const paginaActual = Math.min(paginaItems, totalPaginas);
  const itemsPagina = itemsFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  useEffect(() => {
    setPaginaItems(1);
  }, [filtroCategoria, filtroNombre, filtroDescripcion]);

  if (autenticado === null) {
    return <p className={styles.loading}>⚽ Entrando al vestuario...</p>;
  }

  if (!autenticado) {
    return (
      <div className={styles.loginPage}>
        {loginStep === "password" ? (
          <form className={styles.loginForm} onSubmit={handleLogin}>
            <span className={styles.loginBadge}>🔐 ACCESO RESTRINGIDO</span>
            <h1>Vestuario</h1>
            <p>Ingresá la contraseña para administrar tu álbum</p>
            <input
              type="password"
              placeholder="Contraseña del DT"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </button>
            <Link href="/" className={styles.backLink}>
              ← Volver a la cancha
            </Link>
          </form>
        ) : (
          <form className={styles.loginForm} onSubmit={handleVerifyOtp}>
            <span className={styles.loginBadge}>📱 DOBLE FACTOR</span>
            <h1>Código de Authy</h1>
            {totpEnrolled === false && (
              <>
                <p>
                  Primera vez: escaneá el QR con Authy. Después de este login, el QR ya no se
                  muestra más.
                </p>
                {totpSecret && (
                  <div className={styles.totpSetup}>
                    {totpUri && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className={styles.totpQr}
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(totpUri)}`}
                        alt="QR para Authy"
                        width={160}
                        height={160}
                      />
                    )}
                    <code className={styles.totpSecret}>{totpSecret}</code>
                    <p className={styles.totpHint}>
                      Nombre: <strong>Vestuario</strong> · Tipo: basada en tiempo
                    </p>
                  </div>
                )}
              </>
            )}
            {totpEnrolled === true && (
              <p>Ingresá el código de 6 dígitos de tu app Authy.</p>
            )}
            {totpEnrolled === null && (
              <p className={styles.totpHint}>Verificando 2FA…</p>
            )}
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" disabled={loading || otp.length !== 6}>
              {loading ? "Verificando..." : "⚽ Entrar al vestuario"}
            </button>
            <button
              type="button"
              className={styles.btnLink}
              onClick={volverAPassword}
            >
              ← Usar otra contraseña
            </button>
            <Link href="/" className={styles.backLink}>
              Volver a la cancha
            </Link>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.adminPage}>
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerBadge}>⚽ PANEL DEL DT</span>
            <h1>Vestuario — Rodrigo</h1>
          </div>
          <div className={styles.headerActions}>
            <Link href="/">Ver cancha</Link>
            <button type="button" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </header>

        {mensaje && (
          <p className={mensajeEsError ? styles.mensajeError : styles.mensaje}>
            {mensaje}
          </p>
        )}

        {visitasStats && (
          <section className={styles.section}>
            <h2>👀 Visitas</h2>
            <p className={styles.sectionHint}>
              Visitantes únicos (IPs distintas). No se cuentan tus visitas si
              estás logueado en el vestuario. Cada IP cuenta 1 vez por sección
              por día.
            </p>
            <p className={styles.visitasTotal}>
              <strong>{visitasStats.visitantes}</strong>{" "}
              {visitasStats.visitantes === 1 ? "visitante" : "visitantes"} únicos
            </p>
            {visitasStats.porSeccion.length > 0 ? (
              <ul className={styles.visitasList}>
                {visitasStats.porSeccion.map((row) => {
                  const label = row.seccion.startsWith("cat-")
                    ? categorias.find((c) => c.id === row.seccion.slice(4))
                        ?.nombre ?? row.seccion
                    : row.seccion;
                  return (
                    <li key={row.seccion} className={styles.visitasRow}>
                      <span className={styles.visitasSeccion}>{label}</span>
                      <span className={styles.visitasMeta}>
                        {row.ips} {row.ips === 1 ? "IP" : "IPs"} · {row.visitas}{" "}
                        {row.visitas === 1 ? "día" : "días"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.sectionHint}>Todavía no hay visitas registradas.</p>
            )}
          </section>
        )}

        <section className={styles.section}>
          <h2>📋 Colecciones</h2>
          <p className={styles.sectionHint}>
            Creá, editá o eliminá categorías. Asigná colores y emoji para cada
            una.
          </p>

          {categorias.length > 0 && (
            <ul className={styles.categoriaList}>
              {categorias.map((cat) => (
                <li key={cat.id} className={styles.categoriaItem}>
                  <span
                    className={styles.categoriaChip}
                    style={{
                      ...themeStyle(cat),
                      background: cat.color_badge_bg,
                      color: cat.color_badge_text,
                      borderColor: cat.color_border,
                    }}
                  >
                    {cat.emoji} {cat.nombre}
                  </span>
                  <div className={styles.categoriaActions}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => iniciarEdicion(cat)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={() => handleEliminarCategoria(cat.id, cat.nombre)}
                      disabled={loading}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className={styles.form} onSubmit={handleGuardarCategoria}>
            <h3 className={styles.formSubtitle}>
              {editandoId ? "Editar categoría" : "Nueva categoría"}
            </h3>

            <div className={styles.formRow}>
              <label>
                Nombre
                <input
                  type="text"
                  placeholder="Peñarol, Roma..."
                  value={catForm.nombre}
                  onChange={(e) => {
                    const nombre = e.target.value;
                    setCatForm((prev) => ({ ...prev, nombre }));
                  }}
                  onBlur={() => {
                    if (!editandoId && catForm.nombre.trim()) {
                      aplicarSugerencia(catForm.nombre);
                    }
                  }}
                  required
                />
              </label>
              <label>
                Emoji
                <input
                  type="text"
                  maxLength={8}
                  value={catForm.emoji}
                  onChange={(e) =>
                    setCatForm({ ...catForm, emoji: e.target.value })
                  }
                />
              </label>
            </div>

            <div className={styles.colorGrid}>
              <label>
                Color acento
                <input
                  type="color"
                  value={catForm.color_accent}
                  onChange={(e) =>
                    setCatForm({ ...catForm, color_accent: e.target.value })
                  }
                />
              </label>
              <label>
                Color borde
                <input
                  type="color"
                  value={catForm.color_border}
                  onChange={(e) =>
                    setCatForm({ ...catForm, color_border: e.target.value })
                  }
                />
              </label>
              <label>
                Fondo badge
                <input
                  type="color"
                  value={catForm.color_badge_bg}
                  onChange={(e) =>
                    setCatForm({ ...catForm, color_badge_bg: e.target.value })
                  }
                />
              </label>
              <label>
                Texto badge
                <input
                  type="color"
                  value={catForm.color_badge_text}
                  onChange={(e) =>
                    setCatForm({ ...catForm, color_badge_text: e.target.value })
                  }
                />
              </label>
            </div>

            <div
              className={styles.colorPreview}
              style={themeStyle(catForm)}
            >
              <span
                className={styles.previewBadge}
                style={{
                  background: catForm.color_badge_bg,
                  color: catForm.color_badge_text,
                  borderColor: catForm.color_border,
                }}
              >
                {catForm.emoji || "⚽"}{" "}
                {catForm.nombre || "Vista previa"}
              </span>
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={loading}>
                {editandoId ? "Guardar cambios" : "Crear categoría"}
              </button>
              {editandoId && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={resetCatForm}
                >
                  Cancelar
                </button>
              )}
              {!editandoId && catForm.nombre && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => aplicarSugerencia(catForm.nombre)}
                >
                  Sugerir colores
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={styles.section} id="item-form-section">
          <h2>{editandoItemId ? "✏️ Editar card" : "➕ Agregar card"}</h2>
          <p className={styles.sectionHint}>
            {editandoItemId
              ? "Modificá los datos y guardá. Las fotos son opcionales (si no subís nuevas, se mantienen)."
              : "Cargá una card nueva al álbum. Después podés editarla desde la lista de abajo."}
          </p>

          <form id="item-form" className={styles.formGrid} onSubmit={handleGuardarItem}>
            <fieldset className={`${styles.catCheckGroup} ${styles.fullWidth}`}>
              <legend>Categorías (una o más)</legend>
              <div className={styles.catCheckList}>
                {categorias.map((cat) => (
                  <label key={cat.id} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={itemForm.categoria_ids.includes(cat.id)}
                      onChange={() => toggleCategoriaItem(cat.id)}
                    />
                    <span>
                      {cat.emoji} {cat.nombre}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label>
              Nombre
              <input
                type="text"
                value={itemForm.nombre}
                onChange={(e) =>
                  setItemForm({ ...itemForm, nombre: e.target.value })
                }
                required
              />
            </label>

            <label className={styles.fullWidth}>
              Descripción
              <textarea
                value={itemForm.descripcion}
                onChange={(e) =>
                  setItemForm({ ...itemForm, descripcion: e.target.value })
                }
                rows={3}
              />
            </label>

            <label className={`${styles.checkRow} ${styles.fullWidth}`}>
              <input
                type="checkbox"
                checked={itemForm.en_venta}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    en_venta: e.target.checked,
                    precio: e.target.checked ? itemForm.precio : "",
                    cantidad_venta: e.target.checked
                      ? itemForm.cantidad_venta || "1"
                      : "0",
                  })
                }
              />
              <span>Disponible para venta</span>
            </label>

            {itemForm.en_venta && (
              <>
                <label>
                  Precio ($)
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="ej. 500"
                    value={itemForm.precio}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, precio: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Cantidad de repetidas
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={itemForm.cantidad_venta}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        cantidad_venta: e.target.value,
                      })
                    }
                    required
                  />
                </label>
              </>
            )}

            <label className={styles.fullWidth}>
              Fotos {editandoItemId ? "(opcional — reemplaza las actuales)" : "(una o más)"}
              <input
                id="fotos-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFotos(e.target.files)}
                required={!editandoItemId}
              />
            </label>

            {editandoItemId && (
              <div className={`${styles.fotosActuales} ${styles.fullWidth}`}>
                {items
                  .find((i) => i.id === editandoItemId)
                  ?.fotos.map((foto) => (
                    <img key={foto.id} src={foto.url} alt="" />
                  ))}
              </div>
            )}

            <div className={styles.fullWidth}>
              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading
                  ? "Guardando..."
                  : editandoItemId
                    ? "Guardar cambios"
                    : "⚽ Agregar al álbum"}
              </button>
              {editandoItemId && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={resetItemForm}
                  style={{ marginTop: "0.5rem" }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className={styles.section}>
          <h2>🃏 Cards del álbum</h2>
          <p className={styles.sectionHint}>
            Listado paginado (10 por página). Usá los filtros para encontrar una
            card y editarla o eliminarla.
          </p>

          {items.length > 0 && (
            <div className={styles.filtrosBar}>
              <label>
                Categoría
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nombre
                <input
                  type="search"
                  placeholder="Buscar por nombre…"
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                />
              </label>
              <label>
                Descripción
                <input
                  type="search"
                  placeholder="Buscar en descripción…"
                  value={filtroDescripcion}
                  onChange={(e) => setFiltroDescripcion(e.target.value)}
                />
              </label>
              {(filtroCategoria || filtroNombre || filtroDescripcion) && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setFiltroCategoria("");
                    setFiltroNombre("");
                    setFiltroDescripcion("");
                  }}
                >
                  Limpiar
                </button>
              )}
            </div>
          )}

          {items.length > 0 ? (
            itemsFiltrados.length > 0 ? (
              <>
                <p className={styles.paginacionMeta}>
                  Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}–
                  {Math.min(paginaActual * PAGE_SIZE, itemsFiltrados.length)} de{" "}
                  {itemsFiltrados.length}
                </p>
                <ul className={styles.itemList}>
                  {itemsPagina.map((item) => {
                    const preview = item.fotos[0]?.url;
                    return (
                      <li key={item.id} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                          {preview ? (
                            <img
                              src={preview}
                              alt=""
                              className={styles.itemThumb}
                            />
                          ) : (
                            <span className={styles.itemThumbEmpty}>🃏</span>
                          )}
                          <div>
                            <strong>{item.nombre}</strong>
                            <span className={styles.itemMeta}>
                              {item.categoria_nombre}
                              {item.en_venta && item.precio != null
                                ? ` · $ ${item.precio} · ${item.cantidad_venta} disp.`
                                : " · Colección"}
                            </span>
                          </div>
                        </div>
                        <div className={styles.categoriaActions}>
                          <button
                            type="button"
                            className={styles.btnSecondary}
                            onClick={() => iniciarEdicionItem(item)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={styles.btnDanger}
                            onClick={() =>
                              handleEliminarItem(item.id, item.nombre)
                            }
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {totalPaginas > 1 && (
                  <div className={styles.paginacion}>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      disabled={paginaActual <= 1}
                      onClick={() => setPaginaItems((p) => Math.max(1, p - 1))}
                    >
                      ← Anterior
                    </button>
                    <span className={styles.paginacionInfo}>
                      Página {paginaActual} / {totalPaginas}
                    </span>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      disabled={paginaActual >= totalPaginas}
                      onClick={() =>
                        setPaginaItems((p) => Math.min(totalPaginas, p + 1))
                      }
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className={styles.sectionHint}>
                Ninguna card coincide con los filtros.
              </p>
            )
          ) : (
            <p className={styles.sectionHint}>Todavía no hay cards cargadas.</p>
          )}
        </section>
      </div>
    </div>
  );
}
