# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Development
- `npm run dev` - Start development server with Turbopack (fastest hot reload)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run db:migrate` - Run database migrations

### Database
- Database uses Drizzle ORM with PostgreSQL (via Neon)
- Schema defined in `src/lib/db/schema.ts`
- Migration script: `scripts/migrate.js`

## Architecture Overview

### Authentication Flow
1. **User Auth (Client-side + Server)**
   - JWT tokens stored as HTTP-only cookies (`auth_token`)
   - Middleware in `src/middleware.ts` protects routes
   - Auth provider wraps entire app for context
   - useAuth hook provides user/profile/isAdmin state across app

2. **Admin Auth (Client-side only)**
   - Admin sessions stored in localStorage (`admin_session`)
   - Separate from user auth; no server-side validation yet
   - Admin can exist as user with `role: 'admin'`

### API Structure
- Routes: `src/app/api/` with Next.js App Router route handlers
- Pattern: `/api/{resource}/{action}` (e.g., `/api/auth/signin`, `/api/tasks`)
- Client-side API calls in `src/lib/api-client.ts` (exported as `src/lib/supabase.ts` for backward compatibility)
- All API endpoints expect credentials with `credentials: 'include'`

### Core Features

**Authentication:**
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/auth/signout` - User logout
- `/api/auth/me` - Get current user

**Tasks & Applications:**
- `/api/tasks` - CRUD operations for tasks
- `/api/applications` - Apply to tasks, accept/reject applications

**User Profiles:**
- `/api/profile/{userId}` - Get/update user profile
- Profiles include: skills, rating, earnings, wallet balances (INR/USD/USDT), level, KYC status

**Wallets & Payments:**
- Multi-currency support: INR, USD, USDT
- `/api/wallet/transactions` - Get transaction history
- `/api/wallet/balance` - Update wallet balance
- `/api/payments` - Payment processing with PayPal/PhonePe support

**Admin Features:**
- `/api/admin/settings` - Manage platform settings, commission rates
- `/api/admin/users` - List all users
- `/api/admin/transactions` - View all transactions
- Commission system with admin wallet tracking

**Campaigns (Multi-worker projects):**
- `/api/campaigns` - Create group tasks with multiple workers
- Group chat: `/api/campaigns/chat`
- Submissions: `/api/campaigns/submissions`
- Bonus payments between campaign members

**Messages:**
- `/api/messages` - Direct messaging, task-related messages, payment notifications

### Data Model Relationships
```
users (1) -> (many) profiles, tasks, applications, messages
users (1) -> (many) wallet_transactions, payment_transactions
tasks (1) -> (many) applications, messages
campaigns (1) -> (many) campaign_members, campaign_chat_messages, campaign_submissions
admin_settings & admin_wallets - Platform-wide configuration
```

### Key Database Tables
- **users**: Core user data with role (user/admin), ban status
- **profiles**: Extended user info (skills, rating, wallet balances, KYC)
- **tasks**: Freelance task listings with client/freelancer assignment
- **applications**: Freelancer applications to tasks
- **campaigns**: Group-based projects with multiple workers
- **wallet_transactions**: All balance transfers (credits/debits)
- **payment_transactions**: External payment gateway records
- **admin_settings**: Platform configuration (commission %, min/max deposits)
- **commission_settings**: Multi-currency deposit/withdrawal limits

### Frontend Pages

**Public:**
- `/` - Homepage with hero, about, services, blog sections
- `/auth` - Login/signup with role selection

**User Dashboard:**
- `/dashboard` - Overview, tasks, messages, wallet
- `/marketplace` - Browse and apply to tasks
- `/wallet` - View balance, transaction history
- `/profile-setup` - Complete user profile after signup

**Campaigns:**
- `/campaigns/employer/create` - Create group task
- `/campaigns/employer/dashboard` - Manage campaigns
- `/campaigns/worker/marketplace` - Browse campaigns

**Admin:**
- `/admin/auth` - Admin login (separate from user auth)
- `/admin/dashboard` - Analytics, user management
- `/admin/commission` - Track commissions
- `/admin/settings` - Configure platform

### Styling & Components
- **Tailwind CSS** for styling
- **GSAP** for scroll animations
- **Remix Icon** for icons
- **Reusable components**: `src/components/base/` and `src/components/feature/`
- **Dark mode context**: `src/context/DarkModeContext.tsx`

### State Management & Context
- **AuthProvider** (`src/components/providers/AuthProvider.tsx`): Wraps app, manages user auth state
- **useAuth hook**: Access user, profile, isAdmin, refreshProfile
- **DarkModeContext**: Global dark mode toggle
- No Redux/Zustand - using React Context for simplicity

### Environment Variables
- `JWT_SECRET` - Secret key for JWT signing
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (public)
- Database connection via Neon (PostgreSQL)

### Important Implementation Notes

1. **Session Persistence**: Uses localStorage for admin sessions, HTTP-only cookies for user auth. Listen to storage events in useAuth for cross-tab sync.

2. **Multi-currency Wallets**: Profiles have separate balance fields (INR/USD/USDT) + default_currency preference. Commission settings control min/max per currency.

3. **Role-based Access**:
   - Admin routes: `/admin/*` redirects to `/admin/auth` if no admin_session
   - Protected user routes: Redirect to `/auth` if no valid JWT token
   - Middleware handles redirects for authenticated users

4. **Commission Tracking**: 
   - Separate admin_wallets table per currency
   - Commission calculated on deposits/transfers based on commission_settings
   - Tracked in wallet_transactions with commission_amount field

5. **KYC Integration**: Profiles have kyc_status, document_url, and verified_at fields for identity verification workflow.

6. **Campaigns Feature**: Advanced feature for group-based tasks with:
   - Member roles (worker/admin), status tracking
   - Group chat with message types (text/system/payment_notification)
   - Submission approval workflow
   - Direct bonus payments between members

## Performance Considerations
- Using Turbopack for faster development builds
- JWT tokens expire after 7 days
- Database queries use Drizzle ORM with efficient selectors
- GSAP animations lazy-loaded after interactive

## Common Debugging
- Check browser console for auth state (useAuth hook logs state changes)
- Verify JWT in cookies: DevTools > Application > Cookies > auth_token
- Admin session in localStorage: DevTools > Application > Local Storage > admin_session
- API errors returned in response body with error field and optional details
