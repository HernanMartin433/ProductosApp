import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useProductos } from './hooks/useProductos';
import { productosApi } from './services/api';

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const IconPlus    = () => <Icon path="M12 5v14M5 12h14" />;
const IconEdit    = () => <Icon path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />;
const IconTrash   = () => <Icon path="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />;
const IconEye     = () => <Icon path="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const IconX       = () => <Icon path="M18 6L6 18M6 6l12 12" />;
const IconBox     = () => <Icon path="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />;
const IconHistory = () => <Icon path="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3" />;

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="overlay" onClick={e => e.target.classList.contains('overlay') && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn-icon" onClick={onClose}><IconX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── PRODUCT FORM ─────────────────────────────────────────────────────────────
const EMPTY_FORM = { nombre: '', descripcion: '', precio: '', stock: '', activo: true };

function ProductoForm({ initial, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((er) => ({ ...er, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    else if (form.nombre.length > 150) e.nombre = 'Máximo 150 caracteres';
    if (form.descripcion && form.descripcion.length > 500) e.descripcion = 'Máximo 500 caracteres';
    const precio = parseFloat(form.precio);
    if (!form.precio && form.precio !== 0) e.precio = 'El precio es obligatorio';
    else if (isNaN(precio) || precio < 0) e.precio = 'Precio inválido';
    const stock = parseInt(form.stock);
    if (!form.stock && form.stock !== 0) e.stock = 'El stock es obligatorio';
    else if (isNaN(stock) || stock < 0) e.stock = 'Stock inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
      activo: form.activo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label>Nombre *</label>
        <input value={form.nombre} onChange={set('nombre')} placeholder="Nombre del producto" />
        {errors.nombre && <span className="field-error">{errors.nombre}</span>}
      </div>
      <div className="field">
        <label>Descripción</label>
        <textarea value={form.descripcion || ''} onChange={set('descripcion')} placeholder="Descripción opcional" rows={3} />
        {errors.descripcion && <span className="field-error">{errors.descripcion}</span>}
      </div>
      <div className="form-row">
        <div className="field">
          <label>Precio *</label>
          <input type="number" step="0.01" min="0" value={form.precio} onChange={set('precio')} placeholder="0.00" />
          {errors.precio && <span className="field-error">{errors.precio}</span>}
        </div>
        <div className="field">
          <label>Stock *</label>
          <input type="number" min="0" value={form.stock} onChange={set('stock')} placeholder="0" />
          {errors.stock && <span className="field-error">{errors.stock}</span>}
        </div>
      </div>
      {initial && (
        <div className="field field-check">
          <label className="check-label">
            <input type="checkbox" checked={form.activo} onChange={set('activo')} />
            <span>Producto activo</span>
          </label>
        </div>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {initial ? 'Guardar cambios' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetalleProd({ producto, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    productosApi.getLogs(producto.id)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoadingLogs(false));
  }, [producto.id]);

  return (
    <Modal title="Detalle de Producto" onClose={onClose}>
      <div className="detail">
        <div className="detail-hero">
          <div className="detail-icon"><IconBox size={32} /></div>
          <div>
            <h3 className="detail-nombre">{producto.nombre}</h3>
            <span className={`badge ${producto.activo ? 'badge-active' : 'badge-inactive'}`}>
              {producto.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        {producto.descripcion && <p className="detail-desc">{producto.descripcion}</p>}
        <div className="detail-grid">
          <div className="detail-stat">
            <span className="stat-label">Precio</span>
            <span className="stat-value price">${producto.precio.toFixed(2)}</span>
          </div>
          <div className="detail-stat">
            <span className="stat-label">Stock</span>
            <span className="stat-value">{producto.stock} u.</span>
          </div>
          <div className="detail-stat">
            <span className="stat-label">ID</span>
            <span className="stat-value mono">#{producto.id}</span>
          </div>
          <div className="detail-stat">
            <span className="stat-label">Creado</span>
            <span className="stat-value mono">{new Date(producto.fechaCreacion).toLocaleDateString('es-AR')}</span>
          </div>
        </div>

        <div className="logs-section">
          <div className="logs-header">
            <IconHistory />
            <span>Historial de cambios (MongoDB)</span>
          </div>
          {loadingLogs ? (
            <div className="logs-loading"><span className="spinner" /> Cargando logs…</div>
          ) : logs.length === 0 ? (
            <p className="logs-empty">Sin historial registrado</p>
          ) : (
            <ul className="logs-list">
              {logs.map((l) => (
                <li key={l.id} className="log-item">
                  <span className={`log-accion ${l.accion.toLowerCase()}`}>{l.accion}</span>
                  <span className="log-detalle">{l.detalle}</span>
                  <span className="log-ts">{new Date(l.timestamp).toLocaleString('es-AR')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function Confirm({ msg, onConfirm, onCancel }) {
  return (
    <Modal title="Confirmar acción" onClose={onCancel}>
      <div className="confirm">
        <p>{msg}</p>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="card skeleton-card">
      <div className="skel skel-title" />
      <div className="skel skel-text" />
      <div className="skel skel-text short" />
    </div>
  ));
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────
function ProductoCard({ p, onEdit, onDelete, onView }) {
  return (
    <article className="card">
      <div className="card-top">
        <div>
          <span className="card-id mono">#{p.id}</span>
          <h3 className="card-nombre">{p.nombre}</h3>
        </div>
        <span className={`badge ${p.activo ? 'badge-active' : 'badge-inactive'}`}>
          {p.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      {p.descripcion && <p className="card-desc">{p.descripcion}</p>}
      <div className="card-stats">
        <div className="card-stat">
          <span className="stat-label">Precio</span>
          <span className="stat-value price">${p.precio.toFixed(2)}</span>
        </div>
        <div className="card-stat">
          <span className="stat-label">Stock</span>
          <span className={`stat-value ${p.stock === 0 ? 'out-of-stock' : ''}`}>{p.stock} u.</span>
        </div>
        <div className="card-stat">
          <span className="stat-label">Creado</span>
          <span className="stat-value mono">{new Date(p.fechaCreacion).toLocaleDateString('es-AR')}</span>
        </div>
      </div>
      <div className="card-actions">
        <button className="btn-icon-sm" title="Ver detalle" onClick={() => onView(p)}><IconEye /></button>
        <button className="btn-icon-sm" title="Editar" onClick={() => onEdit(p)}><IconEdit /></button>
        <button className="btn-icon-sm danger" title="Eliminar" onClick={() => onDelete(p)}><IconTrash /></button>
      </div>
    </article>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { productos, loading, error, fetchAll, create, update, remove } = useProductos();
  const [soloActivos, setSoloActivos] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'detail' | 'confirm'
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchAll(soloActivos); }, [soloActivos]);

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.descripcion || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (dto) => {
    setSubmitting(true);
    try {
      await create(dto);
      toast.success('Producto creado exitosamente');
      setModal(null);
    } catch (e) {
      toast.error(e.message);
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (dto) => {
    setSubmitting(true);
    try {
      await update(selected.id, dto);
      toast.success('Producto actualizado');
      setModal(null);
    } catch (e) {
      toast.error(e.message);
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      await remove(selected.id);
      toast.success('Producto eliminado');
    } catch (e) {
      toast.error(e.message);
    }
    setModal(null);
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Mono, monospace', fontSize: 13 } }} />

      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-mark"><IconBox size={22} /></div>
            <div>
              <div className="logo-name">Inventario</div>
              <div className="logo-sub">v1.0</div>
            </div>
          </div>

          <nav className="nav">
            <button className="nav-item active">
              <IconBox size={16} /> Productos
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="footer-info">
              <div className="footer-stack">SQL Server + MongoDB</div>
              <div className="footer-tech">.NET 8 · React 18</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <header className="page-header">
            <div>
              <h1 className="page-title">Productos</h1>
              <p className="page-sub">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <button className="btn btn-primary" onClick={() => setModal('create')}>
              <IconPlus /> Nuevo producto
            </button>
          </header>

          {/* TOOLBAR */}
          <div className="toolbar">
            <input
              className="search"
              placeholder="Buscar por nombre o descripción…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <label className="toggle-label">
              <input type="checkbox" checked={soloActivos} onChange={e => setSoloActivos(e.target.checked)} />
              Solo activos
            </label>
          </div>

          {/* ERROR */}
          {error && (
            <div className="alert-error">
              <strong>Error:</strong> {error}
              <button onClick={() => fetchAll(soloActivos)} className="retry-btn">Reintentar</button>
            </div>
          )}

          {/* GRID */}
          <div className="grid">
            {loading ? <Skeleton /> : filtered.length === 0 ? (
              <div className="empty">
                <IconBox size={48} />
                <p>No se encontraron productos</p>
              </div>
            ) : filtered.map(p => (
              <ProductoCard
                key={p.id} p={p}
                onEdit={p => { setSelected(p); setModal('edit'); }}
                onDelete={p => { setSelected(p); setModal('confirm'); }}
                onView={p => { setSelected(p); setModal('detail'); }}
              />
            ))}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {modal === 'create' && (
        <Modal title="Nuevo Producto" onClose={() => setModal(null)}>
          <ProductoForm onSubmit={handleCreate} onClose={() => setModal(null)} loading={submitting} />
        </Modal>
      )}
      {modal === 'edit' && selected && (
        <Modal title="Editar Producto" onClose={() => setModal(null)}>
          <ProductoForm
            initial={{ nombre: selected.nombre, descripcion: selected.descripcion || '', precio: selected.precio, stock: selected.stock, activo: selected.activo }}
            onSubmit={handleUpdate} onClose={() => setModal(null)} loading={submitting}
          />
        </Modal>
      )}
      {modal === 'detail' && selected && (
        <DetalleProd producto={selected} onClose={() => setModal(null)} />
      )}
      {modal === 'confirm' && selected && (
        <Confirm
          msg={`¿Eliminar "${selected.nombre}"? Esta acción es reversible pero ocultará el producto del listado.`}
          onConfirm={handleDelete} onCancel={() => setModal(null)}
        />
      )}
    </>
  );
}
