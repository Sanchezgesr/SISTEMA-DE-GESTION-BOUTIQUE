import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Settings as SettingsIcon, Save, Store, Banknote, Percent, Info, Image as ImageIcon, Upload } from 'lucide-react';
import PageHeader from './PageHeader';
import useSettingsStore from '../store/useSettingsStore';

const Settings = ({ onNameChange }) => {
  const [settings, setSettings] = useState({ shop_name: '', currency: '', tax_rate: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const { setShopName, setLogoUrl } = useSettingsStore();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await api.get('/settings');
      setSettings({
        shop_name: data.shop_name || 'BoutiquePro',
        currency: data.currency || 'S/',
        tax_rate: data.tax_rate !== undefined ? data.tax_rate : 18,
        logo: data.logo || ''
      });
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1.5) { // 1.5MB límite
         alert('El archivo es muy pesado. Por favor sube un logo menor a 1.5MB.');
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      setShopName(settings.shop_name);
      setLogoUrl(settings.logo);
      if (onNameChange) onNameChange(settings.shop_name);
      alert('¡Configuración guardada! El sistema ha actualizado los parámetros y el logo.');
    } catch (err) { alert('Error al guardar cambios'); }
  };

  if (loading) return null;

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader
        icon={<SettingsIcon size={22} />}
        title="Configuración de Tienda"
        subtitle="Ajusta los parámetros locales y financieros del establecimiento."
      />
      
      <div className="glass-panel" style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '32px', background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: 'var(--bg-light)', borderRadius: '12px', border: '1px solid var(--border)' }}>
           <Info size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} />
           <div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>Localización Perú Activada</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-dim)', lineHeight: '1.4' }}>El sistema ya cuenta con validación estricta para DNI/RUC en clientes, métodos de pago locales (Yape/Plin), y formatos de fecha en horario es-PE.</p>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><ImageIcon size={14} style={{ opacity: 0.7 }} /> Emblema / Logo de la Boutique</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-light)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--border)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }}>
               {settings.logo ? (
                 <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
               ) : (
                 <Store size={24} style={{ opacity: 0.2 }} />
               )}
            </div>
            <div style={{ flex: 1 }}>
               <input 
                 type="file" accept="image/png, image/jpeg, image/jpg, image/webp" 
                 onChange={handleLogoUpload} id="logo-upload" style={{ display: 'none' }}
               />
               <label htmlFor="logo-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={e=>{e.currentTarget.style.borderColor='var(--text-main)'; e.currentTarget.style.transform='translateY(-1px)'}} onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'}}>
                 <Upload size={16} /> Subir Imagen...
               </label>
               <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'var(--text-dim)' }}>Formatos recomendados: PNG o JPG con fondo transparente (Máx 1.5MB).</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={14} style={{ opacity: 0.7 }} /> Nombre Comercial de la Boutique</label>
          <input 
            value={settings.shop_name} 
            onChange={e => setSettings({...settings, shop_name: e.target.value})}
            className="premium-input"
            style={{ fontSize: '16px', padding: '14px', fontWeight: '500' }}
            placeholder="Ej. Boutique Alta Costura"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><Banknote size={14} style={{ opacity: 0.7 }} /> Moneda o Divisa Local</label>
            <input 
              value={settings.currency} 
              onChange={e => setSettings({...settings, currency: e.target.value})}
              className="premium-input"
              style={{ fontSize: '15px' }}
              placeholder="Ej. S/ o PEN"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}><Percent size={14} style={{ opacity: 0.7 }} /> Tasa de Impuesto (IGV %)</label>
            <input 
              type="number"
              value={settings.tax_rate} 
              onChange={e => setSettings({...settings, tax_rate: e.target.value})}
              className="premium-input"
              style={{ fontSize: '15px' }}
              placeholder="18"
            />
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
           <button 
             onClick={handleSave}
             style={{ 
               padding: '16px 32px', background: 'var(--text-main)', color: '#fff', 
               border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', display: 'flex', 
               alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer',
               transition: 'all 0.2s', fontSize: '14px', boxShadow: 'var(--shadow-sm)'
             }}
             onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
             onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}
           >
             <Save size={18} /> Aplicar Configuraciones
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
