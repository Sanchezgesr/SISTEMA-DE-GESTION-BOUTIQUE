import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, Lock, User } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import '../index.css';

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const [shopName, setShopName] = useState('Cargando...');
  const [logoUrl, setLogoUrl] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShopName = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) {
          setShopName(res.data.shop_name || 'BoutiquePro');
          if (res.data.logo) setLogoUrl(res.data.logo);
        } else {
          setShopName('BoutiquePro');
        }
      } catch (err) {
        setShopName('BoutiquePro');
      }
    };
    fetchShopName();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
    } catch (err) {
      const message = err.response?.data?.message || 'Credenciales incorrectas o error de servidor';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'var(--primary-glow)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', background: 'var(--secondary-glow)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

      <form onSubmit={handleSubmit} className="glass-panel" style={{
        width: '100%', maxWidth: '420px', padding: '48px', display: 'flex', flexDirection: 'column', gap: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          {logoUrl ? (
             <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', padding: '16px', margin: '0 auto 24px', display: 'inline-flex', justifyContent: 'center', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.08)' }}>
                <img src={logoUrl} alt="Logo" style={{ maxWidth: '200px', maxHeight: '80px', objectFit: 'contain' }} />
             </div>
          ) : (
            <div style={{ 
              width: '64px', height: '64px', background: 'var(--primary)', color: '#fff', 
              borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', boxShadow: '0 8px 16px -4px var(--primary-glow)'
            }}>
              <ShoppingBag size={32} />
            </div>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', padding: '0 10px', margin: 0 }}>{shopName}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>Accede al panel de administración</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fff1f2', border: '1px solid #fecdd3', color: 'var(--primary)', 
            padding: '12px', borderRadius: '10px', fontSize: '13px', textAlign: 'center', fontWeight: '600' 
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo Electrónico</label>
          <div style={{ position: 'relative' }}>
             <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', opacity: 0.7 }} />
             <input
              type="email"
              placeholder="admin@boutique.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="premium-input"
              style={{ paddingLeft: '48px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contraseña</label>
          <div style={{ position: 'relative' }}>
             <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', opacity: 0.7 }} />
             <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="premium-input"
              style={{ paddingLeft: '48px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '8px', padding: '16px', borderRadius: '14px', border: 'none',
            background: 'var(--primary)',
            color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '16px',
            boxShadow: '0 8px 16px -4px var(--primary-glow)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default Login;
