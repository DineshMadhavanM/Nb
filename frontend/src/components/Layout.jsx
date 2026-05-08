import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import { useState } from 'react'
import { Menu, X, LayoutDashboard, ShoppingCart, ClipboardList, Package, User, MoreVertical, Sun, Moon } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/pos', icon: ShoppingCart, label: 'POS' },
    { path: '/orders', icon: ClipboardList, label: 'Orders' },
    { path: '/stock', icon: Package, label: 'Stock' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-main)' }}>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar / Drawer */}
      <div 
        className={`sidebar-container ${sidebarOpen ? 'mobile-open' : ''}`}
        style={{ width: 240, flexShrink: 0, zIndex: 110 }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden', paddingBottom: 70 }} className="main-viewport">
        {/* Mobile App Bar (Flutter Style) */}
        <header className="mobile-appbar" style={{
          display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px',
          background: 'var(--nav-bg)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          position: 'sticky', top: 0, zIndex: 90,
          boxShadow: '0 4px 12px var(--shadow-main)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Menu size={22} />
            </button>
            <div>
              <div style={{ fontFamily: 'Playfair Display', color: 'var(--accent-light)', fontWeight: 700, fontSize: 17, lineHeight: 1 }}>Nineteen06</div>
              <div style={{ fontSize: 9, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{location.pathname.slice(1) || 'Home'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><User size={20} /></button>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><MoreVertical size={20} /></button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation (Flutter Style) */}
        <nav className="mobile-bottom-nav" style={{
          display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 68, background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
          zIndex: 90, justifyContent: 'space-around', alignItems: 'center',
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -4px 12px rgba(104, 159, 56, 0.05)'
        }}>
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <button 
                key={path} 
                onClick={() => navigate(path)}
                style={{ 
                  background: 'none', border: 'none', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1,
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  padding: '4px 16px', borderRadius: 16,
                  background: isActive ? 'rgba(140,184,116,0.15)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, letterSpacing: 0.2 }}>{label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <style>{`
        .sidebar-container {
          position: fixed; top: 0; left: 0; height: 100vh;
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-container.mobile-open { transform: translateX(0); }
        
        @media (min-width: 1025px) {
          .mobile-appbar, .mobile-bottom-nav { display: none !important; }
          .sidebar-container { position: relative !important; transform: none !important; }
          .main-viewport { padding-bottom: 0 !important; }
        }
        
        @media (max-width: 1024px) {
          .mobile-appbar { display: flex !important; }
          .mobile-bottom-nav { display: flex !important; }
          main { padding: 18px 16px !important; }
          .sidebar-container { box-shadow: 20px 0 50px rgba(0,0,0,0.5); }
        }

        /* Flutter-like touch ripples and feedback could be added here */
      `}</style>
    </div>
  )
}
