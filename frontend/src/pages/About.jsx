import { motion } from 'framer-motion'
import { Cookie, Mail, Phone, MapPin, Globe, ExternalLink, Heart, Sparkles, User, Building } from 'lucide-react'

export default function About() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 0' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>About Us</h1>
        <div style={{ height: 4, width: 60, background: 'var(--accent-gold)', borderRadius: 2 }}></div>
      </div>

      <motion.div 
        className="glass-card" 
        style={{ padding: 40, position: 'relative', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}>
          <Cookie size={200} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(140,184,116,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cookie size={24} color="#8CB874" />
            </div>
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: 24, fontWeight: 700, color: 'var(--accent-light)' }}>Welcome to Nineteen06 Bakery</h2>
          </div>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-main)', marginBottom: 24 }}>
            Where homemade taste meets modern quality.
          </p>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 24 }}>
            We are passionate about creating fresh, delicious, and handcrafted bakery products made with care and quality ingredients. 
            From cakes and pastries to special homemade treats, our goal is to deliver happiness in every bite.
          </p>

          <div style={{ padding: '24px 30px', background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid var(--glass-border)', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>The NexStack Touch</span>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
              This website was designed and developed by <strong style={{ color: 'var(--accent-gold)' }}>Dinesh Madhavan</strong> from <strong style={{ color: 'var(--accent-light)' }}>NexStack</strong>, 
              focusing on a smooth user experience, modern design, and efficient online ordering and billing solutions for bakery businesses.
            </p>
          </div>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 32 }}>
            At Nineteen06, we believe homemade food creates the best memories, and we are proud to bring that experience online with simplicity and elegance.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-gold)', fontWeight: 600 }}>
            <Heart size={18} fill="currentColor" />
            <span>Thank you for visiting and supporting our journey.</span>
          </div>
        </div>
      </motion.div>

      {/* Contact Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 24 }}>
        <ContactCard icon={User} label="Developer" value="Dinesh Madhavan" />
        <ContactCard icon={Building} label="Company" value="NexStack" />
        <ContactCard icon={Globe} label="Region" value="Tamil Nadu" />
      </div>
    </div>
  )
}

function ContactCard({ icon: Icon, label, value }) {
  return (
    <motion.div 
      className="glass-card" 
      style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}
      whileHover={{ y: -4 }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color="var(--text-muted)" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{value}</div>
      </div>
    </motion.div>
  )
}
