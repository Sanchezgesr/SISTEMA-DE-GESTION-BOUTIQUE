import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, TrendingUp, Edit, Trash2, X, 
  Printer, CheckCircle, Search, Calendar, 
  Filter, Download, ChevronRight, AlertCircle
} from 'lucide-react';
import PageHeader from './PageHeader';

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSale, setEditingSale] = useState(null);
  const [shopInfo, setShopInfo] = useState({ shop_name: 'Boutique Premium' });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      const [salesRes, custRes, settingsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/customers'),
        api.get('/settings')
      ]);
      setSales(salesRes.data);
      setCustomers(custRes.data);
      if (settingsRes.data) setShopInfo(settingsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sales/${editingSale.id}`, {
        customer_id: editingSale.customer_id,
        payment_method: editingSale.payment_method,
        status: editingSale.status
      });
      setEditingSale(null);
      fetchData();
    } catch (err) { alert('Error al actualizar'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta venta? El stock será devuelto al inventario.')) return;
    try {
      await api.delete(`/sales/${id}`);
      fetchData();
    } catch (err) { alert('Error al eliminar'); }
  };

  const handleReprint = async (saleId) => {
    try {
      const { data } = await api.get(`/sales/${saleId}`);
      const win = window.open('', '', 'height=600,width=400');
      win.document.write('<html><head><title>Reimpresión Boleta</title>');
      win.document.write('<style>body { font-family: monospace; width: 80mm; padding: 5mm; color: #000; } hr { border: 1px dashed #000; } .text-center { text-align: center; } .flex { display: flex; justify-content: space-between; }</style>');
      win.document.write('</head><body>');
      
      win.document.write(`
        <div class="text-center">
          <h2 style="margin:0">${shopInfo.shop_name}</h2>
          <p style="font-size:12px">REIMPRESIÓN DE BOLETA</p>
          <p style="font-size:11px">Boleta N° ${data.id.toString().padStart(6, '0')}</p>
          <hr/>
        </div>
        <div style="font-size:11px; margin:10px 0">
          <p>FECHA: ${new Date(data.created_at).toLocaleString()}</p>
          <p>CLIENTE: ${data.customer_name || 'Público General'}</p>
        </div>
        <hr/>
        <table style="width:100%; font-size:11px; border-collapse:collapse">
          <thead><tr><th align="left">ART</th><th align="center">CANT</th><th align="right">TOTAL</th></tr></thead>
          <tbody>
            ${data.details.map(item => `
              <tr>
                <td>${item.product_name} (${item.size})</td>
                <td align="center">${item.quantity}</td>
                <td align="right">S/ ${parseFloat(item.subtotal).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <hr/>
        <div style="font-weight:bold; font-size:12px">
           <div class="flex"><span>TOTAL:</span> <span>S/ ${parseFloat(data.total).toFixed(2)}</span></div>
        </div>
        <div class="text-center" style="margin-top:20px; font-size:10px">
          <p>¡GRACIAS POR SU COMPRA!</p>
        </div>
      `);
      
      win.document.write('</body></html>');
      win.document.close();
      win.print();
    } catch (err) { alert('Error al obtener boleta'); }
  };

  const filteredSales = sales.filter(s => (s.customer_name || 'Publico').toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toString().includes(searchTerm));
  const totalRevenue = sales.reduce((acc, s) => acc + (s.status !== 'cancelled' ? parseFloat(s.total) : 0), 0);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando Reportes...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        icon={<FileText size={22} />}
        title="Actividad y Reportes"
        subtitle="Auditoría de ventas y gestión de boletas"
        actions={
          <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <TrendingUp size={18} color="var(--primary)" />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 'bold' }}>INGRESOS TOTALES</div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>S/ {totalRevenue.toFixed(2)}</div>
            </div>
          </div>
        }
      />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '16px' }}>
         <div className="glass-panel" style={{ flex: 1, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={18} style={{ color: 'var(--text-dim)' }} />
            <input 
              placeholder="Buscar por ID de venta o nombre de cliente..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', flex: 1 }}
            />
         </div>
         <button className="glass-panel" style={{ padding: '12px 20px', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Calendar size={18} /> Fecha
         </button>
         <button className="glass-panel" style={{ padding: '12px 20px', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
            <Download size={18} /> Exportar
         </button>
      </div>

      <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>ID Venta</th>
              <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fecha y Hora</th>
              <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Cliente</th>
              <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Pago</th>
              <th style={{ padding: '20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Monto Total</th>
              <th style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Estado</th>
              <th style={{ padding: '20px', textAlign: 'right', fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', opacity: s.status === 'cancelled' ? 0.4 : 1 }}>
                <td style={{ padding: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>#{s.id.toString().padStart(6, '0')}</td>
                <td style={{ padding: '20px', fontSize: '13px' }}>{new Date(s.created_at).toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                <td style={{ padding: '20px', fontWeight: '600' }}>{s.customer_name || 'Mostrador'}</td>
                 <td style={{ padding: '20px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>{s.payment_method}</span>
                 </td>
                 <td style={{ padding: '20px', fontWeight: '800', color: 'var(--text-main)' }}>S/ {parseFloat(s.total).toFixed(2)}</td>
                <td style={{ padding: '20px', textAlign: 'center' }}>
                   <div style={{ 
                     display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold',
                     background: s.status === 'completed' ? 'rgba(77,255,77,0.1)' : 'rgba(239,68,68,0.1)',
                     color: s.status === 'completed' ? '#4dff4d' : '#ef4444'
                   }}>
                      {s.status === 'completed' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {s.status === 'completed' ? 'COMPLETADO' : 'ANULADO'}
                   </div>
                </td>
                 <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                       <button onClick={() => handleReprint(s.id)} title="Imprimir Boleta" style={{ padding: '8px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: 'var(--text-main)', cursor: 'pointer' }}><Printer size={16} /></button>
                       <button onClick={() => setEditingSale(s)} title="Editar" style={{ padding: '8px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: 'var(--text-main)', cursor: 'pointer' }}><Edit size={16} /></button>
                       <button onClick={() => handleDelete(s.id)} title="Anular Venta" style={{ padding: '8px', borderRadius: '8px', background: '#fff1f2', border: '1px solid #fecdd3', color: 'var(--primary)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                 </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSale && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <form onSubmit={handleUpdate} className="glass-panel" style={{ padding: '32px', width: '440px', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Actualizar Venta #{editingSale.id.toString().padStart(6, '0')}</h2>
               <button onClick={() => setEditingSale(null)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}><X size={20} /></button>
             </div>
             
             <div>
               <label style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontWeight: '800' }}>MÉTODO DE PAGO</label>
               <select 
                 value={editingSale.payment_method} 
                 onChange={e => setEditingSale({...editingSale, payment_method: e.target.value})}
                 className="premium-input"
               >
                 <option value="efectivo">Efectivo</option>
                 <option value="tarjeta">Tarjeta</option>
                 <option value="yape">Yape</option>
                 <option value="plin">Plin</option>
               </select>
             </div>
 
             <div>
               <label style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'block', fontWeight: '800' }}>ESTADO DE LA VENTA</label>
               <select 
                 value={editingSale.status} 
                 onChange={e => setEditingSale({...editingSale, status: e.target.value})}
                 className="premium-input"
               >
                 <option value="completed">Completado / Activo</option>
                 <option value="cancelled">Anulado / Cancelado</option>
               </select>
             </div>
 
             <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditingSale(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', color: 'var(--text-main)', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' }}>Actualizar Venta</button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Reports;
