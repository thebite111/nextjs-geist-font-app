'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function DemoPayPalPayment() {
  const [countdown, setCountdown] = useState(3)
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount') || '1.00'
  const currency = searchParams.get('currency') || 'USD'

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Close the window to simulate payment completion
          window.close()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.164 3.805C8.654 2.315 10.615 1.5 12.747 1.5c2.132 0 4.093.815 5.583 2.305 1.49 1.49 2.305 3.451 2.305 5.583s-.815 4.093-2.305 5.583L12.747 20.5 7.164 14.971C5.674 13.481 4.859 11.52 4.859 9.388s.815-4.093 2.305-5.583z"/>
              <circle cx="12.747" cy="9.388" r="2.194"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PayPal Payment Demo</h1>
          <p className="text-gray-600">This is a demonstration of the PayPal integration</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-2">Payment Amount</div>
          <div className="text-2xl font-bold text-gray-900">{currency} ${amount}</div>
          <div className="text-sm text-gray-600 mt-1">= 10 Credits</div>
        </div>

        <div className="mb-6">
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Simulating Payment Processing...
          </div>
          <div className="text-3xl font-bold text-blue-600">{countdown}</div>
          <div className="text-sm text-gray-600">Auto-closing in {countdown} seconds</div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.close()}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            ✓ Complete Payment (Demo)
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel Payment
          </button>
        </div>

        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-700">
            <strong>Demo Mode:</strong> This is a simulation. In production, this would be the actual PayPal payment page.
          </p>
        </div>
      </div>
    </div>
  )
}
