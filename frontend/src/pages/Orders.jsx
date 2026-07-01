import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Trash2, Smartphone, CreditCard, Banknote } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'preparing', 'ready', 'delivered', 'cancelled']
  const statusColor = { pending: '#fbbf24', preparing: '#60a5fa', ready: '#8CB874', delivered: '#4ade80', cancelled: '#f87171' }

export default function Orders() {
  const { orders, updateOrderStatus, updatePaymentStatus, deleteOrder } = useApp()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [paymentPromptOrder, setPaymentPromptOrder] = useState(null)

  const handleDeliverCredit = async (orderId, chosenMethod) => {
    try {
      await updateOrderStatus(orderId, 'delivered', chosenMethod, 'paid')
      toast.success('Order marked as Delivered')
      setPaymentPromptOrder(null)
      if (selected?.id === orderId) {
        setSelected(prev => ({
          ...prev,
          status: 'delivered',
          paymentMethod: chosenMethod,
          paymentStatus: 'paid'
        }))
      }
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
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
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." style={{ paddingLeft: 34 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16 }}>
        {/* Orders Table */}
        <motion.div className="glass-card" style={{ padding: 0, overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-dark">
              <thead>
                <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Method</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} onClick={() => setSelected(selected?.id === o.id ? null : o)} style={{ cursor: 'pointer', background: selected?.id === o.id ? 'rgba(140,184,116,0.06)' : 'transparent' }}>
                    <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{o.id.slice(-6).toUpperCase()}</td>
                    <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                    <td style={{ fontWeight: 600 }}>₹{o.total.toFixed(0)}</td>
                    <td><span className="badge-gold">{o.paymentMethod}</span></td>
                    <td>
                      <span className="badge" style={{ background: `${statusColor[o.status]}15`, color: statusColor[o.status], border: `1px solid ${statusColor[o.status]}25` }}>
                        {o.status}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {o.status === 'pending' ? (
                        <select value={o.status} onChange={e => {
                          if (e.target.value === 'delivered') {
                            setPaymentPromptOrder(o)
                          }
                        }}
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', outline: 'none' }}>
                          <option value="pending">Pending</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Delivered</span>
                      )}
                      <button 
                        onClick={() => window.confirm('Delete this order? This cannot be undone and stock will be restored.') && deleteOrder(o.id)}
                        style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4, opacity: 0.7 }}
                      >
                        <Trash2 size={15} />
                      </button>
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
                {selected.status === 'pending' ? (
                  ['pending', 'delivered'].map(s => (
                    <button key={s} onClick={() => {
                      if (s === 'delivered') {
                        setPaymentPromptOrder(selected)
                      } else {
                        handleStatus(selected.id, s); 
                        setSelected({ ...selected, status: s })
                      }
                    }}
                      style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid ${selected.status === s ? statusColor[s] : 'var(--glass-border)'}`, background: selected.status === s ? `${statusColor[s]}15` : 'transparent', color: selected.status === s ? statusColor[s] : 'var(--text-muted)', cursor: 'pointer' }}>
                      {s}
                    </button>
                  ))
                ) : (
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>Delivered</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Payment Selection Modal */}
      {paymentPromptOrder && (
        <div className="modal-overlay" style={{ zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }} onClick={() => setPaymentPromptOrder(null)}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            onClick={e => e.stopPropagation()}
            style={{ 
              background: 'var(--bg-dark)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: 16, 
              padding: 24, 
              width: '90%', 
              maxWidth: 400,
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--text-main)', marginBottom: 8 }}>Select Payment Method</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Choose the payment option to transition Order #{paymentPromptOrder.id.slice(-6).toUpperCase()} to Delivered:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { id: 'UPI', icon: Smartphone, label: 'UPI' },
                { id: 'Card', icon: CreditCard, label: 'Card' },
                { id: 'Cash', icon: Banknote, label: 'Cash' }
              ].map(method => {
                const Icon = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => handleDeliverCredit(paymentPromptOrder.id, method.id)}
                    className="btn-gold"
                    style={{ padding: '16px 8px', borderRadius: 10, fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
                  >
                    <Icon size={20} />
                    {method.label}
                  </button>
                )
              })}
            </div>
            <button 
              onClick={() => setPaymentPromptOrder(null)} 
              className="btn-dark" 
              style={{ width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, border: '1px solid var(--glass-border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
