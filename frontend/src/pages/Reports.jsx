import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Download, TrendingUp, Calendar, BarChart2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'rgba(15,23,11,0.96)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ color: 'var(--accent-light)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>
          {p.name === 'revenue' ? '₹' : ''}{p.value?.toLocaleString()} {p.name !== 'revenue' ? p.name : ''}
        </div>
      ))}
    </div>
  )
  return null
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  if (percent < 0.06) return null
  return <text x={x} y={y} fill="var(--text-main)" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600 }}>{`${(percent * 100).toFixed(0)}%`}</text>
}

export default function Reports() {
  const { orders, products } = useApp()
  const [period, setPeriod] = useState('weekly')

  const chartData = useMemo(() => {
    const range = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 14
    const days = eachDayOfInterval({ start: subDays(new Date(), range - 1), end: new Date() })
    return days.map(day => {
      const dayOrders = orders.filter(o => isSameDay(new Date(o.createdAt), day) && o.status !== 'cancelled')
      return {
        day: format(day, 'dd MMM'),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length
      }
    })
  }, [orders, period])

  const categoryData = useMemo(() => {
    const categories = {}
    orders.filter(o => o.status !== 'cancelled').forEach(o => {
      o.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        const cat = product?.category || 'Uncategorized'
        categories[cat] = (categories[cat] || 0) + (item.price * item.qty)
      })
    })
    const total = Object.values(categories).reduce((s, v) => s + v, 0)
    const COLORS = ['#8CB874', '#C5E1A5', '#A5D6A7', '#66BB6A', '#2E7D32']
    return Object.entries(categories).map(([name, value], i) => ({
      name,
      value: total > 0 ? (value / total) * 100 : 0,
      actualValue: value,
      color: COLORS[i % COLORS.length]
    }))
  }, [orders, products])

  const dataKey = 'day'
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const totalOrders = orders.filter(o => o.status !== 'cancelled').length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Top products by orders
  const productSales = {}
  orders.filter(o => o.status !== 'cancelled').forEach(o => {
    o.items.forEach(item => {
      if (!productSales[item.name]) productSales[item.name] = { name: item.name, qty: 0, revenue: 0 }
      productSales[item.name].qty += item.qty
      productSales[item.name].revenue += item.price * item.qty
    })
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 6)

  // Payment breakdown
  const paymentBreakdown = orders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1
    return acc
  }, {})
  const payData = Object.entries(paymentBreakdown).map(([name, value]) => ({ name, value }))
  const PAY_COLORS = { UPI: '#8CB874', Card: '#C5E1A5', Cash: '#60a5fa' }

  const handleExport = () => {
    const rows = [
      ['Order ID', 'Customer', 'Date', 'Subtotal', 'Total', 'Payment', 'Status'],
      ...orders.map(o => [o.id, o.customerName, format(new Date(o.createdAt), 'dd/MM/yyyy'), o.subtotal, o.total, o.paymentMethod, o.status])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'nineteen06_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--text-main)', fontWeight: 700, marginBottom: 4 }}>Reports & Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Business insights and performance metrics</p>
        </div>
        <button onClick={handleExport} className="btn-outline-gold" style={{ padding: '9px 18px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, borderColor: 'var(--accent-gold)', color: 'var(--accent-light)' }}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: 'var(--accent-gold)', icon: TrendingUp },
          { label: 'Total Orders', value: totalOrders, color: '#689F38', icon: BarChart2 },
          { label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(0)}`, color: '#8BC34A', icon: TrendingUp },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '18px', border: '1px solid var(--glass-border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${color},transparent)` }} />
            <Icon size={18} color={color} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 }}>{label}</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div className="glass-card" style={{ padding: 22, marginBottom: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600 }}>Revenue Trend</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Sales performance over time</div>
          </div>
          <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: 8, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            {['weekly', 'monthly', 'daily'].map(m => (
              <button key={m} onClick={() => setPeriod(m)} style={{ padding: '6px 12px', fontSize: 11, border: 'none', cursor: 'pointer', fontWeight: 600, background: period === m ? 'rgba(104, 159, 56, 0.15)' : 'transparent', color: period === m ? 'var(--accent-light)' : 'var(--text-muted)', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(104, 159, 56, 0.1)" />
            <XAxis dataKey={dataKey} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="var(--accent-gold)" radius={[5, 5, 0, 0]} opacity={0.8} name="revenue" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Two Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Category Pie */}
        <motion.div className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600, marginBottom: 4 }}>Sales by Category</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Product category breakdown</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12, color: 'var(--text-main)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {categoryData.map(({ name, color }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600, marginBottom: 4 }}>Payment Methods</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>How customers pay</div>
          {payData.map(({ name, value }) => {
            const pct = orders.length > 0 ? Math.round((value / orders.length) * 100) : 0
            return (
              <div key={name} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{name}</span>
                  <span style={{ color: PAY_COLORS[name] || 'var(--accent-gold)', fontWeight: 700 }}>{pct}% · {value} orders</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 }}
                    style={{ height: '100%', background: PAY_COLORS[name] || 'var(--accent-gold)', borderRadius: 3 }} />
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div className="glass-card" style={{ padding: 22 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', fontWeight: 600, marginBottom: 4 }}>Top Selling Products</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>By revenue generated</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-dark">
            <thead>
              <tr><th>Rank</th><th>Product</th><th>Qty Sold</th><th>Revenue</th><th>Share</th></tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.name}>
                  <td>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: i < 3 ? 'rgba(104, 159, 56, 0.15)' : 'var(--input-bg)', border: `1px solid ${i < 3 ? 'var(--accent-gold)' : 'var(--glass-border)'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i < 3 ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</td>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{p.qty}</td>
                  <td style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>₹{p.revenue.toFixed(0)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--input-bg)', border: '1px solid var(--glass-border)', overflow: 'hidden', maxWidth: 80 }}>
                        <div style={{ height: '100%', width: topProducts[0].revenue > 0 ? `${(p.revenue / topProducts[0].revenue) * 100}%` : '0%', background: 'linear-gradient(90deg,var(--accent-gold),#AED581)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(0) : 0}%</span>
                    </div>
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
