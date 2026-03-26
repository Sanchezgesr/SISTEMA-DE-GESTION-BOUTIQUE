import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Banknote, Receipt, Calendar, ArrowDownRight, Clock } from 'lucide-react';
import PageHeader from './PageHeader';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ description: '', amount: '' });

  const fetchItems = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        description: formData.description,
        amount: parseFloat(formData.amount)
      };
      await api.post('/expenses', dataToSend);
      fetchItems();
      setFormData({ description: '', amount: '' });
    } catch (err) {
      console.error('Error guardando gasto:', err.response?.data || err);
      alert(err.response?.data?.message || 'Error guardando gasto');
    }
  };

  const totalExpenses = expenses.reduce((sum, ex) => sum + parseFloat(ex.amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader
        icon={<Receipt size={22} />}
        title="Control de Gastos"
        subtitle="Registra y controla el flujo de caja saliente y gastos operativos."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 380px) 1fr', gap: '32px' }}>
        {/* Lado Izquierdo: Formularios y Totales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ 
            background: 'var(--primary)', color: '#fff', borderRadius: '12px', padding: '32px 24px',
            display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}>
             <div style={{ position: 'absolute', right: '-20px', top: '-10px', opacity: 0.05, transform: 'rotate(-10deg)' }}>
                <Banknote size={150} />
             </div>
             <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Balance de Salidas (Mes Actual)</p>
             <h2 style={{ fontSize: '42px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '12px', color: '#fff' }} className="tabular-nums">
               <span style={{ fontSize: '24px', opacity: 0.8, fontWeight: '500' }}>S/</span> {totalExpenses.toFixed(2)}
             </h2>
             <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
               <ArrowDownRight size={14} /> Total facturado y registrado
             </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div>
               <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-0.01em', margin: 0 }}>Nuevo Gasto</h3>
               <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>Añade recibos, salarios o mantenimiento.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Concepto del Gasto</label>
                 <textarea 
                   value={formData.description} 
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   required
                   className="premium-input"
                   style={{ minHeight: '80px', resize: 'none' }}
                   placeholder="Ej. Pago de internet local central..."
                 />
              </div>
              
              <div>
                 <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Monto a descontar (S/)</label>
                 <div style={{ position: 'relative' }}>
                   <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontWeight: '600', fontSize: '16px' }}>S/</span>
                   <input 
                     type="number" step="0.01" min="0" value={formData.amount} 
                     onChange={e => setFormData({...formData, amount: e.target.value})}
                     required className="premium-input tabular-nums"
                     style={{ width: '100%', paddingLeft: '44px', fontSize: '18px', fontWeight: '700', color: '#000' }}
                     placeholder="0.00"
                   />
                 </div>
              </div>
            </div>

            <button type="submit" style={{ 
              padding: '16px', marginTop: '8px', 
              background: 'var(--text-main)', color: '#fff', border: 'none', 
              borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'all 0.2s', fontSize: '14px'
            }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
              <Plus size={18} /> Registrar Gasto
            </button>
          </form>
        </div>

        {/* Lado Derecho: Lista de Historial */}
        <div className="glass-panel" style={{ padding: '0px', background: 'var(--bg-card)', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-light)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'var(--text-main)' }}>Historial de Movimientos</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: '600', background: '#fff', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)' }}>{expenses.length} Registros</span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
             {loading ? (
               <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', fontSize: '14px', fontWeight: '500' }}>Cargando información contable...</div>
             ) : expenses.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-light)' }}>
                 <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                 <p style={{ fontSize: '15px', color: 'var(--text-dim)' }}>Tu historial de gastos está limpio.</p>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                 {expenses.map(ex => (
                   <div key={ex.id} style={{ 
                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                     padding: '20px 24px', borderBottom: '1px solid var(--border)',
                     transition: 'background 0.2s'
                   }} onMouseOver={e=>e.currentTarget.style.background='var(--bg-light)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                       <div style={{ 
                         padding: '10px', borderRadius: '50%', 
                         background: '#fff', border: '1px solid var(--border)', color: 'var(--text-dim)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}>
                         <ArrowDownRight size={18} />
                       </div>
                       <div>
                         <div style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)' }}>{ex.description}</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-dim)', marginTop: '6px' }}>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(ex.expense_date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                           <span style={{ opacity: 0.3 }}>|</span>
                           <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {new Date(ex.expense_date).toLocaleTimeString('es-PE', { hour: '2-digit', minute:'2-digit' })}</span>
                         </div>
                       </div>
                     </div>
                     <div style={{ 
                       fontSize: '17px', fontWeight: '700', 
                       color: 'var(--text-main)', letterSpacing: '-0.02em',
                       display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
                     }} className="tabular-nums">
                       <span>- S/ {parseFloat(ex.amount).toFixed(2)}</span>
                       {ex.user_name && <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '500', marginTop: '4px', textTransform: 'uppercase' }}>Por: {ex.user_name}</span>}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: minmax"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Expenses;
