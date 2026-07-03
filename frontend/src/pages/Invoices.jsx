import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Search, Eye, X, Printer, Share2, MessageCircle, ChevronRight, Receipt } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

/* ── Custom Instagram SVG Icon ── */
const InstagramIcon = ({ size = 15, color = '#E1306C' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
  </svg>
)

/* ── Share Dropdown ── */
function ShareDropdown({ order, invoiceNum, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const buildMessage = () => {
    const items = order.items.map(i => `• ${i.name} x${i.qty} — ₹${(i.price * i.qty).toFixed(0)}`).join('\n')
    return encodeURIComponent(
      `🎂 *Nineteen06 Artisan Bakery*\n` +
      `📄 Invoice: ${invoiceNum}\n` +
      `👤 Customer: ${order.customerName}\n` +
      `📅 Date: ${format(new Date(order.createdAt), 'dd MMM yyyy')}\n\n` +
      `*Items:*\n${items}\n\n` +
      `💰 *Total: ₹${order.total?.toFixed(2)}*\n\n` +
      `Thank you for choosing Nineteen06! 🙏`
    )
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${buildMessage()}`, '_blank')
    onClose()
  }

  const shareInstagram = () => {
    // Instagram doesn't support direct text sharing via URL — copy to clipboard and open app
    navigator.clipboard?.writeText(decodeURIComponent(buildMessage())).then(() => {
      alert('Invoice details copied! Paste into Instagram story or DM.')
      window.open('https://www.instagram.com/', '_blank')
    })
    onClose()
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute', top: '100%', right: 0, marginTop: 8, zIndex: 200,
        background: 'var(--bg-dark)', border: '1px solid var(--glass-border)',
        borderRadius: 14, padding: 6, minWidth: 170,
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)'
      }}
    >
      <button onClick={shareWhatsApp} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: 'transparent', color: 'var(--text-main)', fontSize: 13, fontWeight: 600,
        transition: 'background 0.15s'
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,211,102,0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(37,211,102,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageCircle size={15} color="#25D366" />
        </div>
        WhatsApp
      </button>
      <button onClick={shareInstagram} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: 'transparent', color: 'var(--text-main)', fontSize: 13, fontWeight: 600,
        transition: 'background 0.15s'
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,48,108,0.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(225,48,108,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <InstagramIcon size={15} color="#E1306C" />
        </div>
        Instagram
      </button>
    </motion.div>
  )
}

/* ── Invoice Preview Modal ── */
function InvoicePreviewModal({ order, onClose }) {
  const invoiceNum = `INV-${order.id.replace('ORD-', '')}`
  const [showShare, setShowShare] = useState(false)
  const handlePrint = () => window.print()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        style={{
          background: 'var(--bg-dark)', border: '1px solid var(--glass-border)',
          borderRadius: 24, width: '92%', maxWidth: 520, maxHeight: '92vh',
          overflowY: 'auto', padding: 0, boxShadow: '0 24px 64px rgba(0,0,0,0.35)'
        }}
      >
        {/* ── Modal Toolbar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--glass-border)',
          background: 'rgba(140,184,116,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(140,184,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Receipt size={15} color="#8CB874" />
            </div>
            <span style={{ fontSize: 13, color: 'var(--accent-light)', fontWeight: 700, fontFamily: 'monospace' }}>{invoiceNum}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Print */}
            <button onClick={handlePrint} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
              borderRadius: 10, background: 'rgba(140,184,116,0.1)',
              border: '1px solid rgba(140,184,116,0.3)', color: 'var(--accent-gold)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s'
            }}>
              <Printer size={13} /> Print
            </button>
            {/* Share */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowShare(s => !s)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px',
                borderRadius: 10, background: 'rgba(96,165,250,0.1)',
                border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s'
              }}>
                <Share2 size={13} /> Share
              </button>
              <AnimatePresence>
                {showShare && (
                  <ShareDropdown order={order} invoiceNum={invoiceNum} onClose={() => setShowShare(false)} />
                )}
              </AnimatePresence>
            </div>
            {/* Close */}
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 10, background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.2)', color: '#f87171',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Invoice Body ── */}
        <div id="invoice-print" style={{ padding: '26px 28px', background: '#F9FAF8', color: '#0F170B' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 800, color: '#0F170B', lineHeight: 1 }}>Nineteen06</div>
              <div style={{ fontSize: 10, color: '#8CB874', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: 2, fontWeight: 700 }}>Artisan Bakery</div>
              <div style={{ fontSize: 11, color: '#4A6B3A', marginTop: 8, lineHeight: 1.7 }}>
                No. 19, Bakery Street, Chennai<br />
                GST: 33ABCDE1234F1Z5<br />
                +91 98765 43210
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#8CB874', fontFamily: 'Playfair Display', letterSpacing: 1 }}>INVOICE</div>
              <div style={{ fontSize: 11, color: '#4A6B3A', marginTop: 8, lineHeight: 1.8 }}>
                <b>Invoice #:</b> {invoiceNum}<br />
                <b style={{ color: '#8CB874' }}>Date:</b> {format(new Date(order.createdAt), 'dd MMM yyyy')}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ background: 'linear-gradient(135deg, #F1F8E9, #E8F5E9)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, border: '1px solid #C8E6C9' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#8CB874', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 5 }}>Bill To</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F170B' }}>{order.customerName}</div>
            <div style={{ fontSize: 11, color: '#4A6B3A', marginTop: 2 }}>Payment: <b>{order.paymentMethod}</b></div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18, borderRadius: 10, overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#1B2E15' }}>
                {['#', 'Item', 'Qty', 'Rate', 'GST%', 'Amount'].map((h, i) => (
                  <th key={h} style={{ padding: '9px 10px', color: '#AED581', fontSize: 10, fontWeight: 700, textAlign: i === 0 || i === 1 ? 'left' : i === 2 ? 'center' : 'right', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #E8F5E9', background: i % 2 === 0 ? '#FAFFF8' : '#F4FBF0' }}>
                  <td style={{ padding: '9px 10px', fontSize: 11, color: '#4A6B3A', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '9px 10px', fontSize: 12, color: '#0F170B', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '9px 10px', fontSize: 11, color: '#4A6B3A', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '9px 10px', fontSize: 11, color: '#4A6B3A', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ padding: '9px 10px', fontSize: 11, color: '#4A6B3A', textAlign: 'right' }}>{item.gstRate}%</td>
                  <td style={{ padding: '9px 10px', fontSize: 12, color: '#0F170B', fontWeight: 700, textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 220, background: '#F1F8E9', borderRadius: 10, padding: '12px 14px', border: '1px solid #C8E6C9' }}>
              {[
                { label: 'Subtotal', value: `₹${order.subtotal?.toFixed(2)}` },
                { label: 'CGST (2.5%)', value: `₹${(order.gst / 2).toFixed(2)}` },
                { label: 'SGST (2.5%)', value: `₹${(order.gst / 2).toFixed(2)}` },
                order.discount > 0 && { label: `Discount (${order.discount}%)`, value: `-₹${(order.subtotal * order.discount / 100).toFixed(2)}` },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4A6B3A', marginBottom: 5 }}>
                  <span>{label}</span><span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #8CB874', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 900, color: '#0F170B', fontFamily: 'Playfair Display' }}>
                <span>Total</span><span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 22, borderTop: '1px solid #C8E6C9', paddingTop: 14, textAlign: 'center', fontSize: 11, color: '#8CB874', lineHeight: 1.7 }}>
            Thank you for choosing Nineteen06 Artisan Bakery 🎂<br />
            <span style={{ color: '#9AAF8A', fontSize: 10 }}>This is a computer-generated invoice.</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Flutter-style Invoice Card ── */
function InvoiceCard({ order, onView, index }) {
  const invoiceNum = `INV-${order.id.replace('ORD-', '')}`
  const METHOD_COLOR = { UPI: '#8CB874', Card: '#60a5fa', Cash: '#f59e0b', Credit: '#f87171' }
  const color = METHOD_COLOR[order.paymentMethod] || '#8CB874'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      onClick={() => onView(order)}
      style={{
        background: 'var(--card-bg)', borderRadius: 18, border: '1px solid var(--glass-border)',
        padding: '14px 16px', marginBottom: 10, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.2s ease'
      }}
      whileHover={{ scale: 1.01, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <FileText size={20} color={color} />
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {order.customerName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{invoiceNum}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {format(new Date(order.createdAt), 'dd MMM yyyy')} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>
      </div>
      {/* Amount + Method */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: 'Playfair Display', fontSize: 16, fontWeight: 800, color: 'var(--accent-gold)' }}>
          ₹{order.total?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color,
          background: `${color}15`, border: `1px solid ${color}25`,
          borderRadius: 20, padding: '2px 8px', marginTop: 4, display: 'inline-block'
        }}>
          {order.paymentMethod}
        </div>
      </div>
      <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
    </motion.div>
  )
}

/* ── Main Page ── */
export default function Invoices() {
  const { orders } = useApp()
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)

  const invoiceOrders = orders.filter(o => o.status !== 'cancelled')
  const filtered = invoiceOrders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = invoiceOrders.reduce((s, o) => s + o.total, 0)
  const totalGST = invoiceOrders.reduce((s, o) => s + (o.gst || 0), 0)

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 32 }}>

      {/* ── App Bar ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 24, color: 'var(--text-main)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>Invoices</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '4px 0 0' }}>GST-compliant invoices for all orders</p>
      </motion.div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Total Invoices', value: invoiceOrders.length, color: '#A07812', bg: 'rgba(160,120,18,0.08)', border: 'rgba(160,120,18,0.2)' },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#2E7D32', bg: 'rgba(46,125,50,0.08)', border: 'rgba(46,125,50,0.2)' },
          { label: 'Total GST', value: `₹${totalGST.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#1565C0', bg: 'rgba(21,101,192,0.08)', border: 'rgba(21,101,192,0.2)' },
        ].map(({ label, value, color, bg, border }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: bg, borderRadius: 16, padding: '14px 12px', border: `1px solid ${border}` }}>
            <div style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 18, fontWeight: 800, color }}>{value}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input-dark"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer or invoice #..."
          style={{ paddingLeft: 38, borderRadius: 14, fontSize: 13 }}
        />
      </motion.div>

      {/* ── Invoice Card List ── */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          <FileText size={36} style={{ opacity: 0.3, marginBottom: 10 }} />
          <div style={{ fontSize: 14 }}>No invoices found</div>
        </motion.div>
      ) : (
        filtered.map((o, i) => (
          <InvoiceCard key={o.id} order={o} onView={setPreview} index={i} />
        ))
      )}

      {/* ── Invoice Preview Modal ── */}
      <AnimatePresence>
        {preview && <InvoicePreviewModal order={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>

      <style>{`@media print { .modal-overlay > *:first-child > div:first-child { display:none } }`}</style>
    </div>
  )
}
