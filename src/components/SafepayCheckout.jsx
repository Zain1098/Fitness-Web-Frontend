import { useState } from 'react'
import axios from 'axios'

const SafepayCheckout = ({ plan = 'monthly' }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('token')
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`,
        { plan },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success && response.data.checkout_url) {
        // Redirect to Safepay checkout page
        window.location.href = response.data.checkout_url
      } else {
        setError('Failed to create checkout session')
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.response?.data?.error || 'Payment initialization failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Subscribe Now'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  )
}

export default SafepayCheckout
