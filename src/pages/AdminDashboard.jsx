/**
 * Brújula Futura — Panel de Administración
 * Dashboard visual con KPIs, gráficos de telemetría y gestión de usuarios.
 * Solo accesible para usuarios con rol "Administrador".
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from 'recharts';
import {
  Shield, Users, CheckCircle2, TrendingUp, BookOpen,
  Building2, RefreshCw, GraduationCap, Target, AlertCircle,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnimatedPage from '../components/AnimatedPage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const AREA_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, delay }) {
  return (
    <motion.div
      className="admin-kpi-card"
      style={{ '--kpi-color': color }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, boxShadow: `0 20px 40px ${color}33` }}
    >
      <div className="admin-kpi-icon">
        <Icon size={24} />
      </div>
      <div className="admin-kpi-content">
        <span className="admin-kpi-label">{label}</span>
        <span className="admin-kpi-value">{value}</span>
        {sub && <span className="admin-kpi-sub">{sub}</span>}
      </div>
    </motion.div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="admin-chart-tooltip">
        <p className="admin-tooltip-label">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#7c3aed' }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Estado vacío con datos de demo ────────────────────────────────────────────
const DEMO_STATS = {
  kpis: {
    total_usuarios: 0,
    tests_iniciados: 0,
    tests_completados: 0,
    tasa_finalizacion: 0
  },
  top_carreras: [],
  top_universidades: [],
  distribucion_areas: []
};

// ── Panel Principal ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('metricas');
  const [sortField, setSortField] = useState('fecha_creacion');
  const [sortDir, setSortDir] = useState('desc');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
      setStats(DEMO_STATS);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setUsersList(data);
    } catch (e) {
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  const sortedUsers = [...usersList].sort((a, b) => {
    const va = a[sortField] || '';
    const vb = b[sortField] || '';
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  // Formatear fecha
  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const kpis = stats?.kpis || DEMO_STATS.kpis;

  return (
    <AnimatedPage>
      <section className="admin-section">

        {/* ── Header ── */}
        <motion.div
          className="admin-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="admin-header-left">
            <div className="admin-header-icon">
              <Shield size={28} />
            </div>
            <div>
              <h1>Panel de <span className="accent">Administración</span></h1>
              <p className="admin-header-sub">
                Bienvenido, {user?.nombres?.split(' ')[0]}. Centro de control de Brújula Futura.
              </p>
            </div>
          </div>
          <motion.button
            className="admin-refresh-btn"
            onClick={() => { fetchStats(); fetchUsers(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
          >
            <RefreshCw size={16} />
            Actualizar
          </motion.button>
        </motion.div>

        {/* ── Error Banner ── */}
        {error && (
          <motion.div className="admin-error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertCircle size={18} />
            <span>No hay suficientes eventos de telemetría aún. Los gráficos se irán llenando a medida que los usuarios interactúen con la plataforma.</span>
          </motion.div>
        )}

        {/* ── KPI Cards ── */}
        <div className="admin-kpi-grid">
          <KpiCard icon={Users}       label="Usuarios Registrados"  value={loading ? '...' : kpis.total_usuarios}        sub="Total en la plataforma"        color="#7c3aed" delay={0.05} />
          <KpiCard icon={Target}      label="Tests Iniciados"        value={loading ? '...' : kpis.tests_iniciados}       sub="Sesiones de test abiertas"    color="#06b6d4" delay={0.1} />
          <KpiCard icon={CheckCircle2}label="Tests Completados"      value={loading ? '...' : kpis.tests_completados}     sub="Test finalizados con éxito"   color="#10b981" delay={0.15} />
          <KpiCard icon={TrendingUp}  label="Tasa de Finalización"   value={loading ? '...' : `${kpis.tasa_finalizacion}%`} sub="Completados / Iniciados"  color="#f59e0b" delay={0.2} />
        </div>

        {/* ── Tabs ── */}
        <motion.div className="admin-tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          {[
            { id: 'metricas',  label: 'Métricas de Uso',    icon: <TrendingUp size={16} /> },
            { id: 'usuarios',  label: 'Gestión de Usuarios', icon: <Users size={16} /> },
          ].map(t => (
            <motion.button
              key={t.id}
              className={`admin-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {t.icon} {t.label}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── MÉTRICAS ── */}
          {activeTab === 'metricas' && (
            <motion.div
              key="metricas"
              className="admin-charts-grid"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Carreras Más Exploradas */}
              <div className="admin-chart-card admin-chart-wide">
                <div className="admin-chart-header">
                  <BookOpen size={20} className="admin-chart-icon" />
                  <h3>Carreras más exploradas</h3>
                </div>
                {(stats?.top_carreras || []).length === 0 ? (
                  <div className="admin-chart-empty">
                    <GraduationCap size={40} />
                    <p>Aún no hay datos. Los eventos se registrarán cuando los usuarios exploren carreras.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.top_carreras} margin={{ left: -10, right: 10, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#9896b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: '#9896b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="visitas" name="Visitas" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Distribución RIASEC */}
              <div className="admin-chart-card">
                <div className="admin-chart-header">
                  <Target size={20} className="admin-chart-icon" />
                  <h3>Distribución por Área RIASEC</h3>
                </div>
                {(stats?.distribucion_areas || []).length === 0 ? (
                  <div className="admin-chart-empty">
                    <Target size={40} />
                    <p>Sin datos RIASEC aún. Aparecerán al completar tests.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={stats.distribucion_areas}
                        cx="50%" cy="50%"
                        outerRadius={90}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                      >
                        {(stats.distribucion_areas).map((_, i) => (
                          <Cell key={`cell-${i}`} fill={AREA_COLORS[i % AREA_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#9896b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Universidades Más Visitadas */}
              <div className="admin-chart-card">
                <div className="admin-chart-header">
                  <Building2 size={20} className="admin-chart-icon" />
                  <h3>Universidades más visitadas</h3>
                </div>
                {(stats?.top_universidades || []).length === 0 ? (
                  <div className="admin-chart-empty">
                    <Building2 size={40} />
                    <p>Sin clics de universidades aún.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.top_universidades} layout="vertical" margin={{ left: 10, right: 30, top: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" tick={{ fill: '#9896b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" width={130} tick={{ fill: '#9896b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="clics" name="Clics" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          )}

          {/* ── USUARIOS ── */}
          {activeTab === 'usuarios' && (
            <motion.div
              key="usuarios"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="admin-users-card">
                <div className="admin-chart-header">
                  <Users size={20} className="admin-chart-icon" />
                  <h3>Usuarios registrados <span className="admin-users-count">({usersList.length})</span></h3>
                </div>
                {usersLoading ? (
                  <div className="admin-chart-empty"><RefreshCw size={30} className="spin-icon" /><p>Cargando usuarios...</p></div>
                ) : usersList.length === 0 ? (
                  <div className="admin-chart-empty"><Users size={40} /><p>No hay usuarios registrados aún.</p></div>
                ) : (
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th className="admin-th sortable" onClick={() => handleSort('nombres')}>
                            Nombre <SortIcon field="nombres" />
                          </th>
                          <th className="admin-th sortable" onClick={() => handleSort('correo')}>
                            Correo <SortIcon field="correo" />
                          </th>
                          <th className="admin-th">Rol</th>
                          <th className="admin-th sortable" onClick={() => handleSort('fecha_creacion')}>
                            Registro <SortIcon field="fecha_creacion" />
                          </th>
                          <th className="admin-th">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedUsers.map((u, i) => (
                          <motion.tr
                            key={u.id_usuario}
                            className="admin-tr"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td className="admin-td admin-td-name">{u.nombres || '—'}</td>
                            <td className="admin-td admin-td-email">{u.correo}</td>
                            <td className="admin-td">
                              <span className={`admin-role-badge ${u.rol === 'Administrador' ? 'admin-role-adm' : 'admin-role-est'}`}>
                                {u.rol}
                              </span>
                            </td>
                            <td className="admin-td admin-td-date">{fmtDate(u.fecha_creacion)}</td>
                            <td className="admin-td">
                              <span className={`admin-status-badge ${u.estado === 'ACT' ? 'admin-status-act' : 'admin-status-ina'}`}>
                                {u.estado === 'ACT' ? '● Activo' : '● Inactivo'}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </AnimatedPage>
  );
}
