# MicroWin Next.js - Micro Task Platform

Complete conversion of the React MicroWin website to Next.js with all features intact.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✨ Features

- ✅ **User Authentication** - Login/Signup with demo data
- ✅ **Admin Dashboard** - Complete admin panel with analytics
- ✅ **Task Marketplace** - Browse, create, and apply to micro tasks
- ✅ **User Dashboard** - Overview, tasks, messages, wallet, profile
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Responsive Design** - Works on all devices
- ✅ **GSAP Animations** - Smooth scroll animations
- ✅ **Turbopack** - Fast development with Next.js Turbopack

## 🔑 Test Credentials

### Admin Access
- **Email:** admin@gmail.com
- **Password:** admin1
- **Dashboard:** [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

### Create New User
1. Go to [http://localhost:3000/auth](http://localhost:3000/auth)
2. Click "Sign Up"
3. Fill in your details
4. Login with your credentials

## 📁 Project Structure

```
winmicro-nextjs/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Home page
│   │   ├── auth/                # Authentication
│   │   ├── dashboard/           # User dashboard
│   │   ├── marketplace/         # Task marketplace
│   │   ├── admin/               # Admin dashboard
│   │   └── home/components/     # Home page components
│   ├── components/
│   │   ├── feature/             # Navbar, Footer
│   │   └── providers/           # Auth provider
│   ├── hooks/                   # Custom hooks (useAuth)
│   ├── lib/                     # Supabase & utilities
│   └── i18n/                    # Internationalization
├── public/                      # Static assets
└── package.json
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** GSAP
- **Icons:** Remix Icon
- **Fonts:** Google Fonts (Pacifico)
- **Build Tool:** Turbopack

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🐛 Debugging

If you encounter login issues:
1. Open browser console (F12)
2. Check for console logs starting with 🔐, ✅, or ❌
3. Verify localStorage has `user_session` or `admin_session`
4. Clear browser cache and try again

## 📄 License

This is a demo project for educational purposes.

## 🤝 Support

For issues or questions, please check the browser console for error messages.