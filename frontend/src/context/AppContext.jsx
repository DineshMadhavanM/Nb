import { createContext, useContext, useState, useEffect } from 'react'
import { productApi, orderApi, customerApi, analyticsApi } from '../lib/api'
import toast from 'react-hot-toast'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [categories, setCategories] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(localStorage.getItem('nineteen06-theme') || 'light')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('nineteen06-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, orderRes, custRes, anaRes, catRes] = await Promise.all([
        productApi.getAll(),
        orderApi.getAll(),
        customerApi.getAll(),
        analyticsApi.getDashboard(),
        categoryApi.getAll()
      ])
      setProducts(prodRes.data || [])
      setOrders(orderRes.data || [])
      setCustomers(custRes.data || [])
      setAnalytics(anaRes.data || null)
      setCategories(catRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to connect to the server')
      setProducts([])
      setOrders([])
      setCustomers([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product) => {
    try {
      const res = await productApi.create(product)
      setProducts(prev => [res.data, ...prev])
      toast.success('Product added successfully')
      return res.data
    } catch (error) {
      toast.error('Failed to add product')
      throw error
    }
  }

  const updateProduct = async (id, updates) => {
    try {
      const res = await productApi.update(id, updates)
      setProducts(prev => prev.map(p => p.id === id ? res.data : p))
      toast.success('Product updated')
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  const deleteProduct = async (id) => {
    try {
      await productApi.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product deleted')
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const addOrder = async (order) => {
    try {
      const res = await orderApi.create(order)
      setOrders(prev => [res.data, ...prev])
      // Refresh analytics and products (for stock)
      fetchData()
      return res.data
    } catch (error) {
      toast.error('Failed to place order')
      throw error
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await orderApi.updateStatus(id, status)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: res.data.status } : o))
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      const res = await orderApi.updatePayment(id, paymentStatus)
      setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: res.data.paymentStatus } : o))
      if (paymentStatus === 'paid') {
        toast.success('Payment marked as Received')
      }
      fetchData() // Refresh analytics
    } catch (error) {
      toast.error('Failed to update payment status')
    }
  }

  const deleteOrder = async (id) => {
    try {
      await orderApi.delete(id)
      setOrders(prev => prev.filter(o => o.id !== id))
      toast.success('Order deleted and stock restored')
      // Refresh analytics and products
      fetchData()
    } catch (error) {
      toast.error('Failed to delete order')
    }
  }

  const addCustomer = async (customer) => {
    try {
      const res = await customerApi.create(customer)
      setCustomers(prev => [res.data, ...prev])
      return res.data
    } catch (error) {
      toast.error('Failed to add customer')
    }
  }

  const addCategory = async (category) => {
    try {
      const res = await categoryApi.create(category)
      setCategories(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('Category added')
      return res.data
    } catch (error) {
      toast.error('Failed to add category')
    }
  }

  const deleteCategory = async (id) => {
    try {
      await categoryApi.delete(id)
      setCategories(prev => prev.filter(c => c.id !== id))
      toast.success('Category deleted')
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  // Analytics Helpers
  const getTodayRevenue = () => analytics?.todayRevenue || 0
  const getTodayOrders = () => analytics?.todayOrders || 0
  const getMonthlyRevenue = () => orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  const getTotalGST = () => orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.gst || 0), 0)

  return (
    <AppContext.Provider value={{
      products, orders, customers, categories, analytics, loading, theme, toggleTheme,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrderStatus, updatePaymentStatus, deleteOrder,
      addCustomer, addCategory, deleteCategory, fetchData,
      getTodayRevenue, getTodayOrders, getMonthlyRevenue, getTotalGST
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
