// PayPal configuration
const clientId = process.env.PAYPAL_CLIENT_ID || ''
const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''
const baseURL = process.env.PAYPAL_ENVIRONMENT === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com'

// Demo mode for invalid credentials or when explicitly enabled
const isDemoMode = process.env.PAYPAL_DEMO_MODE === 'true' || !clientId || !clientSecret

// Get PayPal access token
export async function getPayPalAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    
    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('PayPal access token error:', error)
    throw error
  }
}

// Create PayPal order
export async function createPayPalOrder(amount: string, currency: string = 'USD') {
  // Demo mode - return mock order
  if (isDemoMode) {
    return {
      id: `DEMO_ORDER_${Date.now()}`,
      status: 'CREATED',
      links: [
        {
          rel: 'approve',
          href: `${process.env.NEXT_PUBLIC_BASE_URL}/demo-paypal-payment?amount=${amount}&currency=${currency}`
        }
      ]
    }
  }

  try {
    const accessToken = await getPayPalAccessToken()
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      },
    }

    const response = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      throw new Error(`PayPal order creation failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('PayPal order creation error:', error)
    throw error
  }
}

// Capture PayPal order
export async function capturePayPalOrder(orderId: string) {
  // Demo mode - return mock capture
  if (isDemoMode || orderId.startsWith('DEMO_ORDER_')) {
    return {
      id: orderId,
      status: 'COMPLETED',
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: `DEMO_CAPTURE_${Date.now()}`,
                amount: {
                  value: '1.00',
                  currency_code: 'USD'
                }
              }
            ]
          }
        }
      ]
    }
  }

  try {
    const accessToken = await getPayPalAccessToken()
    
    const response = await fetch(`${baseURL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`PayPal order capture failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('PayPal order capture error:', error)
    throw error
  }
}

// Verify PayPal webhook signature
export function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
  webhookId: string
): boolean {
  // In a production environment, you would implement proper webhook verification
  // For now, we'll do basic validation
  return !!(headers['paypal-transmission-id'] && headers['paypal-cert-id'] && body.length > 0)
}

// Get order details
export async function getPayPalOrderDetails(orderId: string) {
  // Demo mode - return mock order details
  if (isDemoMode || orderId.startsWith('DEMO_ORDER_')) {
    return {
      id: orderId,
      status: 'APPROVED',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '1.00'
          }
        }
      ]
    }
  }

  try {
    const accessToken = await getPayPalAccessToken()
    
    const response = await fetch(`${baseURL}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`PayPal order details failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('PayPal order details error:', error)
    throw error
  }
}
