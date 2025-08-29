# K-Pop Forms Website Deployment Guide

## 🚀 Hosting Options

### **Option 1: Vercel (Recommended - Free)**
Vercel is the easiest option for Next.js applications and offers excellent free hosting.

#### Steps:
1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Connect GitHub**: Link your GitHub account to Vercel
3. **Upload Code**: Push your project to a GitHub repository
4. **Deploy**: Import your repository in Vercel dashboard
5. **Environment Variables**: Add your environment variables in Vercel dashboard:
   - `GENIUS_ACCESS_TOKEN`
   - `EMAIL_USER` (if using email features)
   - `EMAIL_PASS` (if using email features)

#### Benefits:
- ✅ Free hosting
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL certificates
- ✅ Global CDN
- ✅ Perfect for Next.js

---

### **Option 2: Netlify (Free)**
Great alternative with similar features to Vercel.

#### Steps:
1. **Create Account**: Sign up at [netlify.com](https://netlify.com)
2. **Connect Repository**: Link your GitHub repository
3. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Environment Variables**: Add in Netlify dashboard
5. **Deploy**: Automatic deployment on code changes

---

### **Option 3: Railway (Paid - $5/month)**
Good for applications that need persistent databases.

#### Steps:
1. **Create Account**: Sign up at [railway.app](https://railway.app)
2. **Deploy from GitHub**: Connect your repository
3. **Add Database**: Railway provides PostgreSQL databases
4. **Environment Variables**: Configure in Railway dashboard
5. **Custom Domain**: Add your domain in settings

---

### **Option 4: DigitalOcean App Platform (Paid - $12/month)**
Professional hosting with more control.

#### Steps:
1. **Create Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Create App**: Use App Platform
3. **Connect Repository**: Link GitHub repository
4. **Configure Build**: Set build and run commands
5. **Add Database**: Optional managed database
6. **Deploy**: Automatic deployments

---

## 📋 Pre-Deployment Checklist

### **1. Environment Variables**
Create a `.env.local` file with:
```env
GENIUS_ACCESS_TOKEN=your_genius_token_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=https://yourdomain.com
```

### **2. Database Setup**
Your app currently uses in-memory storage. For production, consider:
- **SQLite**: Simple file-based database
- **PostgreSQL**: Robust cloud database
- **MySQL**: Popular relational database

### **3. Build Test**
Test your build locally:
```bash
npm run build
npm start
```

### **4. Domain Setup**
- Purchase domain from providers like Namecheap, GoDaddy, or Cloudflare
- Configure DNS to point to your hosting provider
- Enable SSL certificates (usually automatic)

---

## 🔧 Quick Start with Vercel (Recommended)

### **Step 1: Prepare Your Code**
```bash
# Create GitHub repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/kpop-forms.git
git push -u origin main
```

### **Step 2: Deploy to Vercel**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add environment variables
5. Click **Deploy**

### **Step 3: Custom Domain (Optional)**
1. Purchase domain from any registrar
2. In Vercel dashboard, go to **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. SSL certificate will be automatically provisioned

---

## 💾 Database Migration (For Production)

### **Current State**: In-memory storage (data lost on restart)
### **Production Ready**: Persistent database

#### **Option A: SQLite (Simple)**
```bash
npm install sqlite3
```

#### **Option B: PostgreSQL (Recommended)**
```bash
npm install pg @types/pg
```

#### **Option C: Supabase (Free PostgreSQL)**
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string
4. Update your database code

---

## 🌐 Custom Domain Setup

### **1. Purchase Domain**
- Namecheap: ~$10/year
- GoDaddy: ~$12/year
- Cloudflare: ~$8/year

### **2. Configure DNS**
Point your domain to your hosting provider:
- **Vercel**: Add CNAME record pointing to `cname.vercel-dns.com`
- **Netlify**: Add CNAME record pointing to your Netlify subdomain
- **Railway**: Follow Railway's DNS instructions

### **3. SSL Certificate**
Most hosting providers automatically provide SSL certificates for custom domains.

---

## 📊 Cost Breakdown

### **Free Options:**
- **Vercel**: Free (with usage limits)
- **Netlify**: Free (with usage limits)
- **Domain**: $8-12/year

### **Paid Options:**
- **Railway**: $5/month + domain
- **DigitalOcean**: $12/month + domain
- **Database**: $0-25/month depending on provider

---

## 🚨 Important Notes

1. **Environment Variables**: Never commit `.env.local` to GitHub
2. **Database**: Current app uses in-memory storage - data will be lost on restart
3. **Email**: Configure email service for password resets and notifications
4. **Monitoring**: Set up error tracking with services like Sentry
5. **Backups**: Implement database backups for production

---

## 🎯 Recommended Setup for K-Pop Forms

**For your K-Pop Forms website, I recommend:**

1. **Hosting**: Vercel (free, perfect for Next.js)
2. **Database**: Supabase (free PostgreSQL)
3. **Domain**: Namecheap (~$10/year)
4. **Email**: Gmail SMTP (free)

**Total Cost**: ~$10/year for domain only!

This setup will give you a professional, scalable website that can handle thousands of users while keeping costs minimal.
