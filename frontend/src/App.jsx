import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CreditCard, Package, Users, Settings, LogOut, FileText, UserCog } from 'lucide-react';
import { Login, Dashboard, Inventory, Sales, Customers, Expenses, Settings as SettingsView, Reports, UserProfiles } from './components';
import useAuthStore from './store/useAuthStore';
import useSettingsStore from './store/useSettingsStore';
import './index.css';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const { shopName, logoUrl } = useSettingsStore();
  const navigate = useNavigate();

  // Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v': navigate('/ventas'); break;
          case 'i': navigate('/inventario'); break;
          case 'd': navigate('/'); break;
          case 'c': navigate('/clientes'); break;
          case 's': navigate('/settings'); break;
          case 'r': navigate('/reportes'); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-container">
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      
      <aside className="sidebar">
        <div className="logo" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {logoUrl ? (
            <>
              <div style={{ background: '#fff', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                 <img src={logoUrl} alt="Logo" style={{ width: '100%', maxHeight: '50px', objectFit: 'contain' }} />
              </div>
              <div style={{ textAlign: 'center', fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{shopName || 'BoutiquePro'}</div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-glow)', border: '1px solid rgba(157, 23, 77, 0.12)', borderRadius: '12px', padding: '12px 16px' }}>
              <ShoppingBag size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shopName || 'BoutiquePro'}</span>
            </div>
          )}
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <div className="nav-section-title">Menú Principal</div>
          <NavLink to="/" className="nav-link"><LayoutDashboard size={20} /> Dashboard</NavLink>
          <NavLink to="/ventas" className="nav-link"><ShoppingBag size={20} /> Ventas</NavLink>
          <NavLink to="/gastos" className="nav-link"><CreditCard size={20} /> Gastos</NavLink>
          <NavLink to="/inventario" className="nav-link"><Package size={20} /> Inventario</NavLink>
          <NavLink to="/clientes" className="nav-link"><Users size={20} /> Clientes</NavLink>
          <NavLink to="/reportes" className="nav-link"><FileText size={20} /> Reportes</NavLink>

          {user?.role === 'admin' && (
            <>
              <div style={{ height: '1px', background: 'var(--border)', margin: '16px 8px 12px' }} />
              <div className="nav-section-title">Administración</div>
              <NavLink to="/perfiles" className="nav-link"><UserCog size={20} /> Perfiles</NavLink>
              <NavLink to="/settings" className="nav-link"><Settings size={20} /> Configuración</NavLink>
            </>
          )}
          {user?.role !== 'admin' && (
            <NavLink to="/settings" className="nav-link"><Settings size={20} /> Configuración</NavLink>
          )}
        </nav>

        <div className="user-profile-panel">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px', 
            background: 'var(--primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: '800', 
            color: '#fff', 
            boxShadow: '0 4px 12px var(--primary-glow)',
            fontSize: '16px'
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role || 'Admin'}</p>
          </div>
          <LogOut 
            size={20} 
            style={{ cursor: 'pointer', color: 'var(--text-dim)', transition: 'all 0.2s' }} 
            onClick={logout} 
            onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} 
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-dim)'} 
          />
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const { isAuthenticated } = useAuthStore();
  const { fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated, fetchSettings]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
        />
        
        {/* Protected Routes */}
        <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/inventario" element={<Inventory />} />
          <Route path="/clientes" element={<Customers />} />
          <Route path="/reportes" element={<Reports />} />
          <Route path="/perfiles" element={<UserProfiles />} />
          <Route path="/settings" element={<SettingsView />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
