import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, Plus, Search, Edit, Trash2, 
  Mail, Phone, MapPin, X, Building, User
} from 'lucide-react';
import PageHeader from './PageHeader';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', document_type: 'DNI', document_number: '',
    email: '', phone: '', address: ''
  });

  const fetchData = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.document_type === 'DNI' && formData.document_number.length !== 8) {
      return alert('El DNI debe tener exactamente 8 dígitos numéricos.');
    }
    if (formData.document_type === 'RUC' && formData.document_number.length !== 11) {
      return alert('El RUC debe tener exactamente 11 dígitos numéricos.');
    }

    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) { alert('Error al guardar cliente'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente de tu directorio?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchData();
    } catch (err) { alert('Error al eliminar'); }
  };

  const handleDniLookup = async () => {
    if (formData.document_number.length !== 8) return alert('DNI debe tener 8 dígitos');
    try {
      const { data: res } = await api.get(`/customers/consultar/${formData.document_number}`);
      if (res.data) setFormData({ ...formData, name: res.data.name });
    } catch (err) { alert('Error en consulta DNI. Intente manualmente o verifique conectividad.'); }
  };

  const handleRucLookup = async () => {
    if (formData.document_number.length !== 11) return alert('RUC debe tener 11 dígitos');
    try {
      const { data: res } = await api.get(`/customers/consultar/ruc/${formData.document_number}`);
      if (res.data) setFormData({ ...formData, name: res.data.name, address: res.data.address || '' });
    } catch (err) { alert('Error en consulta RUC. Intente manualmente o verifique conectividad.'); }
  };

  const handleDocumentChange = (e) => {
    // Filtrar solo números
    const value = e.target.value.replace(/\D/g, '');
    let maxLength = 15;
    if (formData.document_type === 'DNI') maxLength = 8;
    if (formData.document_type === 'RUC') maxLength = 11;
    
    if (value.length <= maxLength) {
      setFormData({ ...formData, document_number: value });
    }
  };

  const handlePhoneChange = (e) => {
    // Filtrar solo números, longitud máxima usual en Perú: 9 dígitos para celular, 7 p/ fijo
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 15) {
      setFormData({ ...formData, phone: value });
    }
  };

  const handleTypeChange = (e) => {
    // Reset document number if changing type so it doesn't get stuck with invalid length
    setFormData({ ...formData, document_type: e.target.value, document_number: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader
        icon={<Users size={22} />}
        title="Directorio de Clientes"
        subtitle="Gestiona la base de datos y fidelización de tu boutique"
        actions={
          <button
            onClick={() => { setEditing(null); setFormData({ name: '', document_type: 'DNI', document_number: '', email: '', phone: '', address: '' }); setShowForm(true); }}
            style={{ 
              padding: '12px 24px', background: 'var(--primary)', border: 'none', 
              color: '#fff', fontWeight: '500', cursor: 'pointer', borderRadius: 'var(--radius-md)', 
              display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
              transition: 'all 0.2s ease', boxShadow: 'var(--shadow-sm)' 
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Plus size={18} /> Nuevo Cliente
          </button>
        }
      />

      <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-light)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Cliente / Razón Social</th>
              <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Documento</th>
              <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Contacto</th>
              <th style={{ padding: '20px 24px', textAlign: 'right', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: 'var(--bg-light)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-main)'
                    }}>
                      {c.document_type === 'RUC' ? <Building size={18} /> : <User size={18} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-dim)', fontSize: '12px', marginTop: '6px' }}>
                        <MapPin size={12} /> {c.address || 'Sin dirección registrada'}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ 
                      fontSize: '10px', background: 'var(--bg-light)', color: 'var(--text-dim)', 
                      padding: '4px 8px', borderRadius: '4px', fontWeight: '600', border: '1px solid var(--border)', letterSpacing: '0.5px' 
                    }}>
                      {c.document_type}
                    </span>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }} className="tabular-nums">{c.document_number}</span>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)' }}><Mail size={14} style={{ opacity: 0.7 }} /> {c.email || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)' }}><Phone size={14} style={{ opacity: 0.7 }} /> <span className="tabular-nums">{c.phone || '—'}</span></div>
                   </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setEditing(c); setFormData(c); setShowForm(true); }} 
                      style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-light)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }}
                       onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                      <Edit size={14} /> Editar
                    </button>
                    <button onClick={() => handleDelete(c.id)} 
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-light)', border: '1px solid #fecaca', color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e=>e.currentTarget.style.borderColor='var(--danger)'} onMouseOut={e=>e.currentTarget.style.borderColor='#fecaca'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <form className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', background: 'var(--bg-card)' }} onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{editing ? 'Editar Perfil de Cliente' : 'Nuevo Registro de Cliente'}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '6px' }}>{editing ? 'Modifica la información de contacto y facturación.' : 'Registra un comprador para emitir boletas o facturas.'}</p>
               </div>
               <button type="button" onClick={() => setShowForm(false)} style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--border)'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-light)'}>
                 <X size={18} />
               </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Tipo Doc.</label>
                <select value={formData.document_type} onChange={handleTypeChange} className="premium-input">
                  <option value="DNI">DNI</option>
                  <option value="RUC">RUC</option>
                  <option value="OTRO">C.E. / OTRO</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                  Nro. Documento
                  {formData.document_type === 'DNI' && <span style={{ color: 'var(--primary)', marginLeft: '4px' }}>(8 dígitos)</span>}
                  {formData.document_type === 'RUC' && <span style={{ color: 'var(--primary)', marginLeft: '4px' }}>(11 dígitos)</span>}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text"
                    value={formData.document_number} 
                    onChange={handleDocumentChange} 
                    className="premium-input tabular-nums" 
                    style={{ flex: 1 }} 
                    placeholder={formData.document_type === 'DNI' ? '8 dígitos numéricos' : formData.document_type === 'RUC' ? '11 dígitos numéricos' : ''}
                    required 
                  />
                  {(formData.document_type === 'DNI' || formData.document_type === 'RUC') && (
                    <button type="button" onClick={formData.document_type === 'DNI' ? handleDniLookup : handleRucLookup} title="Consultar Identidad / SUNAT" style={{ padding: '0 20px', background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                      <Search size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>NOMBRE O RAZÓN SOCIAL</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="premium-input" placeholder="Ej. Juan Pérez / Empresa S.A.C." required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>CORREO ELECTRÓNICO (Opcional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="premium-input" placeholder="correo@ejemplo.com" />
               </div>
               <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>TELÉFONO O CELULAR</label>
                  <input type="text" value={formData.phone} onChange={handlePhoneChange} className="premium-input tabular-nums" placeholder="Solo números" />
               </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>DIRECCIÓN O DOMICILIO FISCAL (Opcional)</label>
              <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="premium-input" placeholder="Dirección para la boleta o factura" style={{ minHeight: '80px', resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowForm(false)} 
                style={{ flex: 1, padding: '16px', background: 'var(--bg-light)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-dim)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                Cancelar
              </button>
              <button type="submit" 
                style={{ flex: 1, padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.background='var(--primary-light)'}} onMouseOut={(e) => { e.target.style.background='var(--primary)'}}>
                {editing ? 'Guardar Cambios' : 'Registrar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Customers;
