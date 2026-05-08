import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']
  const statusColor = { pending: '#fbbf24', preparing: '#60a5fa', ready: '#8CB874', delivered: '#4ade80', cancelled: '#f87171' }

export default function Orders() {
  const { orders, updateOrderStatus } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = orders.filter(o =>
    (filterStatus === 'all' || o.status === filterStatus) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()))
  )

  const handleStatus = (id, status) => {
    updateOrderStatus(id, status)
    toast.success(`Order ${id} → ${status}`)
  }

  const statusColor = { pending: '#fbbf24', preparing: '#60a5fa', ready: '#8CB874', delivered: '#4ade80', cancelled: '#f87171' }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--text-main)', fontWeight: 700, marginBottom: 4 }}>Order Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Track and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ paddingLeft: 34 }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-dark" style={{ width: 160 }}>
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Status summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {['all', ...STATUS_OPTIONS].map(s => {
          const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
          const sColor = statusColor[s] || 'var(--accent-gold)'
          return (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: `1px solid ${filterStatus === s ? sColor : 'var(--glass-border)'}`, background: filterStatus === s ? `${sColor}15` : 'transparent', color: filterStatus === s ? sColor : 'var(--text-muted)', cursor: 'pointer' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16 }}>
        {/* Orders Table */}
        <motion.div className="glass-card" style={{ padding: 0, overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-dark">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} onClick={() => setSelected(selected?.id === o.id ? null : o)} style={{ cursor: 'pointer', background: selected?.id === o.id ? 'rgba(140,184,116,0.06)' : 'transparent' }}>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{o.id}</td>
                    <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{o.items.length} item{o.items.length > 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.total.toFixed(0)}</td>
                    <td><span className="badge-gold">{o.paymentMethod}</span></td>
                    <td>
                      <span className="badge" style={{ background: `${statusColor[o.status]}15`, color: statusColor[o.status], border: `1px solid ${statusColor[o.status]}25` }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{format(new Date(o.createdAt), 'MMM d, hh:mm a')}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select value={o.status} onChange={e => handleStatus(o.id, e.target.value)}
                        style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', outline: 'none' }}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 14 }}>No orders found</div>}
        </motion.div>

        {/* Order Detail Panel */}
        {selected && (
          <motion.div className="glass-card" style={{ padding: 20 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 16, color: 'var(--text-main)' }}>{selected.id}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Customer: <span style={{ color: 'var(--text-main)' }}>{selected.customerName}</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Date: <span style={{ color: 'var(--text-main)' }}>{format(new Date(selected.createdAt), 'PPP p')}</span></div>

            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent-gold)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</div>
            {selected.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '7px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{item.name} × {item.qty}</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>₹{(item.price * item.qty).toFixed(0)}</span>
              </div>
            ))}

            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}><span>Subtotal</span><span>₹{selected.subtotal?.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700, color: 'var(--accent-light)', marginTop: 6, fontFamily: 'Playfair Display' }}><span>Total</span><span>₹{selected.total?.toFixed(2)}</span></div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Update Status</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => { handleStatus(selected.id, s); setSelected({ ...selected, status: s }) }}
                    style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${selected.status === s ? statusColor[s] : 'var(--glass-border)'}`, background: selected.status === s ? `${statusColor[s]}15` : 'transparent', color: selected.status === s ? statusColor[s] : 'var(--text-muted)', cursor: 'pointer' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
