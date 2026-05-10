import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, Receipt, Users, ArrowUpRight, Zap, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, subDays, startOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--accent-gold)', fontSize: 14, fontWeight: 700 }}>₹{payload[0].value?.toLocaleString()}</div>
      </div>
    )
  }
  return null
}

function StatCard({ icon: Icon, label, value, change, color, delay }) {
  const [displayed, setDisplayed] = useState(0)
  const numValue = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0

  useEffect(() => {
    let start = 0
    const steps = 40
    const inc = numValue / steps
    if (numValue === 0) { setDisplayed(0); return }
    const timer = setInterval(() => {
      start += inc
      if (start >= numValue) { setDisplayed(numValue); clearInterval(timer) }
      else setDisplayed(Math.floor(start))
    }, 30)
    return () => clearInterval(timer)
  }, [numValue])

  return (
    <motion.div className="stat-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}30` }}>
          <Icon size={19} color={color} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: change.startsWith('+') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 999, padding: '3px 9px', border: `1px solid ${change.startsWith('+') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
          <ArrowUpRight size={12} color={change.startsWith('+') ? '#2e7d32' : '#d32f2f'} style={{ transform: change.startsWith('+') ? 'none' : 'rotate(90deg)' }} />
          <span style={{ fontSize: 11, color: change.startsWith('+') ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>{change}</span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 800, color: 'var(--text-main)' }}>
        {value.toString().startsWith('₹') ? `₹${displayed.toLocaleString()}` : displayed.toLocaleString()}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { orders, getTodayRevenue, getTodayOrders, getMonthlyRevenue, getTotalGST, analytics, deleteOrder, updatePaymentStatus } = useApp()
  const [chartMode, setChartMode] = useState('weekly')

  const chartData = useMemo(() => {
    if (chartMode === 'weekly') {
      const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
      return days.map(day => {
        const dayOrders = orders.filter(o => isSameDay(new Date(o.createdAt), day) && o.status !== 'cancelled')
        return {
          day: format(day, 'EEE'),
          revenue: dayOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
        }
      })
    } else {
      const data = []
      for (let i = 5; i >= 0; i--) {
        const date = subDays(new Date(), i * 30)
        const monthOrders = orders.filter(o => format(new Date(o.createdAt), 'MMM yyyy') === format(date, 'MMM yyyy') && o.status !== 'cancelled')
        data.push({
          month: format(date, 'MMM'),
          revenue: monthOrders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
        })
      }
      return data
    }
  }, [orders, chartMode])

  const dataKey = chartMode === 'weekly' ? 'day' : 'month'
  const recentOrders = orders.slice(0, 5)
  const aiPredictions = analytics?.predictions || []

  const statusColor = { pending: '#fbbf24', preparing: '#60a5fa', ready: '#8CB874', delivered: '#4ade80', cancelled: '#f87171' }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{format(new Date(), 'EEEE, MMMM d yyyy')} · Welcome back to Nineteen06</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={TrendingUp} label="Today's Revenue" value={`₹${Math.round(getTodayRevenue() || 0)}`} change="0%" color="#8CB874" delay={0} />
        <StatCard icon={ShoppingBag} label="Today's Orders" value={getTodayOrders() || 0} change="0" color="#60a5fa" delay={0.08} />
        <StatCard icon={Receipt} label="Monthly Revenue" value={`₹${Math.round(getMonthlyRevenue() || 0)}`} change="0%" color="#8CB874" delay={0.16} />
        <StatCard icon={Users} label="Total GST Collected" value={`₹${Math.round(getTotalGST() || 0)}`} change="GST 5%" color="#4ade80" delay={0.24} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Revenue Chart */}
        <motion.div className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600 }}>Revenue Overview</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Sales performance</div>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.8)', borderRadius: 8, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              {['weekly', 'monthly'].map(m => (
                <button key={m} onClick={() => setChartMode(m)} style={{ padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer', fontWeight: 500, background: chartMode === m ? 'rgba(104,159,56,0.1)' : 'transparent', color: chartMode === m ? 'var(--accent-light)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(104,159,56,0.1)" />
              <XAxis dataKey={dataKey} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="var(--accent-gold)" radius={[5,5,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* AI Prediction Widget */}
        <motion.div className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(140,184,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#8CB874" />
            </div>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 600 }}>AI Sales Prediction</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Next 7-day forecast</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={aiPredictions}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,184,116,0.06)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="actual" stroke="#8CB874" strokeWidth={2} dot={{ r: 3, fill: '#8CB874' }} />
              <Line type="monotone" dataKey="predicted" stroke="#AED581" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: '#AED581' }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 3, background: '#8CB874', borderRadius: 2 }} /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Actual</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 10, height: 3, background: '#AED581', borderRadius: 2 }} /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Predicted</span></div>
          </div>
          <div style={{ marginTop: 16, padding: '10px 12px', background: 'rgba(140,184,116,0.08)', borderRadius: 8, border: '1px solid rgba(140,184,116,0.15)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>Sunday Forecast</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 20, color: '#AED581', fontWeight: 700 }}>₹9,200</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>↑ 15% vs last week</div>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600 }}>Recent Orders</div>
          <a href="/orders" style={{ fontSize: 12, color: 'var(--accent-gold)', textDecoration: 'none' }}>View all →</a>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-dark">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Total</th><th>Method</th><th>Due Date</th><th>Payment</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{o.id.slice(-6).toUpperCase()}</td>
                  <td>{o.customerName}</td>
                  <td style={{ fontWeight: 600 }}>₹{o.total.toFixed(0)}</td>
                  <td><span className="badge-gold" style={{ fontSize: 10 }}>{o.paymentMethod}</span></td>
                  <td style={{ color: o.paymentMethod === 'Credit' ? '#f87171' : 'var(--text-muted)', fontSize: 12 }}>
                    {o.dueDate ? format(new Date(o.dueDate), 'MMM d') : '-'}
                  </td>
                  <td>
                    {o.paymentStatus === 'paid' ? (
                      <span className="badge-success" style={{ fontSize: 10 }}>Received</span>
                    ) : (
                      <button 
                        onClick={() => window.confirm('Mark this credit as received?') && updatePaymentStatus(o.id, 'paid')}
                        className="badge-warning" style={{ fontSize: 10, cursor: 'pointer', border: '1px solid #fbbf24' }}
                      >
                        Pending
                      </button>
                    )}
                  </td>
                  <td><span className="badge" style={{ background: `${statusColor[o.status]}18`, color: statusColor[o.status], border: `1px solid ${statusColor[o.status]}30`, fontSize: 10 }}>{o.status}</span></td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.confirm('Are you sure you want to delete this order? All stock will be restored.') && deleteOrder(o.id) }}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: 4, opacity: 0.7 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
