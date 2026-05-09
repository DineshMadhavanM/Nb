import { HashRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Orders from './pages/Orders'
import Invoices from './pages/Invoices'
import Stock from './pages/Stock'
import Customers from './pages/Customers'
import Reports from './pages/Reports'
import './index.css'

export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <HashRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 11, 0.95)',
                color: 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                borderRadius: '10px',
                fontSize: '13px',
              },
              success: { iconTheme: { primary: '#8CB874', secondary: '#0F170B' } },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Routes>
        </HashRouter>
      </CartProvider>
    </AppProvider>
  )
}
