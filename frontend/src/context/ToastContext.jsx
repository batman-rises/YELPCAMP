import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast-enter flex items-start gap-3 px-4 py-3 rounded-xl shadow-lifted border text-sm font-medium
              ${toast.type === 'success'
                ? 'bg-white border-forest-200 text-forest-900'
                : 'bg-white border-red-200 text-red-800'
              }`}
          >
            {toast.type === 'success'
              ? <CheckCircle size={18} className="text-forest-600 mt-0.5 shrink-0" />
              : <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            }
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
