import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, 
  CheckCircle, Printer, X, UserSearch, CreditCard, 
  Smartphone, Wallet, Tag, Info, AlertCircle 
} from 'lucide-react';
import PageHeader from './PageHeader';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState(null);
  const [shopInfo, setShopInfo] = useState({ shop_name: 'Boutique Premium' });

  const [dniSearch, setDniSearch] = useState('');
  const [dniLoading, setDniLoading] = useState(false);

  const receiptRef = useRef();

  const fetchData = async () => {
    try {
      const [p, c, s] = await Promise.all([
        api.get('/products'), 
        api.get('/customers'),
        api.get('/settings')
      ]);
      setProducts(p.data);
      setCustomers(c.data);
      if (s.data) setShopInfo(s.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDniLookup = async () => {
    if (dniSearch.length !== 8 && dniSearch.length !== 11) return alert('DNI (8) o RUC (11) inválido');
    setDniLoading(true);
    try {
      const endpoint = dniSearch.length === 8 ? `/customers/consultar/${dniSearch}` : `/customers/consultar/ruc/${dniSearch}`;
      const { data: res } = await api.get(endpoint);
      
      if (res.source === 'local') {
        setSelectedCustomer(res.data.id);
      } else {
        if (window.confirm(`Encontrado: ${res.data.name}. ¿Registrar como nuevo cliente?`)) {
          const newCust = await api.post('/customers', {
            name: res.data.name,
            document_type: dniSearch.length === 8 ? 'DNI' : 'RUC',
            document_number: dniSearch,
            address: res.data.address || ''
          });
          const allCust = await api.get('/customers');
          setCustomers(allCust.data);
          setSelectedCustomer(newCust.data.id);
        }
      }
    } catch (err) { alert('Error en consulta'); }
    finally { setDniLoading(false); }
  };

  const addToCart = (product, variant) => {
    const cartKey = variant.id;
    const existing = cart.find(item => item.variant_id === cartKey);
    if (existing) {
      if (existing.quantity >= variant.stock) return;
      setCart(cart.map(item => item.variant_id === cartKey ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unit_price } : item));
    } else {
      if (variant.stock <= 0) return;
      setCart([...cart, { 
        variant_id: variant.id, 
        name: `${product.name} (${variant.size}${variant.color ? ' - ' + variant.color : ''})`, 
        unit_price: product.sale_price, 
        quantity: 1, 
        subtotal: parseFloat(product.sale_price) 
      }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.variant_id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, subtotal: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => setCart(cart.filter(i => i.variant_id !== id));
  const total = cart.reduce((acc, item) => acc + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/sales', {
        customer_id: selectedCustomer || null,
        payment_method: paymentMethod,
        items: cart
      });
      
      setLastSale({
        id: res.data.sale_id,
        items: [...cart],
        total,
        subtotal: total / 1.18,
        tax: total - (total / 1.18),
        customer: customers.find(c => c.id == selectedCustomer)?.name || 'Público General',
        date: new Date().toLocaleString(),
        payment_method: paymentMethod
      });
      setSuccess(true);
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomer('');
      setDniSearch('');
      setTimeout(() => setSuccess(false), 3000);
      fetchData(); // Actualizar stock local
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handlePrint = () => {
    const content = receiptRef.current.innerHTML;
    const safeContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ""); 
    const win = window.open('', '', 'height=600,width=400');
    win.document.write(`
      <html>
        <head>
          <title>Boleta</title>
          <style>
            body { font-family: monospace; width: 80mm; padding: 5mm; } 
            .text-center { text-align: center; } 
            .flex { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          \${safeContent}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', height: '100%' }}>
      <PageHeader
        icon={<ShoppingCart size={22} />}
        title="Punto de Venta"
        subtitle="Registra ventas y emite boletas al instante"
      />
      
      <div className="sales-grid" style={{ 
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '24px', 
        alignItems: 'start'
      }}>
        {/* Catálogo de Productos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-card)' }}>
            <Search size={20} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            <input 
              placeholder="Buscar por nombre o categoría..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ flex: 1, background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '15px' }} 
            />
          </div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
            gap: '16px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '4px' 
          }}>
            {products.filter(p => (p.name + p.category_name).toLowerCase().includes(search.toLowerCase())).map(p => (
              <div key={p.id} style={{ 
                borderRadius: '12px', background: '#fff', 
                border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }} onMouseOver={e=>e.currentTarget.style.boxShadow='0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'} onMouseOut={e=>e.currentTarget.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.05)'}>
                
                {/* Premium Header/Mock Image */}
                <div style={{ 
                  height: '110px', background: 'linear-gradient(to bottom right, #f8f9fa, #e2e8f0)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
                  borderBottom: '1px solid var(--glass-border)'
                }}>
                   <span style={{ fontSize: '60px', fontWeight: '900', color: '#cbd5e1', opacity: 0.3, letterSpacing: '-0.05em', whiteSpace: 'nowrap', userSelect: 'none' }}>
                     {p.category_name.substring(0,4).toUpperCase()}
                   </span>
                   <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                     {p.category_name}
                   </div>
                </div>

                {/* Info & Variants */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div>
                     <h3 style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.4', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h3>
                     <div style={{ fontSize: '18px', color: '#000', fontWeight: '700', letterSpacing: '-0.02em' }} className="tabular-nums">S/ {parseFloat(p.sale_price).toFixed(2)}</div>
                   </div>
                   
                   <div style={{ 
                     display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto',
                     maxHeight: '140px', overflowY: 'auto', paddingRight: '4px' 
                   }}>
                     {p.variants?.map((v, i) => (
                      <button 
                        key={v.id || i} 
                        onClick={() => addToCart(p, v)} 
                        disabled={v.stock <= 0} 
                        style={{ 
                          flex: '1 1 calc(50% - 4px)', padding: '8px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                          background: v.stock <= 0 ? '#f8fafc' : '#fff', 
                          color: v.stock <= 0 ? '#94a3b8' : 'var(--text-main)',
                          cursor: v.stock <= 0 ? 'not-allowed' : 'pointer',
                          border: `1px solid ${v.stock <= 0 ? '#e2e8f0' : '#cbd5e1'}`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={e => { if(v.stock > 0) { e.currentTarget.style.borderColor = '#000'; e.currentTarget.style.background = '#fafafa'; } }}
                        onMouseOut={e => { if(v.stock > 0) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fff'; } }}
                        title={`Agregar ${p.name} - ${v.size} ${v.color}`}
                      >
                        <span style={{ fontSize: '12px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          {v.size} {v.color && <span style={{fontWeight:'400'}}>- {v.color}</span>}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: v.stock > 0 ? (v.stock < 5 ? '#ef4444' : '#64748b') : '#94a3b8', letterSpacing: '0.05em' }}>
                          {v.stock > 0 ? `VENTA (${v.stock})` : 'AGOTADO'}
                        </span>
                      </button>
                    ))}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caja / Proceso de Pago */}
        <div className="glass-panel sales-checkout" style={{ 
          padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', 
          position: 'sticky', top: '24px', maxHeight: 'calc(100vh - 48px)',
          background: 'var(--bg-card)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)' }}>
            <ShoppingCart size={20} color="var(--primary)" /> Checkout
          </h2>
          
          {/* Identificación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente (DNI/RUC)</label>
               <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    placeholder="Nro documento..." 
                    value={dniSearch}
                    onChange={e => setDniSearch(e.target.value.replace(/\D/g, ''))}
                    className="premium-input" style={{ flex: 1 }}
                  />
                  <button 
                    onClick={handleDniLookup}
                    disabled={dniLoading}
                    style={{ 
                      padding: '0 16px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', 
                      border: 'none', color: '#fff', cursor: 'pointer', transition: 'background 0.2s' 
                    }}
                  >
                    {dniLoading ? '...' : <UserSearch size={18} />}
                  </button>
               </div>
               
               <select 
                  value={selectedCustomer} 
                  onChange={e => setSelectedCustomer(e.target.value)} 
                  className="premium-input"
               >
                  <option value="">Cliente Mostrador / Público General</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {[
              { id: 'efectivo', icon: Wallet, label: 'Efectivo' },
              { id: 'yape', icon: Smartphone, label: 'Yape/Plin' },
              { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta' }
            ].map(m => (
              <button 
                key={m.id} 
                onClick={() => setPaymentMethod(m.id)}
                style={{ 
                  padding: '12px 8px', borderRadius: 'var(--radius-md)', border: '1px solid', 
                  borderColor: paymentMethod === m.id ? 'var(--primary)' : 'var(--glass-border)',
                  background: paymentMethod === m.id ? 'var(--primary)' : 'var(--bg-light)',
                  color: paymentMethod === m.id ? '#fff' : 'var(--text-dim)',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                  fontSize: '12px', fontWeight: '500', transition: 'all 0.2s ease'
                }}
              >
                <m.icon size={18} /> {m.label}
              </button>
            ))}
          </div>

          {/* Artículos en Carrito */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            {cart.length === 0 ? (
               <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '20px' }}>
                  <ShoppingCart size={40} style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '13px' }}>El carrito está vacío</p>
               </div>
            ) : cart.map(item => (
              <div key={item.variant_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: 'slideUpFade 0.2s ease-out' }}>
                 <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }} className="tabular-nums">S/ {item.unit_price} x {item.quantity}</div>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                       <button onClick={() => updateQty(item.variant_id, -1)} style={{ background: 'var(--bg-light)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Minus size={12} /></button>
                       <button onClick={() => updateQty(item.variant_id, 1)} style={{ background: 'var(--bg-light)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Plus size={12} /></button>
                    </div>
                    <div style={{ fontWeight: '500', width: '70px', textAlign: 'right', color: 'var(--text-main)' }} className="tabular-nums">
                      S/ {item.subtotal.toFixed(2)}
                    </div>
                    <Trash2 size={16} style={{ color: 'var(--text-light)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='var(--danger)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-light)'} onClick={() => removeFromCart(item.variant_id)} />
                 </div>
              </div>
            ))}
          </div>

          {/* Totales y Botón */}
          <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'var(--text-dim)' }}>
              <span>Subtotal</span>
              <span className="tabular-nums">S/ {(total / 1.18).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: 'var(--text-dim)' }}>
              <span>IGV (18%)</span>
              <span className="tabular-nums">S/ {(total - (total / 1.18)).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '600', color: 'var(--text-main)' }}>
              <span>Total</span>
              <span className="tabular-nums">S/ {total.toFixed(2)}</span>
            </div>
            <button 
              disabled={cart.length === 0 || loading} 
              onClick={handleCheckout} 
              style={{ 
                width: '100%', padding: '16px', borderRadius: 'var(--radius-md)', border: 'none', 
                background: success ? 'var(--success)' : 'var(--primary)',
                color: '#fff', fontWeight: '500', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', marginTop: '24px', fontSize: '15px',
                transition: 'all 0.3s ease', opacity: cart.length === 0 ? 0.6 : 1
              }}
            >
              {loading ? 'Procesando...' : success ? '¡Venta Realizada!' : 'Finalizar Venta'}
            </button>
          </div>
        </div>
      </div>

      {/* Recibo / Boleta Modal */}
      {showReceipt && lastSale && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
           <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }} className="glass-panel">
              <div style={{ background: '#fff', color: '#000', padding: '32px', fontFamily: 'monospace', borderRadius: 'var(--radius-lg)' }}>
                 <div ref={receiptRef}>
                    <div className="text-center" style={{ textAlign: 'center' }}>
                       <h2 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>{shopInfo.shop_name}</h2>
                       <p style={{ fontSize: '12px', margin: '0 0 2px 0' }}>BOLETA ELECTRÓNICA</p>
                       <p style={{ fontSize: '11px', margin: '0 0 16px 0' }}>N° {lastSale.id.toString().padStart(6, '0')}</p>
                       <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '16px 0' }} />
                    </div>
                    <div style={{ fontSize: '12px', margin: '16px 0', lineHeight: '1.6' }}>
                       <p style={{ margin: 0 }}><strong>FECHA:</strong> {lastSale.date}</p>
                       <p style={{ margin: 0 }}><strong>CLIENTE:</strong> {lastSale.customer}</p>
                    </div>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginTop: '16px' }}>
                       <thead>
                         <tr style={{ borderBottom: '1px solid #000' }}>
                           <th style={{ textAlign: 'left', paddingBottom: '8px' }}>ARTÍCULO</th>
                           <th style={{ textAlign: 'center', paddingBottom: '8px' }}>CANT</th>
                           <th style={{ textAlign: 'right', paddingBottom: '8px' }}>TOTAL</th>
                         </tr>
                       </thead>
                       <tbody>
                          {lastSale.items.map((i, idx) => (
                             <tr key={idx}>
                               <td style={{ paddingTop: '8px' }}>{i.name}</td>
                               <td style={{ textAlign: 'center', paddingTop: '8px' }}>{i.quantity}</td>
                               <td style={{ textAlign: 'right', paddingTop: '8px' }}>{i.subtotal.toFixed(2)}</td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                    <hr style={{ border: 'none', borderTop: '1px dashed #ccc', margin: '16px 0' }} />
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                       <div className="flex" style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span>TOTAL:</span> 
                         <span>S/ {lastSale.total.toFixed(2)}</span>
                       </div>
                    </div>
                    <p style={{ fontSize: '11px', textAlign: 'center', marginTop: '24px', opacity: 0.8 }}>¡Gracias por confiar en {shopInfo.shop_name}!</p>
                 </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', padding: '0 24px 24px' }}>
                 <button onClick={handlePrint} style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-md)', background: '#EAEAEA', color: 'var(--text-main)', border: '1px solid var(--border)', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#DCDCDC'} onMouseOut={e=>e.currentTarget.style.background='#EAEAEA'}>
                   <Printer size={18} /> Imprimir
                 </button>
                 <button onClick={() => setShowReceipt(false)} style={{ flex: 1, padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '500' }}>
                   Nueva Venta
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
