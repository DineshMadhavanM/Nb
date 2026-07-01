import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Download, Search, Eye, X, Printer } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

function InvoicePreviewModal({ order, onClose }) {
  const invoiceNum = `INV-${order.id.replace('ORD-', '')}`
  const handlePrint = () => window.print()

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: 20, width: '90%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
        {/* Modal toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: 14, color: 'var(--accent-light)', fontWeight: 600 }}>{invoiceNum}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'rgba(140, 184, 116, 0.1)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: 12 }}>
              <Printer size={13} /> Print
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
        </div>

        {/* Invoice Body */}
        <div id="invoice-print" style={{ padding: '28px 30px', background: '#F9FAF8', color: '#0F170B' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 26, fontWeight: 800, color: '#0F170B', lineHeight: 1 }}>Nineteen06</div>
              <div style={{ fontSize: 11, color: '#8CB874', letterSpacing: '2px', textTransform: 'uppercase', marginTop: 2 }}>Artisan Bakery</div>
              <div style={{ fontSize: 11, color: '#1B2E15', marginTop: 8, lineHeight: 1.6 }}>
                No. 19, Bakery Street, Chennai<br />
                GST: 33ABCDE1234F1Z5<br />
                +91 98765 43210
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#8CB874', fontFamily: 'Playfair Display' }}>INVOICE</div>
              <div style={{ fontSize: 13, color: '#1B2E15', marginTop: 6 }}><b>Invoice #:</b> {invoiceNum}</div>
              <div style={{ fontSize: 12, color: '#8CB874' }}><b>Date:</b> {format(new Date(order.createdAt), 'dd MMM yyyy')}</div>
            </div>
          </div>

          {/* Bill To */}
          <div style={{ background: '#F1F8E9', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#8CB874', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Bill To</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0F170B' }}>{order.customerName}</div>
            <div style={{ fontSize: 12, color: '#1B2E15' }}>Payment: {order.paymentMethod}</div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#0F170B' }}>
                <th style={{ padding: '9px 12px', color: 'var(--accent-light)', fontSize: 11, textAlign: 'left', fontWeight: 600 }}>#</th>
                <th style={{ padding: '9px 12px', color: 'var(--accent-light)', fontSize: 11, textAlign: 'left', fontWeight: 600 }}>Item</th>
                <th style={{ padding: '9px 12px', color: 'var(--accent-light)', fontSize: 11, textAlign: 'center', fontWeight: 600 }}>Qty</th>
                <th style={{ padding: '9px 12px', color: 'var(--accent-light)', fontSize: 11, textAlign: 'right', fontWeight: 600 }}>Rate</th>
                <th style={{ padding: '9px 12px', color: 'var(--accent-light)', fontSize: 11, textAlign: 'right', fontWeight: 600 }}>GST%</th>
                <th style={{ padding: '9px 12px', color: 'var(--accent-light)', fontSize: 11, textAlign: 'right', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #EDE4D0' }}>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#1B2E15' }}>{i + 1}</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: '#0F170B', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#1B2E15', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#1B2E15', textAlign: 'right' }}>₹{item.price}</td>
                  <td style={{ padding: '9px 12px', fontSize: 12, color: '#1B2E15', textAlign: 'right' }}>{item.gstRate}%</td>
                  <td style={{ padding: '9px 12px', fontSize: 13, color: '#0F170B', fontWeight: 600, textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 220 }}>
              {[
                { label: 'Subtotal', value: `₹${order.subtotal?.toFixed(2)}` },
                { label: 'CGST (2.5%)', value: `₹${(order.gst / 2).toFixed(2)}` },
                { label: 'SGST (2.5%)', value: `₹${(order.gst / 2).toFixed(2)}` },
                order.discount > 0 && { label: `Discount (${order.discount}%)`, value: `-₹${(order.subtotal * order.discount / 100).toFixed(2)}` },
              ].filter(Boolean).map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#1B2E15', marginBottom: 5 }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '2px solid #8CB874', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#0F170B', fontFamily: 'Playfair Display' }}>
                <span>Total</span><span>₹{order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 28, borderTop: '1px solid #EDE4D0', paddingTop: 16, textAlign: 'center', fontSize: 11, color: '#8CB874' }}>
            Thank you for choosing Nineteen06 Artisan Bakery 🎂<br />
            This is a computer-generated invoice.
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Invoices() {
  const { orders } = useApp()
  const [search, setSearch] = useState('')
  const [preview, setPreview] = useState(null)

  const invoiceOrders = orders.filter(o => o.status !== 'cancelled')
  const filtered = invoiceOrders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 28, color: 'var(--text-main)', fontWeight: 700, marginBottom: 4 }}>Invoices</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>GST-compliant invoices for all orders</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Invoices', value: invoiceOrders.length, color: '#A07812' },
          { label: 'Total Revenue', value: `₹${invoiceOrders.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#2E7D32' },
          { label: 'Total GST', value: `₹${invoiceOrders.reduce((s, o) => s + (o.gst || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#1565C0' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#ffffff', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, color: '#555555', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 22, fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." style={{ paddingLeft: 34 }} />
      </div>

      <motion.div className="glass-card" style={{ padding: 0, overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="table-dark">
            <thead>
              <tr><th>Invoice #</th><th>Order ID</th><th>Customer</th><th>Items</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>INV-{o.id.replace('ORD-', '')}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.customerName}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{o.items.length}</td>
                  <td>₹{o.subtotal?.toFixed(0)}</td>
                  <td style={{ color: '#60a5fa' }}>₹{o.gst?.toFixed(0)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>₹{o.total?.toFixed(0)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{format(new Date(o.createdAt), 'dd MMM yyyy')}</td>
                  <td>
                    <button onClick={() => setPreview(o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: 'rgba(140, 184, 116, 0.1)', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: 12 }}>
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 14 }}>No invoices found</div>}
      </motion.div>

      <AnimatePresence>
        {preview && <InvoicePreviewModal order={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>

      <style>{`@media print { .modal-overlay > *:first-child > div:first-child { display:none } }`}</style>
    </div>
  )
}
