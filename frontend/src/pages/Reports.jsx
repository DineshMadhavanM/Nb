import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, TrendingUp, ShoppingBag, CreditCard, ArrowUpRight, ArrowDownRight, BarChart2, PieChart as PieIcon, List } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'

/* ── Flutter-style Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--accent-gold)', fontSize: 15, fontWeight: 800 }}>
          {p.name === 'revenue' ? `₹${Number(p.value).toLocaleString('en-IN')}` : p.value}
        </div>
      ))}
    </div>
  )
  return null
}

const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" style={{ fontSize: 11, fontWeight: 700 }}>{`${(percent * 100).toFixed(0)}%`}</text>
}

/* ── Reusable Flutter Card ── */
const FCard = ({ children, style = {}, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
    style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--glass-border)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', ...style }}
  >
    {children}
  </motion.div>
)

/* ── Section Header ── */
const SectionHeader = ({ title, subtitle, icon: Icon, color = 'var(--accent-gold)' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '18px 18px 0' }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={17} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  </div>
)

/* ── Pill Tab Row ── */
const PillTabs = ({ options, active, onChange }) => (
  <div style={{ display: 'flex', gap: 6, padding: '4px', background: 'var(--input-bg)', borderRadius: 12, border: '1px solid var(--glass-border)' }}>
    {options.map(opt => (
      <button key={opt.value} onClick={() => onChange(opt.value)}
        style={{ flex: 1, padding: '7px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
          background: active === opt.value ? 'var(--accent-gold)' : 'transparent',
          color: active === opt.value ? '#0F170B' : 'var(--text-muted)',
          transition: 'all 0.22s ease' }}>
        {opt.label}
      </button>
    ))}
  </div>
)

