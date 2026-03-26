import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Package, Plus, Search, Edit, Trash2, 
  Layers, Tag, Info, AlertCircle, ShoppingCart, 
  Maximize2, PlusCircle, X, CheckSquare, List
} from 'lucide-react';
import PageHeader from './PageHeader';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [productData, setProductData] = useState({
    name: '', category_id: '', purchase_price: '', sale_price: '',
    variants: [{ size: '', color: '', stock: 0 }]
  });
  const [categoryData, setCategoryData] = useState({ name: '', description: '' });

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) await api.put(`/products/${editingProduct.id}`, productData);
      else await api.post('/products', productData);
      setShowProductForm(false);
      fetchData();
    } catch (err) { alert('Error al guardar producto'); }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) await api.put(`/categories/${editingCategory.id}`, categoryData);
      else await api.post('/categories', categoryData);
      setShowCategoryForm(false);
      fetchData();
    } catch (err) { alert('Error al guardar categoría'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar producto e inventario asociado permanentemente?')) return;
    try { await api.delete(`/products/${id}`); fetchData(); } catch (err) { alert('Error'); }
  };
  
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría permanentemente?')) return;
    try { await api.delete(`/categories/${id}`); fetchData(); } catch (err) { alert('Error al eliminar categoría. Verifique que no tenga productos asociados.'); }
  };

  const addVariant = () => setProductData({ ...productData, variants: [...productData.variants, { size: '', color: '', stock: 0 }] });
  const removeVariant = (idx) => setProductData({ ...productData, variants: productData.variants.filter((_, i) => i !== idx) });
  const updateVariant = (idx, field, val) => {
    const newVariants = [...productData.variants];
    newVariants[idx][field] = val;
    setProductData({ ...productData, variants: newVariants });
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader
        icon={<Package size={22} />}
        title="Almacén y Boutique"
        subtitle="Administra tu catálogo de prendas, controla tallas, colores y existencias."
        actions={
          <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-light)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <button onClick={() => setActiveTab('products')} 
              style={{ 
                padding: '10px 24px', borderRadius: '8px', border: 'none', 
                background: activeTab === 'products' ? '#fff' : 'transparent', 
                color: activeTab === 'products' ? 'var(--primary)' : 'var(--text-dim)', 
                fontWeight: '600', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: activeTab === 'products' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s'
              }}>
              <CheckSquare size={16} /> Productos
            </button>
            <button onClick={() => setActiveTab('categories')} 
              style={{ 
                padding: '10px 24px', borderRadius: '8px', border: 'none', 
                background: activeTab === 'categories' ? '#fff' : 'transparent', 
                color: activeTab === 'categories' ? 'var(--primary)' : 'var(--text-dim)', 
                fontWeight: '600', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: activeTab === 'categories' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s'
              }}>
              <List size={16} /> Categorías
            </button>
          </div>
        }
      />
      {/* Search + Action bar */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {activeTab === 'products' && (
          <div className="glass-panel" style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Search size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
            <input placeholder="Busca productos por nombre o temporada..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', flex: 1, fontSize: '14px' }} />
          </div>
        )}
        <button onClick={() => { 
            if (activeTab === 'products') { setEditingProduct(null); setProductData({ name: '', category_id: '', purchase_price: '', sale_price: '', variants: [{ size: '', color: '', stock: 0 }] }); setShowProductForm(true); } 
            else { setEditingCategory(null); setCategoryData({ name: '', description: '' }); setShowCategoryForm(true); }
          }} 
          style={{ 
            padding: '14px 28px', background: 'var(--primary)', border: 'none', color: '#fff', 
            fontWeight: '600', cursor: 'pointer', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, fontSize: '14px', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)'
          }}
          onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
          <Plus size={18} /> {activeTab === 'products' ? 'Añadir Prenda' : 'Nueva Categoría'}
        </button>
      </div>

      {activeTab === 'products' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
           {filteredProducts.map(p => {
             const totalStock = p.variants?.reduce((acc, v) => acc + v.stock, 0) || 0;
             const hasLowStock = p.variants?.some(v => v.stock < 5);
             
             return (
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
                   <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                     <button title="Editar Prenda" onClick={() => { setEditingProduct(p); setProductData({ ...p, variants: p.variants || [] }); setShowProductForm(true); }} style={{ background: '#fff', border: '1px solid var(--glass-border)', color: 'var(--text-main)', borderRadius: '6px', padding: '6px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-main)'}><Edit size={14} /></button>
                     <button title="Eliminar Prenda" onClick={() => handleDeleteProduct(p.id)} style={{ background: '#fff', border: '1px solid var(--glass-border)', color: 'var(--danger)', borderRadius: '6px', padding: '6px', cursor: 'pointer', opacity: 0.9, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} onMouseOver={e=>{e.currentTarget.style.background='#fecaca'; e.currentTarget.style.border='1px solid #fecaca'}} onMouseOut={e=>{e.currentTarget.style.background='#fff'; e.currentTarget.style.border='1px solid var(--glass-border)'}}><Trash2 size={14} /></button>
                  </div>
                   {hasLowStock && <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '3px', textAlign: 'center', letterSpacing: '0.15em' }}>STOCK CRÍTICO</div>}
                </div>

                {/* Info & Variants */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <div>
                     <h3 style={{ fontWeight: '500', fontSize: '15px', color: 'var(--text-main)', lineHeight: '1.4', margin: '0 0 8px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h3>
                     <div style={{ fontSize: '18px', color: '#000', fontWeight: '700', letterSpacing: '-0.02em' }} className="tabular-nums">S/ {parseFloat(p.sale_price).toFixed(2)}</div>
                   </div>
                   
                   <div style={{ marginTop: 'auto', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '12px', fontWeight: '700', letterSpacing: '0.05em' }}>
                         <span style={{ color: 'var(--text-dim)' }}>VARIANTES & STOCK</span>
                         <span style={{ color: totalStock < 10 ? '#ef4444' : 'var(--success)' }}>TOTAL: {totalStock} UDS.</span>
                      </div>
                      <div style={{ 
                         display: 'flex', flexWrap: 'wrap', gap: '6px', alignContent: 'flex-start',
                         maxHeight: '120px', overflowY: 'auto', paddingRight: '4px'
                      }}>
                         {p.variants?.map((v, i) => (
                          <div key={i} title={`${v.color ? v.color : 'Color único'}`} style={{ 
                            fontSize: '11px', padding: '4px 8px', borderRadius: '4px', 
                            background: v.stock < 5 ? '#fef2f2' : '#f8fafc',
                            color: v.stock < 5 ? '#ef4444' : 'var(--text-main)',
                            border: `1px solid ${v.stock < 5 ? '#fecaca' : '#e2e8f0'}`, display: 'flex', gap: '6px', alignItems: 'center', fontWeight: '500'
                          }}>
                             <span>{v.size}</span> <span style={{ opacity: 0.3 }}>|</span> <span style={{ fontWeight: '700' }} className="tabular-nums">{v.stock}</span> {v.stock < 5 && <AlertCircle size={10} />}
                          </div>
                       ))}
                      </div>
                   </div>
                </div>
              </div>
             );
           })}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '0px', overflowX: 'auto' }}>
           <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg-light)' }}>
                  <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Nombre de Categoría</th>
                  <th style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Descripción Oficial</th>
                  <th style={{ padding: '20px 24px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--bg-light)'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '20px 24px', fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>{c.name}</td>
                    <td style={{ padding: '20px 24px', color: 'var(--text-dim)', fontSize: '14px' }}>{c.description || 'Sin descripción detallada.'}</td>
                     <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                          <button onClick={() => { setEditingCategory(c); setCategoryData(c); setShowCategoryForm(true); }} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-light)', border: '1px solid var(--border)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>
                            <Edit size={14} /> Editar
                          </button>
                          <button onClick={() => handleDeleteCategory(c.id)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-light)', border: '1px solid #fecaca', color: 'var(--danger)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--danger)'} onMouseOut={e=>e.currentTarget.style.borderColor='#fecaca'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                     </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {/* Product Form Modal */}
       {showProductForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <form className="glass-panel" style={{ width: '100%', maxWidth: '720px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-card)' }} onSubmit={handleProductSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{editingProduct ? 'Editar Etiqueta de Prenda' : 'Nueva Prenda'}</h3>
                  <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '6px' }}>{editingProduct ? 'Modifica los precios y actualiza el stock físico de las tallas existetes.' : 'Registra un modelo de prenda en blanco con todas sus variantes de talla y color.'}</p>
                 </div>
                <button type="button" onClick={() => setShowProductForm(false)} style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--border)'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-light)'}><X size={18} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descripción de Catálogo (Nombre)</label>
                  <input value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} className="premium-input" style={{ marginTop: '8px' }} placeholder="Ej. Vestido Corto Satén Noche" required />
                </div>
                 <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Categoría</label>
                    <select value={productData.category_id} onChange={e => setProductData({ ...productData, category_id: e.target.value })} className="premium-input" style={{ marginTop: '8px' }} required>
                       <option value="">Seleccionar categoría origin...</option>
                       {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Precio Venta (S/)</label>
                    <input type="number" step="0.01" value={productData.sale_price} onChange={e => setProductData({ ...productData, sale_price: e.target.value })} className="premium-input tabular-nums" style={{ marginTop: '8px', color: '#000', fontWeight: '600' }} placeholder="0.00" required />
                   </div>
                   <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>Valor Costo (S/)</label>
                    <input type="number" step="0.01" value={productData.purchase_price} onChange={e => setProductData({ ...productData, purchase_price: e.target.value })} className="premium-input tabular-nums" style={{ marginTop: '8px' }} placeholder="0.00" />
                   </div>
                </div>
              </div>

               <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                     <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>GRILLA DE VARIANTES (TALLA, COLOR, UDS.)</label>
                     <button type="button" onClick={addVariant} style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-main)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}><PlusCircle size={14} /> Añadir Fila</button>
                  </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {productData.variants.map((v, i) => (
                       <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-light)', padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                          <input placeholder="Talla (Ej. L, 34)" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} className="premium-input" style={{ flex: 1.5, background: '#fff' }} required />
                          <input placeholder="Color / Variante" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} className="premium-input" style={{ flex: 2, background: '#fff' }} />
                          <input type="number" placeholder="📦 Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', e.target.value)} className="premium-input tabular-nums" style={{ width: '120px', background: '#fff' }} required />
                          <button type="button" disabled={productData.variants.length <= 1} onClick={() => removeVariant(i)} style={{ background: 'none', border: 'none', color: productData.variants.length <= 1 ? 'var(--text-dim)' : 'var(--danger)', cursor: productData.variants.length <= 1 ? 'not-allowed' : 'pointer', padding: '10px', opacity: productData.variants.length <= 1 ? 0.3 : 1 }}><Trash2 size={18} /></button>
                       </div>
                    ))}
                 </div>
              </div>

               <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <button type="button" onClick={() => setShowProductForm(false)} style={{ flex: 1, padding: '16px', background: 'var(--bg-light)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-dim)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>Cancelar y Cerrar</button>
                  <button type="submit" style={{ flex: 1, padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--primary-light)'} onMouseOut={e=>e.currentTarget.style.background='var(--primary)'}>{editingProduct ? 'Aplicar Cambios a Prenda' : 'Incluir Prenda a Catálogo'}</button>
               </div>
           </form>
        </div>
      )}
      
      {/* Category Form Modal */}
       {showCategoryForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
           <form className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-card)' }} onSubmit={handleCategorySubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{editingCategory ? 'Editar Clasificador' : 'Nueva Clasificación'}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginTop: '6px' }}>{editingCategory ? 'Ajusta el nombre de tu departamento.' : 'Crea una nueva categoría para agrupar prendas.'}</p>
                 </div>
                <button type="button" onClick={() => setShowCategoryForm(false)} style={{ background: 'var(--bg-light)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--border)'} onMouseOut={e=>e.currentTarget.style.background='var(--bg-light)'}><X size={18} /></button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NOMBRE DIRECTO DE LA FAMILIA</label>
                  <input value={categoryData.name} onChange={e => setCategoryData({ ...categoryData, name: e.target.value })} className="premium-input" style={{ marginTop: '8px' }} placeholder="Ej. Accesorios de Cuero" required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DESCRIPCIÓN DE LA ETIQUETA (Opcional)</label>
                  <textarea rows="3" value={categoryData.description} onChange={e => setCategoryData({ ...categoryData, description: e.target.value })} className="premium-input" style={{ marginTop: '8px', resize: 'none' }} placeholder="Agrega información adicional para inventario."></textarea>
                </div>
              </div>

               <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowCategoryForm(false)} style={{ flex: 1, padding: '16px', background: 'var(--bg-light)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.borderColor='var(--text-dim)'} onMouseOut={e=>e.currentTarget.style.borderColor='var(--border)'}>Cancelar y Cerrar</button>
                  <button type="submit" style={{ flex: 1, padding: '16px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='var(--primary-light)'} onMouseOut={e=>e.currentTarget.style.background='var(--primary)'}>{editingCategory ? 'Modificar Catálogo' : 'Añadir Categoría'}</button>
               </div>
           </form>
         </div>
      )}
    </div>
  );
};

export default Inventory;
