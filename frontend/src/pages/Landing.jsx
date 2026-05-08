import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Users, Package, Receipt, BarChart3, ChefHat, Award } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const features = [
  { icon: Receipt, title: 'Smart POS Billing', desc: 'Lightning-fast POS with GST auto-calculation, multi-payment modes, and instant receipts.' },
  { icon: BarChart3, title: 'AI Sales Analytics', desc: 'AI-powered sales predictions and revenue trend charts to grow your business.' },
  { icon: Package, title: 'Stock Management', desc: 'Real-time inventory tracking with low-stock alerts and reorder suggestions.' },
  { icon: Users, title: 'Customer CRM', desc: 'Full customer database with purchase history and loyalty rewards system.' },
  { icon: ChefHat, title: 'Order Management', desc: 'Track every order from placement to delivery with live status updates.' },
  { icon: Award, title: 'GST Invoices', desc: 'Automatically generate GST-compliant PDF invoices branded for Nineteen06.' },
]

const stats = [
  { value: '12,000+', label: 'Orders Processed' },
  { value: '₹48L+', label: 'Revenue Tracked' },
  { value: '2,400+', label: 'Happy Customers' },
  { value: '99.9%', label: 'System Uptime' },
]

const floatItems = ['🎂', '🥐', '🍰', '🧁', '🍞', '🥖', '🫧', '🍮']

export default function Landing() {
  const navigate = useNavigate()
  const floatRefs = useRef([])

  useEffect(() => {
    gsap.from('.hero-title', { opacity: 0, y: 60, duration: 1, ease: 'power3.out' })
    gsap.from('.hero-sub', { opacity: 0, y: 30, duration: 0.8, delay: 0.4, ease: 'power3.out' })
    gsap.from('.hero-cta', { opacity: 0, y: 20, duration: 0.6, delay: 0.7 })

    floatRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        y: -18 - i * 3, rotation: (i % 2 === 0 ? 8 : -8), duration: 2.5 + i * 0.3,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.25,
      })
    })

    gsap.from('.feature-card', {
      opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.features-grid', start: 'top 80%' },
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])

  return (
    <div style={{ background: 'linear-gradient(160deg,#0F170B 0%,#1B2E15 35%,#2E4A24 65%,#0F170B 100%)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', background: 'rgba(15,23,11,0.75)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent-gold),#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🍰</div>
          <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, color: 'var(--accent-gold)' }}>Nineteen06</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-gold" style={{ padding: '9px 22px', borderRadius: 8, fontSize: 14 }}>
          Open Dashboard
        </button>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '120px 24px 80px', overflow: 'hidden' }}>
        {floatItems.map((item, i) => (
          <div key={i} ref={el => floatRefs.current[i] = el} style={{
            position: 'absolute', fontSize: 28 + (i % 3) * 10, opacity: 0.12 + (i % 4) * 0.04,
            top: `${10 + i * 10}%`, left: `${5 + i * 11}%`, userSelect: 'none', pointerEvents: 'none', zIndex: 1,
          }}>{item}</div>
        ))}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, background: 'radial-gradient(circle,rgba(140, 184, 116, 0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ textAlign: 'center', maxWidth: 740, position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(140, 184, 116, 0.1)', border: '1px solid rgba(140, 184, 116, 0.25)', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-gold)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--accent-light)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>Premium Bakery POS System</span>
          </motion.div>

          <h1 className="hero-title" style={{ fontFamily: 'Playfair Display', fontSize: 'clamp(36px,6.5vw,76px)', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1, marginBottom: 22 }}>
            The Smart Way to Run<br />
            <span style={{ color: 'var(--accent-gold)' }}>Your Bakery Business</span>
          </h1>
          <p className="hero-sub" style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 38px' }}>
            A SaaS-grade billing dashboard built exclusively for artisan bakeries — POS, invoices, stock, and customers in one platform.
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/dashboard')} className="btn-gold" style={{ padding: '13px 30px', borderRadius: 10, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Enter Dashboard <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/pos')} className="btn-outline-gold" style={{ padding: '13px 30px', borderRadius: 10, fontSize: 15, borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
              Try POS →
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '50px 40px', borderTop: '1px solid rgba(140, 184, 116, 0.08)', borderBottom: '1px solid rgba(140, 184, 116, 0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
          {stats.map(({ value, label }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', padding: '26px 18px', background: 'rgba(140, 184, 116, 0.04)', borderRadius: 14, border: '1px solid rgba(140, 184, 116, 0.1)' }}>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 28, fontWeight: 700, color: 'var(--accent-gold)' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '72px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 38, fontWeight: 700, color: 'var(--text-main)', marginBottom: 10 }}>Everything Your Bakery Needs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 460, margin: '0 auto' }}>From first order to end-of-day reports — all in one beautifully crafted platform.</p>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, maxWidth: 960, margin: '0 auto' }}>
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={i} className="feature-card glass-card" whileHover={{ y: -4 }} style={{ padding: '26px 24px', cursor: 'default' }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(140, 184, 116, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={19} color="var(--accent-gold)" />
              </div>
              <h3 style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--text-main)', marginBottom: 7, fontWeight: 600 }}>{title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '70px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: 'linear-gradient(135deg,rgba(140, 184, 116, 0.12),rgba(140, 184, 116, 0.04))', borderRadius: 20, padding: '50px 36px', border: '1px solid rgba(140, 184, 116, 0.2)' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🍰</div>
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: 30, color: 'var(--text-main)', marginBottom: 10, fontWeight: 700 }}>Ready to Transform Your Bakery?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.65 }}>Start managing your bakery like a premium brand. No setup fee, no complexity.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-gold" style={{ padding: '13px 32px', borderRadius: 10, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Launch Dashboard <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(140, 184, 116, 0.08)', padding: '22px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: 'Playfair Display', color: 'var(--accent-gold)', fontSize: 15, fontWeight: 600 }}>Nineteen06</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2024 Nineteen06 Artisan Bakery · All rights reserved</span>
      </footer>
    </div>
  )
}
