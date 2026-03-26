import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { 
  ShoppingBag, Users, Package, CreditCard, 
  PlusCircle, TrendingUp, TrendingDown, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight,
  Receipt, Star, DollarSign, Eye, LayoutDashboard
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from './PageHeader';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    sales_today: 0,
    sales_yesterday: 0,
    total_customers: 0,
    products_in_stock: 0,
    monthly_expenses: 0,
    monthly_goal: 5000,
    recent_sales: [],
    low_stock_alerts: [],
    weekly_sales: [],
    top_products: [],
    category_sales: []
  });

  useEffect(() => {
    const init = async () => {
      try {
        const response = await api.get('/dashboard/kpis');
        if (response.data) {
          setData(prev => ({ 
            ...prev, 
            sales_today: response.data.sales_today || 0,
            total_customers: response.data.total_customers || 0,
            products_in_stock: response.data.products_in_stock || 0,
            monthly_expenses: response.data.monthly_expenses || 0,
            recent_sales: response.data.recent_sales || [],
            low_stock_alerts: response.data.low_stock_alerts || [],
            weekly_sales: response.data.weekly_sales || [],
            category_sales: response.data.category_sales || []
          }));
        }
      } catch (err) {
        console.error('Error cargando KPIs:', err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const goalProgress = data.monthly_goal > 0 
    ? Math.min((data.sales_today / data.monthly_goal * 100), 100).toFixed(0)
    : 0;

  const weeklyData = data.weekly_sales && data.weekly_sales.length > 0 ? data.weekly_sales : [
    { day: 'Lun', ventas: 0, objetivo: 0 },
    { day: 'Mar', ventas: 0, objetivo: 0 },
    { day: 'Mié', ventas: 0, objetivo: 0 },
    { day: 'Jue', ventas: 0, objetivo: 0 },
    { day: 'Vie', ventas: 0, objetivo: 0 },
    { day: 'Sáb', ventas: 0, objetivo: 0 },
    { day: 'Dom', ventas: 0, objetivo: 0 }
  ];

  const categoryData = data.category_sales && data.category_sales.length > 0 ? data.category_sales : null;

  const StatCard = ({ title, value, change, changeType, icon: Icon, onClick }) => (
    <div 
      className="glass-panel stat-card" 
      style={{ padding: '24px', cursor: onClick ? 'pointer' : 'default', display: 'flex', flexDirection: 'column' }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
        <Icon size={18} style={{ color: 'var(--text-light)', transition: 'color 0.2s' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <h3 className="stat-value">{value}</h3>
      </div>
      {change && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '4px', marginTop: '12px',
          color: changeType === 'up' ? 'var(--success)' : 'var(--danger)',
          fontSize: '12px', fontWeight: '500'
        }}>
          {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{change}% <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>vs ayer</span></span>
        </div>
      )}
    </div>
  );

  const QuickAction = ({ icon: Icon, label, subtitle, color, bgColor, onClick }) => (
    <button 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
        background: 'var(--bg-card)', border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'all 0.2s ease',
        width: '100%', textAlign: 'left'
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ padding: '10px', borderRadius: '10px', background: bgColor, color: color }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{subtitle}</p>
      </div>
      <ChevronRight size={18} style={{ color: 'var(--text-light)' }} />
    </button>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-dim)' }}>Cargando dashboard...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <PageHeader
        icon={<LayoutDashboard size={22} />}
        title="Panel de Control"
        subtitle={`Bienvenido, ${user?.name} • ${new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        actions={
          <button 
            onClick={() => navigate('/ventas')} 
            style={{ 
              padding: '10px 20px', background: 'var(--primary)', border: 'none', 
              color: '#fff', fontWeight: '700', cursor: 'pointer', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)', transition: 'all 0.2s'
            }}
          >
            <PlusCircle size={16} /> Nueva Venta
          </button>
        }
      />

      {data.low_stock_alerts?.length > 0 && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
          background: 'var(--danger-light)', border: '1px solid var(--danger)', 
          borderRadius: 'var(--radius-lg)'
        }}>
          <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--danger)', color: '#fff' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '2px', fontSize: '14px' }}>Alerta de Inventario</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              {data.low_stock_alerts.length} producto{data.low_stock_alerts.length > 1 ? 's' : ''} con stock crítico
            </p>
          </div>
          <button 
            onClick={() => navigate('/inventario')} 
            style={{ 
              padding: '8px 16px', background: 'var(--danger)', border: 'none',
              color: '#fff', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              fontSize: '12px', fontWeight: '600'
            }}
          >
            Revisar
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        <StatCard
          title="Ventas Hoy"
          value={`S/ ${data.sales_today.toFixed(2)}`}
          icon={DollarSign}
          onClick={() => navigate('/ventas')}
        />
        <StatCard
          title="Clientes"
          value={data.total_customers}
          icon={Users}
        />
        <StatCard
          title="Stock Total"
          value={data.products_in_stock}
          icon={Package}
          onClick={() => navigate('/inventario')}
        />
        <StatCard
          title="Gastos del Mes"
          value={`S/ ${data.monthly_expenses.toFixed(2)}`}
          icon={CreditCard}
          onClick={() => navigate('/gastos')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Ventas de la Semana</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Rendimiento vs objetivo diario</p>
              </div>
              <div style={{ 
                padding: '8px 14px', borderRadius: '20px', 
                background: 'var(--primary-glow)', color: 'var(--primary)',
                fontSize: '12px', fontWeight: '600'
              }}>
                Esta semana
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={v => `S/${v}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}
                  formatter={(value) => [`S/ ${value}`, 'Ventas']}
                />
                <Area type="monotone" dataKey="ventas" stroke="var(--primary)" strokeWidth={2} fill="url(#colorVentas)" />
                <Line type="monotone" dataKey="objetivo" stroke="var(--text-light)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Ventas Recientes</h3>
              <button 
                onClick={() => navigate('/ventas')}
                style={{ 
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                Ver todas <ArrowUpRight size={14} />
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_sales.length > 0 ? data.recent_sales.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '600' }}>{s.customer_name || 'Mostrador'}</td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                      {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                        background: s.status === 'completed' ? 'var(--success-light)' : '#FEF9C3',
                        color: s.status === 'completed' ? 'var(--success)' : '#CA8A04'
                      }}>
                        {s.status === 'completed' ? 'Completado' : 'Pendiente'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--primary)' }}>
                      S/ {parseFloat(s.total).toFixed(2)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                      Sin ventas registradas aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Objetivo Mensual</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Progreso</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>{goalProgress}%</span>
              </div>
              <div style={{ height: '12px', background: 'var(--bg-light)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min(goalProgress, 100)}%`, height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
                  borderRadius: '6px', transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div>
                <p style={{ color: 'var(--text-dim)' }}>Actual</p>
                <p style={{ fontWeight: '700' }}>S/ {data.sales_today.toFixed(2)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: 'var(--text-dim)' }}>Objetivo</p>
                <p style={{ fontWeight: '700' }}>S/ {data.monthly_goal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Ventas por Categoría</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={120} height={120}>
                {categoryData ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                ) : (
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '8px solid var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '600' }}>Sin<br/>Ventas</span>
                  </div>
                )}
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categoryData ? categoryData.map((cat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: cat.color }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', flex: 1 }}>{cat.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{cat.percentage}%</span>
                  </div>
                )) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>Sin datos de categorías para mostrar.</span>
                )}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Acciones Rápidas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <QuickAction 
                icon={ShoppingBag} label="Nueva Venta" subtitle="Registrar venta" 
                color="var(--primary)" bgColor="var(--primary-glow)"
                onClick={() => navigate('/ventas')}
              />
              <QuickAction 
                icon={Users} label="Nuevo Cliente" subtitle="Agregar cliente" 
                color="#0891B2" bgColor="#E0F2FE"
                onClick={() => navigate('/clientes')}
              />
              <QuickAction 
                icon={Receipt} label="Registrar Gasto" subtitle="Control de gastos" 
                color="#F59E0B" bgColor="#FEF9C3"
                onClick={() => navigate('/gastos')}
              />
              <QuickAction 
                icon={TrendingUp} label="Ver Reportes" subtitle="Estadísticas" 
                color="#22C55E" bgColor="#DCFCE7"
                onClick={() => navigate('/reportes')}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1280px) {
          div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
