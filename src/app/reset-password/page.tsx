'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setError('Invalid or missing reset token')
      return
    }
    setToken(tokenParam)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setError(data.error || 'Password reset failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <div className="text-white font-bold">K</div>
            </div>
            <span className="text-lg font-semibold text-gray-900">KPOPFORMS</span>
          </Link>
        </div>
      </header>

      {/* Reset Password Form */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-md p-3">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link 
                href="/login" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
