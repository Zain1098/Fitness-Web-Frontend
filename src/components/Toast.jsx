import { useState, useEffect } from 'react'
import './Toast.css'

let toastId = 0
const toastListeners = new Set()

export function showToast(message, type = 'info', duration = 5000) {
  const toast = { id: ++toastId, message, type, duration }
  toastListeners.forEach(listener => listener(toast))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, toast.duration)
    }
    toastListeners.add(listener)
    return () => toastListeners.delete(listener)
  }, [])

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'info' && 'ℹ'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button 
            className="toast-close" 
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
