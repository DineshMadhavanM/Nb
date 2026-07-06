import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, User, Phone, Mail, X, Edit2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const emptyForm = { name: '', phone: '', email: '' }

function CustomerModal({ customer, onSave, onClose }) {
  const [form, setForm] = useState(customer ? { name: customer.name, phone: customer.phone, email: customer.email } : emptyForm)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return }
    onSave(form)
    onClose()
    toast.success(customer ? 'Customer updated!' : 'Customer added!')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: 20, width: '90%', maxWidth: 420, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--text-main)' }}>{customer ? 'Edit Customer' : 'Add Customer'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'Full Name *', placeholder: 'Customer name', type: 'text' },
            { key: 'phone', label: 'Phone *', placeholder: '9876543210', type: 'tel' },
            { key: 'email', label: 'Email', placeholder: 'customer@email.com', type: 'email' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
              <input className="input-dark" type={type} value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn-outline-gold" style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 14 }}>Cancel</button>
            <button type="submit" className="btn-gold" style={{ flex: 1, padding: '11px', borderRadius: 10, fontSize: 14 }}>{customer ? 'Update' : 'Add Customer'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Customers() {
  const { customers, orders, addCustomer, updateCustomer } = useApp()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const getCustomerOrders = (cid) => orders.filter(o => o.customerId === cid)

  const handleSave = (data) => {
    if (modal === 'add') addCustomer(data)
    else updateCustomer(modal.id, data)
  }


  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--text-main)', fontWeight: 700, marginBottom: 4 }}>Customers</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage customer database and loyalty</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-gold" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total Customers', value: customers.length, color: 'var(--accent-gold)' },
            { label: 'Total Revenue', value: `₹${customers.reduce((s, c) => s + (c.totalSpent || 0), 0).toLocaleString()}`, color: 'var(--accent-light)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '16px 18px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 800, color }}>{value}</div>
            </div>
          ))}
        </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or email..." style={{ paddingLeft: 32 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 320px' : '1fr', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 14, alignContent: 'start' }}>
          <AnimatePresence>
            {filtered.map(c => (
              <motion.div key={c.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelected(selected?.id === c.id ? null : c)}
                style={{ background: selected?.id === c.id ? 'var(--input-bg)' : 'var(--card-bg)', border: `1px solid ${selected?.id === c.id ? 'var(--accent-gold)' : 'var(--glass-border)'}`, borderRadius: 14, padding: '18px 16px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: selected?.id === c.id ? '0 8px 24px rgba(104,159,56,0.1)' : 'var(--shadow-main)' }}
                whileHover={{ borderColor: 'var(--accent-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent-gold),#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#0F170B', fontWeight: 700 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.phone}</div>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setModal(c) }} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(140, 184, 116, 0.1)', border: '1px solid rgba(140, 184, 116, 0.2)', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Edit2 size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Spent</div>
                    <div style={{ fontSize: 15, fontFamily: 'Playfair Display', color: 'var(--accent-gold)', fontWeight: 700 }}>₹{c.totalSpent?.toLocaleString()}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Detail Panel */}
        {selected && (
          <motion.div className="glass-card" style={{ padding: 22, alignSelf: 'start' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--text-main)' }}>{selected.name}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}><Phone size={13} color="var(--accent-gold)" />{selected.phone}</div>
              {selected.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}><Mail size={13} color="var(--accent-gold)" />{selected.email}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}><User size={13} color="var(--accent-gold)" />Member since {format(new Date(selected.createdAt), 'MMM yyyy')}</div>
            </div>
            <div style={{ background: 'rgba(140, 184, 116, 0.08)', borderRadius: 10, padding: '14px', marginBottom: 18, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--accent-light)', fontWeight: 700 }}>₹{selected.totalSpent?.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Spent</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#8CB874', fontWeight: 700 }}>{getCustomerOrders(selected.id).length}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent-gold)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Orders</div>
            {getCustomerOrders(selected.id).slice(0, 4).map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{o.id}</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>₹{o.total?.toFixed(0)}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(o.createdAt), 'dd MMM')}</span>
              </div>
            ))}
            {getCustomerOrders(selected.id).length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No orders yet</div>}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modal && <CustomerModal customer={modal === 'add' ? null : modal} onSave={handleSave} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </div>
  )
}
