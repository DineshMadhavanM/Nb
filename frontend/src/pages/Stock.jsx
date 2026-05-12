import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, X, AlertTriangle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const CATEGORIES = ['None / General', 'Brownie', 'Tres Leches', 'Cookies', 'Muffins', 'Jar Cake', 'Panna Cotta', 'Mousse', 'Beverages', 'Mojito', 'Snacks']

const emptyForm = { name: '', category: 'None / General', price: '', stock: '', unit: 'pcs', description: '', gstRate: 0 }

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Please fill all required fields'); return }
    
    const { customCategory, ...productData } = form
    
    onSave({ 
      ...productData, 
      category: form.category === 'Custom' ? form.customCategory : form.category,
      price: Number(form.price), 
      stock: Number(form.stock || 0),
      gstRate: Number(form.gstRate || 0)
    })
    onClose()
    toast.success(product ? 'Product updated!' : 'Product added!')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: 20, width: '90%', maxWidth: 480, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--text-main)' }}>{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name *</label>
              <input className="input-dark" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Product name" required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
              <select className="input-dark" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Custom">-- Custom Category --</option>
              </select>
            </div>
            {form.category === 'Custom' && (
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Category Name</label>
                <input className="input-dark" value={form.customCategory || ''} onChange={e => set('customCategory', e.target.value)} placeholder="Type new category..." required />
              </div>
            )}
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</label>
              <select className="input-dark" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['pcs', 'slice', 'cup', 'box', 'loaf', 'kg'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price (₹) *</label>
              <input className="input-dark" type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="0" required />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</label>
              <input className="input-dark" type="number" value={form.stock || ''} onChange={e => set('stock', e.target.value)} placeholder="0" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
              <input className="input-dark" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Short description" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GST Rate (%)</label>
              <input className="input-dark" type="number" value={form.gstRate || ''} onChange={e => set('gstRate', e.target.value)} placeholder="0" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 14 }}>Cancel</button>
            <button type="submit" className="btn-gold" style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 14 }}>
              {product ? 'Update' : 'Add Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Stock() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modal, setModal] = useState(null)

  const filtered = products.filter(p =>
    (catFilter === 'All' || p.category === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const lowStock = products.filter(p => p.stock < 5).length
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0)

  const handleSave = (data) => {
    if (modal === 'add') addProduct(data)
    else updateProduct(modal.id, data)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) { deleteProduct(id); toast.success('Product deleted') }
  }

  const stockColor = (s) => s === 0 ? '#f87171' : s < 5 ? '#fbbf24' : s < 10 ? '#60a5fa' : '#8CB874'

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--text-main)', fontWeight: 700, marginBottom: 4 }}>Stock Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Track and manage product inventory</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-gold desktop-only" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Products', value: products.length, color: 'var(--accent-gold)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-main)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>


      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ paddingLeft: 32, height: 44 }} />
        </div>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {['All', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1px solid ${catFilter === c ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: catFilter === c ? 'rgba(104, 159, 56, 0.1)' : 'transparent', color: catFilter === c ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }} className="stock-grid">
        <AnimatePresence>
          {filtered.map(p => (
            <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 16, padding: '16px', position: 'relative', transition: 'border-color 0.2s', boxShadow: 'var(--shadow-main)' }}
              whileHover={{ borderColor: 'var(--accent-gold)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{p.category}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setModal(p)} style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(p.id, p.name)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{p.description || 'No description provided'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display', fontSize: 19, color: 'var(--accent-gold)', fontWeight: 800 }}>₹{p.price}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: stockColor(p.stock) }} />
                  <span style={{ fontSize: 13, color: stockColor(p.stock), fontWeight: 700 }}>{p.stock} {p.unit}</span>
                </div>
              </div>
              <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(104,184,116,0.1)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(100, (p.stock / 30) * 100)}%`, background: stockColor(p.stock), borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button onClick={() => setModal('add')} className="mobile-fab" style={{
        display: 'none', position: 'fixed', bottom: 85, right: 20,
        width: 60, height: 60, borderRadius: 30, background: 'var(--accent-gold)',
        color: '#FFFFFF', border: 'none', boxShadow: '0 8px 30px rgba(104,159,56,0.4)',
        zIndex: 100, alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
      }}>
        <Plus size={28} strokeWidth={2.5} />
      </button>

      <AnimatePresence>
        {modal && <ProductModal product={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
      </AnimatePresence>

      <style>{`
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
          .mobile-fab { display: flex !important; }
          .stock-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; gap: 12px !important; }
        }
      `}</style>
    </div>
  )
}
