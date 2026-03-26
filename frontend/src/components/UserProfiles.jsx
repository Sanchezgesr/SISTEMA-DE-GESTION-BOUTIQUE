import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import {
  Users, Plus, Edit, Trash2, X, ShieldCheck, Shield, Eye, EyeOff, KeyRound
} from 'lucide-react';
import PageHeader from './PageHeader';

const ROLES = [
  { value: 'admin', label: 'Administrador', icon: ShieldCheck, color: 'var(--primary)', desc: 'Acceso total al sistema' },
  { value: 'seller', label: 'Personal / Vendedor', icon: Shield, color: 'var(--text-main)', desc: 'Acceso a ventas e inventario' }
];

const emptyForm = { name: '', email: '', password: '', role: 'seller' };

const UserProfiles = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Block non-admins from seeing this
  if (currentUser?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px', opacity: 0.6 }}>
        <ShieldCheck size={48} color="var(--text-main)" />
        <h2 style={{ fontSize: '24px', fontWeight: '500', color: 'var(--text-main)' }}>Acceso restringido</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: '15px' }}>Solo los administradores pueden gestionar perfiles.</p>
      </div>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowPassword(false);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setFormData({ name: u.name, email: u.email, password: '', role: u.role });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (u.id === currentUser.id) return alert('No puedes eliminar tu propia cuenta');
    if (!window.confirm(`¿Seguro que deseas eliminar la cuenta de "${u.name}"? Esta acción es irreversible.`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar');
    }
  };

  const getRoleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <PageHeader
        icon={<Users size={22} />}
        title="Gestión de Perfiles"
        subtitle="Crea y administra las cuentas de acceso del sistema"
        actions={
          <button
            onClick={openCreate}
            style={{
              padding: '12px 24px', background: 'var(--primary)', border: 'none',
              color: '#fff', fontWeight: '500', cursor: 'pointer', borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
              transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Plus size={18} /> Nuevo Usuario
          </button>
        }
      />

      {/* Roles Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {ROLES.map(r => (
          <div key={r.value} className="glass-panel" style={{
            padding: '24px', display: 'flex', alignItems: 'center', gap: '20px',
            background: 'var(--bg-card)', border: '1px solid var(--border)'
          }}>
            <div style={{ padding: '14px', borderRadius: '50%', background: 'var(--bg-light)', color: r.color, border: '1px solid var(--border)' }}>
              <r.icon size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--text-main)' }}>{r.label}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>{r.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', opacity: 0.5, color: 'var(--text-dim)', fontSize: '15px' }}>
            Cargando perfiles...
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Usuario</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Correo</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Rol / Nivel</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Registro</th>
                <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleInfo = getRoleInfo(u.role);
                const isSelf = u.id === currentUser.id;
                return (
                   <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                          background: 'var(--bg-light)', border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: '500', fontSize: '16px', color: 'var(--text-main)'
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)' }}>{u.name}</div>
                          {isSelf && <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', marginTop: '4px', letterSpacing: '0.05em' }}>● SESIÓN ACTUAL</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '14px' }}>{u.email}</td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                        background: u.role === 'admin' ? 'var(--primary-glow)' : 'var(--bg-light)', 
                        color: u.role === 'admin' ? 'var(--primary)' : 'var(--text-main)',
                        border: `1px solid ${u.role === 'admin' ? 'var(--primary-light)' : 'var(--border)'}`
                      }}>
                        <roleInfo.icon size={14} />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '13px' }} className="tabular-nums">
                      {new Date(u.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                     <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                         <button onClick={() => openEdit(u)} style={{
                           padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-light)',
                           border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer',
                           display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500',
                           transition: 'all 0.2s'
                         }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                           <Edit size={14} /> Editar
                         </button>
                         {!isSelf && (
                           <button onClick={() => handleDelete(u)} style={{
                             padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                             background: 'var(--danger-light)', border: '1px solid #fecaca',
                             color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                             transition: 'all 0.2s'
                           }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--danger)'} onMouseOut={e=>e.currentTarget.style.borderColor='#fecaca'}>
                             <Trash2 size={16} />
                           </button>
                         )}
                       </div>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
       {showForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <form className="glass-panel" style={{
            width: '100%', maxWidth: '480px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', 
            background: 'var(--bg-card)'
          }} onSubmit={handleSubmit}>
            {/* Form Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                  {editing ? 'Editar Perfil de Usuario' : 'Nuevo Perfil de Usuario'}
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '6px' }}>
                  {editing ? 'Modifica los datos de acceso o el nivel de permisos.' : 'Registra un nuevo integrante en el sistema.'}
                </p>
              </div>
               <button type="button" onClick={() => setShowForm(false)}
                style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.background='var(--border)'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-light)'}>
                <X size={18} />
              </button>
            </div>

            {/* Role Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nivel de Acceso</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {ROLES.map(r => (
                  <button key={r.value} type="button" onClick={() => setFormData({ ...formData, role: r.value })}
                    style={{
                      flex: 1, padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid',
                      borderColor: formData.role === r.value ? 'var(--text-main)' : 'var(--glass-border)',
                      background: formData.role === r.value ? 'var(--bg-light)' : 'transparent',
                      color: formData.role === r.value ? 'var(--text-main)' : 'var(--text-dim)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      transition: 'all 0.2s ease'
                    }}>
                    <r.icon size={22} style={{ color: formData.role === r.value ? r.color : 'var(--text-dim)' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre completo</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="premium-input" style={{ marginTop: '8px' }}
                  placeholder="Ej. María García"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Correo electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="premium-input" style={{ marginTop: '8px' }}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <KeyRound size={12} />
                  {editing ? 'Nueva contraseña (opcional)' : 'Contraseña de acceso'}
                </label>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="premium-input"
                    style={{ paddingRight: '48px' }}
                    placeholder={editing ? 'Dejar vacío para mantener' : 'Mínimo 4 caracteres'}
                    required={!editing}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
             <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: '16px', background: 'var(--bg-light)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-dim)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                style={{
                  flex: 1, padding: '16px', background: 'var(--primary)',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '500', opacity: saving ? 0.7 : 1, transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { if(!saving) e.target.style.background='var(--primary-light)'}}
                onMouseOut={(e) => { if(!saving) e.target.style.background='var(--primary)'}}>
                {saving ? 'Guardando...' : editing ? 'Actualizar Perfil' : 'Crear Perfil'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfiles;
