import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, Trash2, Clock, User, Store, Receipt, CheckCircle2,
  Zap, Search, CreditCard, Smartphone, Banknote, Calendar, RotateCcw
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function CurrentOrder() {
  const { orders } = useApp()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'Walk-in' | 'Takeaway'

  // Local state for orders dismissed from Current Order view ONLY (does NOT affect backend/database/reports)
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed_current_orders') || '[]')
    } catch {
      return []
    }
  })

  const safeOrders = Array.isArray(orders) ? orders : []

  // Compute daily sequence order number (resetting every day 12:00 AM - 11:59 PM)
  const dailyOrderMap = new Map()
  const sortedChronological = [...safeOrders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const dayCounts = {}
  sortedChronological.forEach(o => {
    const dateKey = format(new Date(o.createdAt || Date.now()), 'yyyy-MM-dd')
    dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1
    dailyOrderMap.set(o.id, dayCounts[dateKey])
  })

  // Get orders created today excluding dismissed ones
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayOrders = safeOrders
    .filter(o => !dismissedIds.includes(o.id))
    .filter(o => {
      const orderDateStr = format(new Date(o.createdAt || Date.now()), 'yyyy-MM-dd')
      return orderDateStr === todayStr
    })

  // Filter based on search & orderType
  const filteredOrders = todayOrders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.items?.some(i => i.name.toLowerCase().includes(search.toLowerCase()))
    const matchesType = filterType === 'all' || (o.orderType || 'Walk-in') === filterType
    return matchesSearch && matchesType
  })

  const latestOrder = todayOrders.length > 0 ? todayOrders[0] : null

  // Dismiss order from Current Order view ONLY
  const handleDismiss = (orderId) => {
    const next = [...dismissedIds, orderId]
    setDismissedIds(next)
    localStorage.setItem('dismissed_current_orders', JSON.stringify(next))
    toast.success('Removed from Current Order view (Saved in Order Management & Reports)')
  }

  // Restore all dismissed items for today
  const handleRestore = () => {
    setDismissedIds([])
    localStorage.removeItem('dismissed_current_orders')
    toast.success('Restored all current order views')
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI': return <Smartphone size={14} />
      case 'Card': return <CreditCard size={14} />
      case 'Cash': return <Banknote size={14} />
      default: return <Clock size={14} />
    }
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--text-main)', fontWeight: 700, margin: 0 }}>
              Current Order
            </h1>
            <span className="badge" style={{ background: 'rgba(140,184,116,0.15)', color: 'var(--accent-light)', border: '1px solid rgba(140,184,116,0.3)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px' }}>
              <Zap size={13} /> Live Feed
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
            Live customer billing enquiry feed (Clearing here does not delete from Order Management or Reports)
          </p>
        </div>

        {/* Date Pill & Restore Option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {dismissedIds.length > 0 && (
            <button
              onClick={handleRestore}
              style={{
                background: 'rgba(140, 184, 116, 0.12)',
                border: '1px solid var(--glass-border)',
                color: 'var(--accent-light)',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <RotateCcw size={14} /> Restore Feed ({dismissedIds.length})
            </button>
          )}

          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent-gold)' }}>
            <Calendar size={15} />
            <span>{format(new Date(), 'EEEE, dd MMMM yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-dark"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search current orders or items (e.g. Brownie, Name)..."
            style={{ paddingLeft: 36, height: 42 }}
          />
        </div>

        {/* Order Type Filter Pills */}
        <div style={{ display: 'flex', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: 3 }}>
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'Walk-in', label: 'Walk-in' },
            { id: 'Takeaway', label: 'Takeaway' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                background: filterType === f.id ? 'var(--accent-gold)' : 'transparent',
                color: filterType === f.id ? '#0F170B' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 20 }}
        >
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(140,184,116,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <ShoppingBag size={32} color="var(--accent-gold)" />
          </div>
          <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--text-main)', marginBottom: 8 }}>
            No Current Orders in View
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 420, margin: '0 auto 16px' }}>
            When an admin confirms a payment on the <b>New Billing</b> page, customer purchases will show up here.
          </p>
          {dismissedIds.length > 0 && (
            <button
              onClick={handleRestore}
              style={{
                background: 'var(--accent-gold)',
                color: '#0F170B',
                border: 'none',
                borderRadius: 10,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <RotateCcw size={15} /> Restore {dismissedIds.length} Dismissed Feed Orders
            </button>
          )}
        </motion.div>
      )}

      {/* Latest Order Hero Banner */}
      {latestOrder && !search && filterType === 'all' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(140, 184, 116, 0.12), rgba(15, 23, 11, 0.8))',
            border: '1px solid var(--accent-gold)',
            borderRadius: 20,
            padding: 24,
            marginBottom: 28,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: 'var(--accent-gold)', color: '#0F170B', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '1px' }}>
              ★ Latest Confirmed Billing
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>
            {/* Left Side */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-light)' }}>
                  Today Order #{dailyOrderMap.get(latestOrder.id) || 1}
                </span>
                <span className="badge" style={{ background: latestOrder.orderType === 'Takeaway' ? 'rgba(96,165,250,0.2)' : 'rgba(140,184,116,0.2)', color: latestOrder.orderType === 'Takeaway' ? '#60a5fa' : 'var(--accent-light)', border: '1px solid var(--glass-border)' }}>
                  {latestOrder.orderType === 'Takeaway' ? <ShoppingBag size={12} /> : <Store size={12} />}
                  {latestOrder.orderType || 'Walk-in'}
                </span>
              </div>

              <div style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 600, marginBottom: 4 }}>
                Customer: {latestOrder.customerName}
                {latestOrder.customerPhone && <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 400 }}> ({latestOrder.customerPhone})</span>}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} color="var(--accent-gold)" />
                  {format(new Date(latestOrder.createdAt || Date.now()), 'hh:mm:ss a')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {getMethodIcon(latestOrder.paymentMethod)}
                  Paid via <b>{latestOrder.paymentMethod}</b>
                </span>
              </div>
            </div>

            {/* Right Side */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', uppercase: 'true', letterSpacing: '0.5px' }}>Total Paid</div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 800, color: 'var(--accent-light)' }}>
                ₹{latestOrder.total?.toFixed(2)}
              </div>

              <button
                onClick={() => handleDismiss(latestOrder.id)}
                title="Remove from Current Order view (Preserves order in Order Management & Reports)"
                style={{
                  marginTop: 12,
                  background: 'rgba(248, 113, 113, 0.12)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  color: '#f87171',
                  padding: '7px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.12)'}
              >
                <Trash2 size={14} /> Clear from View
              </button>
            </div>
          </div>

          {/* Purchased Items List */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px dashed var(--glass-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: 10 }}>
              Purchased Items ({latestOrder.items?.length || 0})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {latestOrder.items?.map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(15, 23, 11, 0.5)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty: {item.qty} × ₹{item.price}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-light)' }}>
                    ₹{(item.price * item.qty).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Orders Grid / Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        <AnimatePresence>
          {filteredOrders.map((order, index) => {
            const dailyNum = dailyOrderMap.get(order.id) || (filteredOrders.length - index)
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card"
                style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--glass-border)', borderRadius: 16 }}
              >
                <div>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        background: 'rgba(140, 184, 116, 0.18)',
                        color: 'var(--accent-light)',
                        border: '1px solid rgba(140, 184, 116, 0.3)',
                        padding: '3px 9px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 800
                      }}>
                        Today Order #{dailyNum}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--accent-gold)', fontWeight: 600 }}>
                        {order.customId || order.id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDismiss(order.id)}
                      title="Clear from Current View (Preserves order in Order Management, Invoices & Reports)"
                      style={{
                        background: 'rgba(248, 113, 113, 0.1)',
                        border: '1px solid rgba(248, 113, 113, 0.25)',
                        color: '#f87171',
                        padding: '5px 8px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                    >
                      <Trash2 size={13} /> Clear
                    </button>
                  </div>

                  {/* Customer & Type */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                        {order.customerName}
                      </div>
                      {order.customerPhone && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {order.customerPhone}
                        </div>
                      )}
                    </div>
                    <span className="badge" style={{
                      background: order.orderType === 'Takeaway' ? 'rgba(96,165,250,0.15)' : 'rgba(140,184,116,0.15)',
                      color: order.orderType === 'Takeaway' ? '#60a5fa' : 'var(--accent-light)',
                      border: `1px solid ${order.orderType === 'Takeaway' ? 'rgba(96,165,250,0.3)' : 'rgba(140,184,116,0.3)'}`
                    }}>
                      {order.orderType || 'Walk-in'}
                    </span>
                  </div>

                  {/* Purchased Items List */}
                  <div style={{ background: 'rgba(15, 23, 11, 0.4)', borderRadius: 10, padding: 12, marginBottom: 14, border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', uppercase: 'true', letterSpacing: '0.5px', marginBottom: 6 }}>
                      ITEMS BOUGHT ({order.items?.length || 0})
                    </div>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                          {item.name} <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>× {item.qty}</span>
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          ₹{(item.price * item.qty).toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Details & Total */}
                <div style={{ paddingTop: 10, borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>Payment: <b style={{ color: 'var(--text-main)' }}>{order.paymentMethod}</b></span>
                    <span>{format(new Date(order.createdAt || Date.now()), 'hh:mm a')}</span>
                  </div>

                  {order.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8CB874', marginBottom: 4 }}>
                      <span>Discount</span><span>-₹{order.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</span>
                    <span style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 700, color: 'var(--accent-light)' }}>
                      ₹{order.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
