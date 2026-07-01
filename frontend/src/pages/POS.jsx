import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, X, CreditCard, Smartphone, Banknote, CheckCircle, User, Calendar, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'


function CheckoutModal({ onClose }) {
  const { cart, selectedCustomer, getSubtotal, getGST, getDiscountAmount, getTotal, discount, setDiscount, discountType, setDiscountType, clearCart, setSelectedCustomer } = useCart()
  const { addOrder, addCustomer, customers } = useApp()
  const [payMethod, setPayMethod] = useState('UPI')
  const [step, setStep] = useState('review') // review | success
  const [dueDateType, setDueDateType] = useState('today')
  const [customDays, setCustomDays] = useState('7')
  const [newCustName, setNewCustName] = useState('')
  const [newCustPhone, setNewCustPhone] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const nameSuggestions = newCustName.trim()
    ? customers.filter(c => c.name.toLowerCase().includes(newCustName.toLowerCase())).slice(0, 5)
    : []
  const matchedCustomer = customers.find(c => c.name.toLowerCase() === newCustName.toLowerCase())

  const getDueDate = () => {
    if (payMethod !== 'Credit') return null
    const date = new Date()
    if (dueDateType === 'tomorrow') date.setDate(date.getDate() + 1)
    if (dueDateType === 'custom') date.setDate(date.getDate() + parseInt(customDays || 0))
    return date.toISOString()
  }

  const creditMissingInfo = payMethod === 'Credit' && (!newCustName.trim() || !newCustPhone.trim())

  const handlePay = async () => {
    if (creditMissingInfo) {
      toast.error('Customer name and phone are required for Credit orders')
      return
    }
    // Save as new customer if name doesn't already exist
    let customerId = matchedCustomer?.id || null
    if (newCustName.trim() && !matchedCustomer) {
      const saved = await addCustomer({ name: newCustName.trim(), phone: newCustPhone.trim() })
      customerId = saved?.id || null
    }
    const order = {
      customerId,
      customerName: newCustName.trim() || 'Walk-in Customer',
      customerPhone: newCustPhone.trim() || '',
      items: cart.map(i => ({ 
        productId: i.productId, 
        name: i.name, 
        price: i.price, 
        qty: i.qty,
        gstRate: i.gstRate || 0
      })),
      subtotal: getSubtotal(),
      gst: getGST(),
      discount: getDiscountAmount(),
      total: getTotal(),
      paymentMethod: payMethod,
      dueDate: getDueDate()
    }
    addOrder(order)
    setStep('success')
    setTimeout(() => { clearCart(); onClose(); toast.success('Order placed successfully!') }, 2000)
  }

  if (step === 'success') return (
    <div className="modal-overlay">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: 40 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          <CheckCircle size={70} color="#8CB874" />
        </motion.div>
        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, color: 'var(--text-main)', marginTop: 16 }}>{payMethod === 'Credit' ? 'Order Recorded!' : 'Payment Successful!'}</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>₹{getTotal().toFixed(2)} {payMethod === 'Credit' ? 'marked as Credit' : `collected via ${payMethod}`}</p>
      </motion.div>
    </div>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
        style={{ background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: 20, width: '90%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--text-main)' }}>Checkout</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Customer */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Name with autocomplete */}
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 10, marginBottom: 4, textTransform: 'uppercase', color: payMethod === 'Credit' ? '#f87171' : 'var(--text-muted)' }}>
                Name{payMethod === 'Credit' ? ' *' : ' (opt)'}
              </div>
              <input
                className="input-dark"
                value={newCustName}
                onChange={e => { setNewCustName(e.target.value); setNewCustPhone(''); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Name"
                autoComplete="off"
                style={{
                  fontSize: 12, height: 38,
                  border: payMethod === 'Credit' && !newCustName.trim() ? '1px solid #f87171' : undefined
                }}
              />
              {showSuggestions && nameSuggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: 8, marginTop: 2, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                  {nameSuggestions.map(c => (
                    <div
                      key={c.id}
                      onMouseDown={() => { setNewCustName(c.name); setNewCustPhone(c.phone); setShowSuggestions(false) }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--text-main)', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <User size={12} color="var(--accent-gold)" />
                      <span style={{ fontWeight: 500 }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{c.phone}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Phone */}
            <div>
              <div style={{ fontSize: 10, marginBottom: 4, textTransform: 'uppercase', color: payMethod === 'Credit' ? '#f87171' : 'var(--text-muted)' }}>
                Phone{payMethod === 'Credit' ? ' *' : ' (opt)'}
              </div>
              <input
                className="input-dark"
                value={newCustPhone}
                onChange={e => setNewCustPhone(e.target.value)}
                placeholder="Phone"
                style={{
                  fontSize: 12, height: 38,
                  border: payMethod === 'Credit' && !newCustPhone.trim() ? '1px solid #f87171' : undefined
                }}
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { id: 'UPI', icon: Smartphone }, 
              { id: 'Card', icon: CreditCard }, 
              { id: 'Cash', icon: Banknote },
              { id: 'Credit', icon: Clock }
            ].map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => setPayMethod(id)} style={{ padding: '12px 4px', borderRadius: 10, border: `1px solid ${payMethod === id ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: payMethod === id ? 'rgba(140, 184, 116, 0.12)' : 'rgba(15, 23, 11, 0.4)', color: payMethod === id ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500 }}>
                <Icon size={16} />
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Credit Options */}

        {/* Order Summary */}
        <div style={{ background: 'rgba(15, 23, 11, 0.5)', borderRadius: 10, padding: '14px', marginBottom: 18, border: '1px solid var(--glass-border)' }}>
          {cart.map(i => (
            <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'rgba(241, 248, 233, 0.75)' }}>{i.name} × {i.qty}</span>
              <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>₹{(i.price * i.qty).toFixed(0)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--glass-border)', marginTop: 10, paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span>
            </div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8CB874', marginBottom: 4 }}>
              <span>Discount ({discountType === 'percent' ? `${discount}%` : `₹${discount}`})</span><span>-₹{getDiscountAmount().toFixed(2)}</span>
            </div>}
            {getGST() > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--accent-gold)', marginBottom: 4 }}>
              <span>GST</span><span>+₹{getGST().toFixed(2)}</span>
            </div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: 'var(--text-main)', marginTop: 6 }}>
              <span>Total</span><span style={{ color: 'var(--accent-light)' }}>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Discount */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discount</div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3, border: '1px solid var(--glass-border)' }}>
              <button onClick={() => setDiscountType('percent')} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', background: discountType === 'percent' ? 'var(--accent-gold)' : 'transparent', color: discountType === 'percent' ? '#0F170B' : 'var(--text-muted)', cursor: 'pointer' }}>%</button>
              <button onClick={() => setDiscountType('fixed')} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', background: discountType === 'fixed' ? 'var(--accent-gold)' : 'transparent', color: discountType === 'fixed' ? '#0F170B' : 'var(--text-muted)', cursor: 'pointer' }}>₹</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input 
              type="number" 
              className="input-dark" 
              value={discount || ''} 
              onChange={e => setDiscount(Number(e.target.value))} 
              placeholder={`Enter ${discountType === 'percent' ? 'percentage' : 'amount'}...`}
              style={{ flex: 1 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              {(discountType === 'percent' ? [0, 5, 10, 15] : [0, 50, 100, 200]).map(d => (
                <button key={d} onClick={() => setDiscount(d)} style={{ padding: '0 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${discount === d ? 'var(--accent-gold)' : 'var(--glass-border)'}`, background: discount === d ? 'rgba(140, 184, 116, 0.15)' : 'transparent', color: discount === d ? 'var(--accent-light)' : 'var(--text-muted)', cursor: 'pointer' }}>
                  {d}{discountType === 'percent' ? '%' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handlePay}
          disabled={creditMissingInfo}
          className="btn-gold"
          style={{ width: '100%', padding: '14px', borderRadius: 10, fontSize: 15, opacity: creditMissingInfo ? 0.45 : 1, cursor: creditMissingInfo ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}
        >
          {payMethod === 'Credit'
            ? creditMissingInfo ? 'Enter customer details to continue' : 'Record Credit Order'
            : `Confirm Payment · ₹${getTotal().toFixed(2)}`}
        </button>
      </motion.div>
    </div>
  )
}

export default function POS() {
  const { products, categories } = useApp()
  const { cart, addToCart, removeFromCart, updateQty, getSubtotal, getGST, getTotal, getItemCount, clearCart } = useCart()
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [checkout, setCheckout] = useState(false)
  const [showMobileCart, setShowMobileCart] = useState(false)

  const filtered = products.filter(p => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="pos-layout" style={{ position: 'relative' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, height: 'calc(100vh - 120px)' }} className="pos-grid">
        {/* Products Column */}
        <div style={{ overflowY: 'auto', paddingRight: 4 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 26, color: 'var(--text-main)', fontWeight: 700, marginBottom: 4 }}>New Billing +</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Artisan Bakery Selection</p>
            </div>
          </div>

          <div style={{ position: 'sticky', top: -1, zIndex: 10, background: 'var(--bg-dark)', paddingBottom: 12 }}>
            <input className="input-dark" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." style={{ marginBottom: 16, height: 48, fontSize: 15 }} />
            
            {/* Category Tabs (Scrollable on mobile) */}
            <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              <button onClick={() => setCategory('All')} style={{ 
                padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                border: `1px solid ${category === 'All' ? 'var(--accent-gold)' : 'var(--glass-border)'}`, 
                background: category === 'All' ? 'rgba(140, 184, 116, 0.15)' : 'rgba(15,23,11,0.5)', 
                color: category === 'All' ? 'var(--accent-light)' : 'var(--text-muted)', 
                cursor: 'pointer', transition: 'all 0.2s' 
              }}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.name)} style={{ 
                  padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                  border: `1px solid ${category === cat.name ? 'var(--accent-gold)' : 'var(--glass-border)'}`, 
                  background: category === cat.name ? 'rgba(140, 184, 116, 0.15)' : 'rgba(15,23,11,0.5)', 
                  color: category === cat.name ? 'var(--accent-light)' : 'var(--text-muted)', 
                  cursor: 'pointer', transition: 'all 0.2s' 
                }}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 16, marginTop: 12 }} className="product-grid">
            {filtered.map(p => {
              const inCart = cart.find(i => i.productId === p.id)
              return (
                <motion.div key={p.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.96 }}
                  onClick={() => addToCart(p)}
                  style={{ 
                    background: inCart ? 'rgba(104, 159, 56, 0.08)' : 'var(--card-bg)', 
                    border: `1px solid ${inCart ? 'rgba(104, 159, 56, 0.4)' : 'var(--glass-border)'}`, 
                    borderRadius: 18, padding: '18px 16px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
                    boxShadow: inCart ? '0 8px 20px rgba(104,159,56,0.1)' : '0 4px 12px var(--shadow-main)'
                  }}>
                  {inCart && <div style={{ position: 'absolute', top: 12, right: 12, background: 'var(--accent-gold)', color: '#0F170B', borderRadius: 999, width: 22, height: 22, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{inCart.qty}</div>}
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{p.category}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--accent-gold)', fontWeight: 800 }}>₹{p.price}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Cart Column (Desktop Only) */}
        <div className="desktop-cart" style={{ display: 'flex', flexDirection: 'column', background: 'var(--card-bg)', borderRadius: 20, border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          <CartContent 
            cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} 
            getSubtotal={getSubtotal} getGST={getGST} getTotal={getTotal} 
            getItemCount={getItemCount} onCheckout={() => setCheckout(true)} 
            clearCart={clearCart}
          />
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <AnimatePresence>
        {getItemCount() > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setShowMobileCart(true)}
            className="mobile-fab"
            style={{
              display: 'none', position: 'fixed', bottom: 85, right: 20,
              width: 64, height: 64, borderRadius: 32, background: 'var(--accent-gold)',
              color: '#0F170B', border: 'none', boxShadow: '0 8px 30px rgba(140,184,116,0.5)',
              zIndex: 100, alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}
          >
            <ShoppingCart size={28} />
            <span style={{ position: 'absolute', top: -2, right: -2, background: '#f87171', color: 'white', borderRadius: 999, width: 22, height: 22, fontSize: 11, fontWeight: 800, border: '2px solid var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getItemCount()}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Cart Bottom Sheet / Modal */}
      <AnimatePresence>
        {showMobileCart && (
          <div className="modal-overlay" style={{ zIndex: 120 }}>
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ background: 'var(--bg-dark)', borderTop: '1px solid var(--glass-border)', borderTopLeftRadius: 30, borderTopRightRadius: 30, width: '100%', height: '90%', position: 'absolute', bottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Playfair Display', fontSize: 18 }}>My Cart</h3>
                <button onClick={() => setShowMobileCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <CartContent 
                  cart={cart} removeFromCart={removeFromCart} updateQty={updateQty} 
                  getSubtotal={getSubtotal} getGST={getGST} getTotal={getTotal} 
                  getItemCount={getItemCount} onCheckout={() => { setShowMobileCart(false); setCheckout(true) }} 
                  clearCart={clearCart}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkout && <CheckoutModal onClose={() => setCheckout(false)} />}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media (max-width: 1024px) {
          .pos-grid { grid-template-columns: 1fr !important; height: calc(100vh - 140px) !important; }
          .desktop-cart { display: none !important; }
          .mobile-fab { display: flex !important; }
          .product-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}

function CartContent({ cart, removeFromCart, updateQty, getSubtotal, getGST, getTotal, getItemCount, onCheckout, clearCart }) {
  return (
    <>
      <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShoppingCart size={18} color="var(--accent-gold)" />
        <span style={{ fontFamily: 'Playfair Display', fontSize: 18, color: 'var(--text-main)', fontWeight: 600 }}>Cart</span>
        {getItemCount() > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent-gold)', color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 800 }}>{getItemCount()}</span>}
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            title="Clear entire cart"
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.2)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              borderRadius: 6,
              transition: 'all 0.2s',
              marginLeft: 4
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <AnimatePresence>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', opacity: 0.5 }}>
              <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <div style={{ fontSize: 14 }}>Your cart is empty</div>
            </div>
          ) : cart.map(item => (
            <motion.div key={item.productId} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '14px', marginBottom: 12, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>₹{item.price} per unit</div>
                </div>
                <button onClick={() => removeFromCart(item.productId)} style={{ background: 'none', border: 'none', color: '#f87171', opacity: 0.6, cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(104, 159, 56, 0.05)', borderRadius: 10, padding: '4px 8px' }}>
                  <button onClick={() => updateQty(item.productId, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'white', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button>
                  <span style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 8, background: 'white', border: '1px solid var(--glass-border)', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button>
                </div>
                <span style={{ fontFamily: 'Playfair Display', fontSize: 16, color: 'var(--accent-gold)', fontWeight: 800 }}>₹{(item.price * item.qty).toFixed(0)}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>Subtotal</span><span>₹{getSubtotal().toFixed(2)}</span>
          </div>
          {getGST() > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--accent-gold)', marginBottom: 12 }}>
            <span>GST</span><span>₹{getGST().toFixed(2)}</span>
          </div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 19, fontWeight: 800, color: 'var(--text-main)', marginBottom: 20 }}>
            <span>Total Amount</span><span style={{ color: 'var(--accent-light)', fontFamily: 'Playfair Display' }}>₹{getTotal().toFixed(2)}</span>
          </div>
          <button onClick={onCheckout} className="btn-gold" style={{ width: '100%', padding: '16px', borderRadius: 16, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <CheckCircle size={18} /> Proceed to Checkout
          </button>
        </div>
      )}
    </>
  )
}
