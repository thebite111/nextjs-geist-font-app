import nodemailer from 'nodemailer'

// Check if we're in development mode or missing email credentials
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.SMTP_USER || !process.env.SMTP_PASS

// Email configuration
const transporter = isDevelopment 
  ? null // Don't create transporter in development
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

export const sendVerificationEmail = async (email: string, username: string, token: string) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/verify-email?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@kpopforms.com',
    to: email,
    subject: 'Verify Your Email - K-Pop Forms',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">K</span>
          </div>
          <h1 style="color: #1f2937; margin: 0;">Welcome to KPOPFORMS!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${username}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for signing up for KPOPFORMS! To complete your registration and start submitting video requests, please verify your email address.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #7c3aed; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 14px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  }

  // In development or without SMTP credentials, log email to console
  if (isDevelopment) {
    console.log('\n=== EMAIL VERIFICATION (Development Mode) ===')
    console.log(`To: ${email}`)
    console.log(`Subject: ${mailOptions.subject}`)
    console.log(`Verification URL: ${verificationUrl}`)
    console.log('===============================================\n')
    return { success: true, developmentMode: true }
  }

  try {
    await transporter!.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export const sendPasswordResetEmail = async (email: string, username: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/reset-password?token=${token}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@kpopforms.com',
    to: email,
    subject: 'Reset Your Password - KPOPFORMS',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background: #7c3aed; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">K</span>
          </div>
          <h1 style="color: #1f2937; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${username}!</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            We received a request to reset your password for your KPOPFORMS account. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin-bottom: 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 14px;">
          <p>This reset link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  }

  // In development or without SMTP credentials, log email to console
  if (isDevelopment) {
    console.log('\n=== PASSWORD RESET EMAIL (Development Mode) ===')
    console.log(`To: ${email}`)
    console.log(`Subject: ${mailOptions.subject}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('===============================================\n')
    return { success: true, developmentMode: true }
  }

  try {
    await transporter!.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}
