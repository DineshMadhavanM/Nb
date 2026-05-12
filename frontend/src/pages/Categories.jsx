import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, X, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

export default function Categories() {
  const { categories, addCategory, deleteCategory, products } = useApp()
  const [newName, setNewName] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await addCategory({ name: newName.trim() })
    setNewName('')
  }

  const handleDelete = (id, name) => {
    const usage = products.filter(p => p.category === name).length
    if (usage > 0) {
      toast.error(`Cannot delete "${name}". It is being used by ${usage} products.`)
      return
    }
    if (window.confirm(`Delete category "${name}"?`)) {
      deleteCategory(id)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Playfair Display', fontSize: 32, color: 'var(--text-main)', fontWeight: 700, marginBottom: 8 }}>Category Management</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Organize your products with custom categories</p>
      </div>

      <div className="category-form-card" style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 24, boxShadow: 'var(--shadow-main)', marginBottom: 32 }}>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <Tag size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input-dark" 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              placeholder="New category name..." 
              style={{ paddingLeft: 42, height: 48, width: '100%' }}
            />
          </div>
          <button type="submit" className="btn-gold" style={{ flex: '1 1 140px', padding: '0 24px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, fontWeight: 600 }}>
            <Plus size={18} /> Add Category
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .category-form-card { padding: 16px !important; }
          h1 { fontSize: 24px !important; }
        }
      `}</style>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        <AnimatePresence>
          {categories.map(cat => (
            <motion.div 
              key={cat.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                background: 'var(--card-bg)', 
                border: '1px solid var(--glass-border)', 
                borderRadius: 16, 
                padding: '16px 20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>{cat.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {products.filter(p => p.category === cat.name).length} products
                </div>
              </div>
              <button 
                onClick={() => handleDelete(cat.id, cat.name)}
                style={{ 
                  width: 36, height: 36, borderRadius: 10, 
                  background: 'rgba(248, 113, 113, 0.05)', 
                  border: '1px solid rgba(248, 113, 113, 0.1)', 
                  color: '#f87171', 
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.05)'}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <Tag size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
          <p>No categories added yet. Start by adding one above.</p>
        </div>
      )}
    </div>
  )
}
