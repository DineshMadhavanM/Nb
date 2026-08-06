import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingBag, Receipt, Users, ArrowUpRight, Percent } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, subDays, startOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const dateStr = data.fullDate || label
    const count = data.ordersCount ?? 0
    const rev = payload[0].value || 0

    return (
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        minWidth: 160
      }}>
        <div style={{ color: 'var(--text-main)', fontSize: 13, fontWeight: 700, marginBottom: 6, borderBottom: '1px solid var(--glass-border)', paddingBottom: 4 }}>
          {dateStr}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Day:</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{data.dayName || label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Orders:</span>
            <span style={{ color: '#60a5fa', fontWeight: 700 }}>{count} {count === 1 ? 'order' : 'orders'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Revenue:</span>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>₹{rev.toLocaleString('en-IN')}</span>
          </div>
        </div>
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
  const { 
    orders, getTodayRevenue, getTodayOrders, getTodayDiscounts, getTotalDiscounts, 
    getMonthlyRevenue, getTotalGST, analytics 
  } = useApp()
  const [chartMode, setChartMode] = useState('weekly')

  const chartData = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : []
    if (chartMode === 'weekly') {
      const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
      return days.map(day => {
        const dayOrders = safeOrders.filter(o => {
          const orderDate = o.paidAt ? new Date(o.paidAt) : new Date(o.createdAt)
          return isSameDay(orderDate, day) && o.status !== 'cancelled' && o.paymentStatus === 'paid'
        })
        return {
          day: format(day, 'EEE'),
          dayName: format(day, 'EEEE'),
          fullDate: format(day, 'EEEE, MMM d, yyyy'),
          revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          ordersCount: dayOrders.length
        }
      })
    } else {
      const data = []
      for (let i = 5; i >= 0; i--) {
        const date = subDays(new Date(), i * 30)
        const monthOrders = safeOrders.filter(o => {
          const orderDate = o.paidAt ? new Date(o.paidAt) : new Date(o.createdAt)
          return format(orderDate, 'MMM yyyy') === format(date, 'MMM yyyy') && o.status !== 'cancelled' && o.paymentStatus === 'paid'
        })
        data.push({
          month: format(date, 'MMM'),
          dayName: format(date, 'MMMM yyyy'),
          fullDate: format(date, 'MMMM yyyy'),
          revenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          ordersCount: monthOrders.length
        })
      }
      return data
    }
  }, [orders, chartMode])

  const dataKey = chartMode === 'weekly' ? 'day' : 'month'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{format(new Date(), 'EEEE, MMMM d yyyy')} · Welcome back to Nineteen06</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={TrendingUp} label="Today's Revenue" value={`₹${Math.round(getTodayRevenue() || 0)}`} change="0%" color="#8CB874" delay={0} />
        <StatCard icon={ShoppingBag} label="Today's Orders" value={getTodayOrders() || 0} change="0" color="#60a5fa" delay={0.08} />
        <StatCard icon={Percent} label="Today's Discounts" value={`₹${Math.round(getTodayDiscounts() || 0)}`} change="OFF" color="#f87171" delay={0.12} />
        <StatCard icon={Receipt} label="Monthly Revenue" value={`₹${Math.round(getMonthlyRevenue() || 0)}`} change="0%" color="#8CB874" delay={0.16} />
        <StatCard icon={Percent} label="Total Discounts" value={`₹${Math.round(getTotalDiscounts() || 0)}`} change="TOTAL" color="#fbbf24" delay={0.2} />
        <StatCard icon={Users} label="Total GST Collected" value={`₹${Math.round(getTotalGST() || 0)}`} change="GST 5%" color="#4ade80" delay={0.24} />
      </div>

      {/* Revenue Chart — full width */}
      <motion.div className="glass-card" style={{ padding: 22, marginBottom: 24 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600 }}>Revenue Overview</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Sales performance</div>
          </div>
          <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: 8, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            {['weekly', 'monthly'].map(m => (
              <button key={m} onClick={() => setChartMode(m)} style={{ padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer', fontWeight: 500, background: chartMode === m ? 'rgba(104,159,56,0.1)' : 'transparent', color: chartMode === m ? 'var(--accent-light)' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(104,159,56,0.1)" />
            <XAxis dataKey={dataKey} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(104,159,56,0.08)', radius: 8 }} />
            <Bar dataKey="revenue" fill="var(--accent-gold)" radius={[5,5,0,0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}
