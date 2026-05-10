import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AccessGate({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [code, setCode] = useState('')
  const [checking, setChecking] = useState(false)
  const [showGate, setShowGate] = useState(true)

  const ACCESS_CODE = 'V1906gan'

  useEffect(() => {
    const savedAccess = localStorage.getItem('nineteen06_access')
    if (savedAccess === 'true') {
      setIsAuthorized(true)
      setShowGate(false)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setChecking(true)
    
    // Artificial delay for premium feel
    setTimeout(() => {
      if (code === ACCESS_CODE) {
        localStorage.setItem('nineteen06_access', 'true')
        setIsAuthorized(true)
        toast.success('Access Granted. Welcome to Nineteen06.', {
          icon: '✨',
          duration: 3000
        })
        setTimeout(() => setShowGate(false), 500)
      } else {
        toast.error('Invalid access code. Please try again.', {
          icon: '🔒'
        })
        setCode('')
      }
      setChecking(false)
    }, 800)
  }

  if (isAuthorized && !showGate) {
    return children
  }

  return (
    <AnimatePresence>
      {showGate && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-9999 flex items-center justify-center bg-[#0F170B] overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#8CB874] rounded-full blur-[120px]"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#AED581] rounded-full blur-[100px]"
            />
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-md px-6 z-10"
          >
            <div className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-[#8CB874]/20 to-[#8CB874]/5 border border-[#8CB874]/30 mb-6"
              >
                <Lock className="w-8 h-8 text-[#8CB874]" />
              </motion.div>
              <h1 className="text-4xl font-serif font-bold text-[#F1F8E9] mb-3 tracking-tight">
                Secure Access
              </h1>
              <p className="text-[#F1F8E9]/60 font-medium tracking-wide text-sm">
                NINETEEN06 ARTISAN BAKERY • RESTRICTED AREA
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input
                  type="password"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Security Code"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[#F1F8E9] placeholder:text-white/20 focus:outline-none focus:border-[#8CB874]/50 focus:bg-white/8 transition-all text-center text-xl tracking-[0.5em] font-mono"
                  autoFocus
                />
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-[#8CB874]"
                  initial={{ width: "0%" }}
                  animate={{ width: code.length > 0 ? "100%" : "0%" }}
                />
              </div>

              <button
                type="submit"
                disabled={checking || !code}
                className="w-full group relative overflow-hidden bg-[#8CB874] text-[#0F170B] rounded-2xl py-4 font-bold text-lg transition-all hover:bg-[#AED581] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-2">
                  {checking ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-[#0F170B]/30 border-t-[#0F170B] rounded-full"
                    />
                  ) : (
                    <>
                      <span>Unlock Dashboard</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-center gap-2 text-white/30 text-xs tracking-widest uppercase font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>End-to-End Encrypted Terminal</span>
            </div>
          </motion.div>
          
          {/* Subtle logo in background */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-10 select-none pointer-events-none">
            <h2 className="text-4xl font-serif italic font-bold text-white">Nineteen06</h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
