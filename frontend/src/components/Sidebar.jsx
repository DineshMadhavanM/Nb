import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingCart, FileText, Package,
  Users, BarChart3, ClipboardList, X, Cookie, Sun, Moon, Info, Tag
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/pos', icon: ShoppingCart, label: 'POS Billing' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/invoices', icon: FileText, label: 'Invoices' },
  { path: '/stock', icon: Package, label: 'Stock' },
  { path: '/categories', icon: Tag, label: 'Categories' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/about', icon: Info, label: 'About Us' },
]

export default function Sidebar({ onClose }) {
  const navigate = useNavigate()
  const { getTodayRevenue, getTodayOrders, theme, toggleTheme } = useApp()

  const revenue = getTodayRevenue() || 0
  const orderCount = getTodayOrders() || 0

  return (
    <div style={{
      width: 240, height: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--glass-border)',
      backdropFilter: 'blur(20px)',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--glass-border)', position: 'relative' }}>
        {onClose && (
          <button onClick={onClose} style={{ position: 'absolute', right: 14, top: 20, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #689F38, #8BC34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 4px 16px rgba(104, 159, 56, 0.2)'
          }}>
            <Cookie size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Playfair Display', fontSize: 17, fontWeight: 700, color: 'var(--accent-light)', lineHeight: 1.1 }}>Nineteen06</div>
            <div style={{ fontSize: 10, color: 'var(--accent-gold)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 1 }}>Artisan Bakery</div>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px' }}>
        <div style={{ fontSize: 10, color: 'var(--accent-gold)', opacity: 0.6, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 8px 10px', fontWeight: 600 }}>
          Main Menu
        </div>
        {navItems.map(({ path, icon: Icon, label }, i) => (
          <motion.div
            key={path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NavLink
              to={path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Bottom: theme toggle & summary */}
      <div style={{ padding: '14px 16px 20px', borderTop: '1px solid var(--glass-border)' }}>
        <button 
          onClick={toggleTheme}
          style={{ 
            width: '100%', padding: '10px', borderRadius: 10, marginBottom: 12,
            background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
            color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', gap: 10, fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
          }}
          className="theme-toggle-btn"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>

        <div style={{ background: 'rgba(104, 159, 56, 0.05)', borderRadius: 10, padding: '12px 14px', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: 11, color: 'var(--accent-gold)', marginBottom: 6, letterSpacing: '0.5px' }}>Today's Revenue</div>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 20, color: 'var(--accent-light)', fontWeight: 700 }}>₹{Math.round(revenue).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{orderCount} order{orderCount !== 1 ? 's' : ''} today</div>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', opacity: 0.4, textAlign: 'center' }}>
          v1.0.0 · Nineteen06 POS
        </div>
      </div>
    </div>
  )
}