export default function Reports() {
  const { orders, products, getTodayRevenue, getMonthlyRevenue } = useApp()
  const [period, setPeriod] = useState('7D')
  const [activeTab, setActiveTab] = useState('overview')

  /* ── Chart Data ── */
  const chartData = useMemo(() => {
    const range = period === '7D' ? 7 : period === '30D' ? 30 : 14
    const days = eachDayOfInterval({ start: subDays(new Date(), range - 1), end: new Date() })
    return days.map(day => {
      const dayPaid = orders.filter(o => {
        const d = o.paidAt ? new Date(o.paidAt) : new Date(o.createdAt)
        return isSameDay(d, day) && o.status !== 'cancelled' && o.paymentStatus === 'paid'
      })
      const dayAll = orders.filter(o => isSameDay(new Date(o.createdAt), day) && o.status !== 'cancelled')
      return {
        day: format(day, period === '7D' ? 'EEE' : 'dd MMM'),
        revenue: dayPaid.reduce((s, o) => s + o.total, 0),
        orders: dayAll.length
      }
    })
  }, [orders, period])

  /* ── Category Pie ── */
  const categoryData = useMemo(() => {
    const cats = {}
    orders.filter(o => o.status !== 'cancelled').forEach(o =>
      o.items.forEach(item => {
        const cat = products.find(p => p.id === item.productId)?.category || 'Other'
        cats[cat] = (cats[cat] || 0) + item.price * item.qty
      })
    )
    const total = Object.values(cats).reduce((s, v) => s + v, 0)
    const COLORS = ['#8CB874', '#60a5fa', '#f59e0b', '#a78bfa', '#34d399', '#f87171']
    return Object.entries(cats).map(([name, value], i) => ({
      name, value: total > 0 ? +((value / total) * 100).toFixed(1) : 0,
      actualValue: value, color: COLORS[i % COLORS.length]
    }))
  }, [orders, products])

  /* ── KPIs ── */
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const totalOrders  = orders.filter(o => o.status !== 'cancelled').length
  const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const todayRevenue = getTodayRevenue()
  const monthlyRevenue = getMonthlyRevenue()

  /* ── Top Products ── */
  const productSales = {}
  orders.filter(o => o.status !== 'cancelled').forEach(o =>
    o.items.forEach(item => {
      if (!productSales[item.name]) productSales[item.name] = { name: item.name, qty: 0, revenue: 0 }
      productSales[item.name].qty += item.qty
      productSales[item.name].revenue += item.price * item.qty
    })
  )
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 6)

  /* ── Payment Stats ── */
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const PAY_METHODS = ['UPI', 'Card', 'Cash', 'Credit']
  const PAY_COLORS  = { UPI: '#8CB874', Card: '#60a5fa', Cash: '#f59e0b', Credit: '#f87171' }
  const PAY_BG      = { UPI: 'rgba(140,184,116,0.12)', Card: 'rgba(96,165,250,0.12)', Cash: 'rgba(245,158,11,0.12)', Credit: 'rgba(248,113,113,0.12)' }
  const PAY_ICONS   = { UPI: '📱', Card: '💳', Cash: '💵', Credit: '🕐' }

  const todayPaid   = orders.filter(o => { const d = o.paidAt ? new Date(o.paidAt) : new Date(o.createdAt); return d >= todayStart && o.paymentStatus === 'paid' && o.status !== 'cancelled' })
  const todayCredit = orders.filter(o => { const d = new Date(o.createdAt); return d >= todayStart && o.paymentMethod === 'Credit' && o.status !== 'cancelled' })

  const payStats = PAY_METHODS.map(method => {
    if (method === 'Credit') return { method, count: todayCredit.length, revenue: todayCredit.reduce((s, o) => s + o.total, 0), isPending: true }
    const m = todayPaid.filter(o => o.paymentMethod === method)
    return { method, count: m.length, revenue: m.reduce((s, o) => s + o.total, 0), isPending: false }
  })

  /* ── CSV Export ── */
  const handleExport = () => {
    const rows = [
      ['Order ID', 'Customer', 'Date', 'Subtotal', 'Total', 'Payment', 'Status'],
      ...orders.map(o => [o.id, o.customerName, format(new Date(o.createdAt), 'dd/MM/yyyy'), o.subtotal, o.total, o.paymentMethod, o.status])
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 32 }}>

      {/* ── App Bar ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, color: 'var(--text-main)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>Business performance insights</p>
        </div>
        <button onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, border: '1.5px solid var(--accent-gold)', background: 'rgba(104,159,56,0.08)', color: 'var(--accent-light)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
          <Download size={14} /> Export
        </button>
      </motion.div>

      {/* ── Tab Navigation (Flutter NavigationBar style) ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: 16, border: '1px solid var(--glass-border)', padding: 4, marginBottom: 20, gap: 4 }}>
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'products', label: 'Products', icon: List }
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.22s ease',
              background: activeTab === id ? 'rgba(104,159,56,0.12)' : 'transparent',
              color: activeTab === id ? 'var(--accent-light)' : 'var(--text-muted)' }}>
            <Icon size={18} strokeWidth={activeTab === id ? 2.5 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: activeTab === id ? 700 : 500 }}>{label}</span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ══════════════ OVERVIEW TAB ══════════════ */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

            {/* Hero Revenue Card */}
            <FCard delay={0} style={{ marginBottom: 14, background: 'linear-gradient(135deg, rgba(104,159,56,0.18) 0%, var(--card-bg) 60%)' }}>
              <div style={{ padding: '20px 20px 6px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Total Revenue (All Time)</div>
                <div style={{ fontFamily: 'Playfair Display', fontSize: 38, fontWeight: 900, color: 'var(--accent-gold)', lineHeight: 1 }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, alignItems: 'center' }}>
                  <ArrowUpRight size={14} color="#8CB874" />
                  <span style={{ fontSize: 12, color: '#8CB874', fontWeight: 600 }}>₹{todayRevenue.toLocaleString('en-IN')} today</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
                  <span style={{ fontSize: 12, color: '#60a5fa', fontWeight: 600 }}>₹{monthlyRevenue.toLocaleString('en-IN')} this month</span>
                </div>
              </div>
              {/* Mini Stat Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--glass-border)', marginTop: 14 }}>
                {[
                  { label: 'Total Orders', value: totalOrders, color: '#8CB874' },
                  { label: 'Avg. Order', value: `₹${avgOrder.toFixed(0)}`, color: '#60a5fa' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderLeft: i > 0 ? '1px solid var(--glass-border)' : 'none' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 800, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </FCard>

            {/* Revenue Chart */}
            <FCard delay={0.08} style={{ marginBottom: 14 }}>
              <div style={{ padding: '18px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Revenue Trend</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Collected payments over time</div>
                </div>
                <PillTabs
                  options={[{ value: '7D', label: '7D' }, { value: '14D', label: '14D' }, { value: '30D', label: '30D' }]}
                  active={period} onChange={setPeriod}
                />
              </div>
              <div style={{ padding: '16px 8px 12px' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(104,159,56,0.08)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} width={38} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(104,159,56,0.06)', radius: 8 }} />
                    <Bar dataKey="revenue" name="revenue" radius={[8, 8, 0, 0]}
                      fill="url(#barGrad)" />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8CB874" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#4a7c2f" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FCard>

            {/* Category Breakdown */}
            <FCard delay={0.14} style={{ marginBottom: 14 }}>
              <SectionHeader title="Sales by Category" subtitle="Product category breakdown" icon={PieIcon} color="#60a5fa" />
              <div style={{ padding: '12px 18px 4px', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: '0 0 140px' }}>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={38} outerRadius={66} dataKey="value" labelLine={false} label={renderCustomLabel} paddingAngle={3}>
                        {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`, 'Share']} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categoryData.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>No data yet</div>}
                  {categoryData.map(({ name, color, value, actualValue }) => (
                    <div key={name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: 'var(--text-main)', fontWeight: 600, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{value}%</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'var(--input-bg)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, delay: 0.3 }}
                          style={{ height: '100%', background: color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 16 }} />
            </FCard>

          </motion.div>
        )}

        {/* ══════════════ PAYMENTS TAB ══════════════ */}
        {activeTab === 'payments' && (
          <motion.div key="payments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

            {/* Today Revenue Summary */}
            <FCard delay={0} style={{ marginBottom: 14 }}>
              <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <div style={{ paddingRight: 16, borderRight: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Today's Revenue</div>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 900, color: 'var(--accent-gold)' }}>₹{todayRevenue.toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <ArrowUpRight size={12} color="#8CB874" />
                    <span style={{ fontSize: 11, color: '#8CB874', fontWeight: 600 }}>Collected</span>
                  </div>
                </div>
                <div style={{ paddingLeft: 16 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 5 }}>Monthly Revenue</div>
                  <div style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 900, color: '#60a5fa' }}>₹{monthlyRevenue.toLocaleString('en-IN')}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <ArrowUpRight size={12} color="#60a5fa" />
                    <span style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600 }}>This month</span>
                  </div>
                </div>
              </div>
            </FCard>

            {/* Payment Method Cards */}
            <FCard delay={0.06} style={{ marginBottom: 14 }}>
              <SectionHeader title="Today's Payment Breakdown" subtitle="Per payment method" icon={CreditCard} color="var(--accent-gold)" />
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {payStats.map(({ method, count, revenue, isPending }, i) => (
                  <motion.div key={method} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 + 0.15 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14,
                      background: PAY_BG[method], border: `1px solid ${PAY_COLORS[method]}22` }}>
                    {/* Icon Chip */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${PAY_COLORS[method]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {PAY_ICONS[method]}
                    </div>
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{method}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                        {count} payment{count !== 1 ? 's' : ''} today
                      </div>
                    </div>
                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Playfair Display', fontSize: 17, fontWeight: 800, color: isPending ? '#f87171' : PAY_COLORS[method] }}>
                        {isPending ? `(-)` : ''} ₹{revenue.toLocaleString('en-IN')}
                      </div>
                      {isPending && (
                        <div style={{ fontSize: 10, color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>Pending</div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </FCard>

            {/* Pending Credit Warning */}
            {payStats.find(p => p.method === 'Credit')?.revenue > 0 && (
              <FCard delay={0.28} style={{ marginBottom: 14, background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 22 }}>⚠️</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 2 }}>Credit Pending Collection</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      ₹{payStats.find(p => p.method === 'Credit')?.revenue.toLocaleString('en-IN')} owed today. Mark orders as Delivered to collect.
                    </div>
                  </div>
                </div>
              </FCard>
            )}

          </motion.div>
        )}

        {/* ══════════════ PRODUCTS TAB ══════════════ */}
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>

            <FCard delay={0} style={{ marginBottom: 14 }}>
              <SectionHeader title="Top Selling Products" subtitle="Ranked by revenue generated" icon={BarChart2} color="#a78bfa" />
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topProducts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>No sales data yet</div>
                )}
                {topProducts.map((p, i) => {
                  const pct = topProducts[0].revenue > 0 ? (p.revenue / topProducts[0].revenue) * 100 : 0
                  const RANK_COLORS = ['#f59e0b', '#94a3b8', '#a78bfa']
                  const rankColor = i < 3 ? RANK_COLORS[i] : 'var(--text-muted)'
                  return (
                    <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 + 0.1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        {/* Rank Badge */}
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: i < 3 ? `${rankColor}18` : 'var(--input-bg)', border: `1px solid ${rankColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: rankColor, flexShrink: 0 }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                        </div>
                        {/* Name & Qty */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{p.qty} sold</div>
                        </div>
                        {/* Revenue */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'Playfair Display' }}>₹{p.revenue.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, marginTop: 1 }}>{totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(0) : 0}% share</div>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div style={{ marginLeft: 42, height: 5, borderRadius: 3, background: 'var(--input-bg)', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, delay: i * 0.06 + 0.2 }}
                          style={{ height: '100%', background: `linear-gradient(90deg, #8CB874, #AED581)`, borderRadius: 3 }} />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </FCard>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
