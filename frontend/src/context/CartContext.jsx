import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [discount, setDiscount] = useState(0)
  const [note, setNote] = useState('')

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const updateQty = (productId, qty) => {
    if (qty <= 0) { removeFromCart(productId); return }
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setDiscount(0)
    setNote('')
  }

  const getSubtotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0)

  const getTotal = () => {
    const sub = getSubtotal()
    const discAmt = (sub * discount) / 100
    return sub - discAmt
  }

  const getItemCount = () => cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{
      cart, selectedCustomer, discount, note,
      setSelectedCustomer, setDiscount, setNote,
      addToCart, removeFromCart, updateQty, clearCart,
      getSubtotal, getTotal, getItemCount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
