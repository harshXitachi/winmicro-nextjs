# Campaign Hub - Implementation Guide

## 🎯 Project Overview
The Campaign Hub is a comprehensive collaborative workforce system that allows users to switch between **Employer** and **Worker** roles. Employers can create large-scale campaigns with group chats and make targeted bonus payments to workers for exceptional contributions.

## ✅ Completed Components

### 1. Database Schema & Migration
- **File**: `src/lib/db/schema.ts` (Updated)
- **Migration**: `src/lib/db/migrations/003_campaign_system.sql`
- **Tables Created**:
  - `campaigns` - Main campaign information
  - `campaign_members` - User membership in campaigns
  - `campaign_chat_messages` - Group chat messages
  - `campaign_submissions` - Worker task submissions
  - `campaign_bonus_payments` - Bonus payment records

### 2. API Routes (All Complete)
All API endpoints are fully implemented and ready to use:

#### `/api/campaigns` - Main Campaigns API
- `GET` - List campaigns (filtered by role: employer/worker)
- `POST` - Create new campaign

#### `/api/campaigns/[id]` - Campaign Details
- `GET` - Get campaign details with membership info
- `PATCH` - Update campaign (employer only)
- `DELETE` - Delete campaign (employer only)

#### `/api/campaigns/[id]/members` - Member Management
- `GET` - List campaign members with user details
- `POST` - Join campaign (workers)
- `DELETE` - Remove member (employer only)

#### `/api/campaigns/[id]/chat` - Group Chat
- `GET` - Fetch chat messages (with pagination)
- `POST` - Send message (members only)

#### `/api/campaigns/[id]/submissions` - Work Submissions
- `GET` - List submissions (employer sees all, workers see own)
- `POST` - Submit work (workers)
- `PATCH` - Review submission (employer only)

#### `/api/campaigns/[id]/bonus-payment` - Bonus Payments
- `POST` - Send bonus payment to specific worker (employer only)
  - Updates worker wallet
  - Creates transaction record
  - Posts notification in group chat

### 3. UI Pages Created

#### Role Selection Page ✅
- **Path**: `/campaigns/role-selection`
- **File**: `src/app/campaigns/role-selection/page.tsx`
- **Features**:
  - Beautiful dual-card layout
  - Employer and Worker role selection
  - Smooth animations and transitions
  - Direct navigation to respective dashboards

## 🚧 Remaining UI Components to Build

### 1. Employer Dashboard
**Path**: `/campaigns/employer/dashboard`
**File to Create**: `src/app/campaigns/employer/dashboard/page.tsx`

**Required Features**:
- Dashboard widgets showing:
  - Active Campaigns count
  - Total Workers Engaged
  - Budget Spent (This Month)
  - Recent Activity Feed
- Sidebar navigation:
  - Dashboard (active by default)
  - Create Campaign
  - My Campaigns
  - Wallet & Transactions
  - Analytics
- Quick action buttons
- Campaign list with status indicators

### 2. Create Campaign Wizard
**Path**: `/campaigns/employer/create`
**File to Create**: `src/app/campaigns/employer/create/page.tsx`

**Required Features** (4-Step Wizard):
- **Step 1: Campaign Fundamentals**
  - Campaign Name
  - Campaign Type (One-Off / Ongoing)
  - Enable Group Chat toggle

- **Step 2: Task & Team Details**
  - Category dropdown
  - Required Skills (tag-based)
  - Detailed Instructions (rich text editor)
  - Target Number of Workers
  - Visibility (Public / Private)

- **Step 3: Compensation & Budget**
  - Payment Model (Fixed / Milestone)
  - Base Payment per Worker
  - Currency selection (INR/USD/USDT)
  - Initial Deposit calculation
  - Escrow information

- **Step 4: Review & Launch**
  - Summary of all details
  - Edit buttons for each section
  - Launch Campaign button

### 3. Campaign Detail/Management Page (Employer)
**Path**: `/campaigns/employer/campaign/[id]`
**File to Create**: `src/app/campaigns/employer/campaign/[id]/page.tsx`

**Required Features**:
- Campaign Overview section
  - Progress bar (X/Y Workers Joined)
  - Campaign stats
  - Status badge
- Worker Roster
  - List of all members
  - Success rate display
  - Remove worker button
- Task Submissions Area
  - Pending submissions list
  - Approve/Reject buttons
  - Review notes input
- Integrated Group Chat (use GroupChatComponent)
- Pay Worker button in chat
  - Opens modal with member list
  - Amount input
  - Confirmation dialog

### 4. Worker Marketplace
**Path**: `/campaigns/worker/marketplace`
**File to Create**: `src/app/campaigns/worker/marketplace/page.tsx`

**Required Features**:
- Campaign cards grid/list view
- Filtering sidebar:
  - By Category
  - By Required Skills
  - By Payment (High to Low)
  - By Campaign Type
- Each campaign card shows:
  - Campaign name
  - Employer name
  - Base payment + currency
  - Open slots (X/Y)
  - Required skills tags
  - "View Details" button
- Campaign detail modal or page
  - Full description
  - Instructions
  - Join Campaign button

### 5. Campaign Detail Page (Worker View)
**Path**: `/campaigns/worker/campaign/[id]`
**File to Create**: `src/app/campaigns/worker/campaign/[id]/page.tsx`

**Required Features**:
- Campaign information display
- Join Campaign button (if not member)
- Group Chat access (if member)
- Submit Task button/form
- My Submissions list
  - Status indicators
  - Review notes (if any)

### 6. Reusable Group Chat Component
**File to Create**: `src/components/feature/GroupChatComponent.tsx`

**Required Features**:
- Message list with auto-scroll
- Message input field
- Send button
- System messages (joins, payments) styled differently
- Payment notification messages highlighted
- Admin controls (if user is employer):
  - Pay Worker button
  - Mute/Remove user options
  - Pin message functionality
- Real-time message display
- User avatars next to messages
- Timestamp display

## 📋 Integration Steps

### Step 1: Run Database Migration
```bash
# Update your database with the new schema
npm run db:migrate
```

### Step 2: Update Navigation
Add "Campaigns" to the main dashboard navigation:

**File**: `src/app/dashboard/components/DashboardNavbar.tsx`

Add this navigation item:
```tsx
<button
  onClick={() => setActiveSection('campaigns')}
  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
    activeSection === 'campaigns'
      ? 'bg-indigo-600 text-white'
      : 'text-gray-700 hover:bg-gray-100'
  }`}
>
  <i className="ri-flag-line text-xl"></i>
  <span>Campaigns</span>
</button>
```

And add the route handler:
```tsx
case 'campaigns':
  router.push('/campaigns/role-selection');
  break;
```

### Step 3: Build Remaining UI Components
Follow the structure above to create each remaining page. Use these patterns:

**Fetching Campaigns (Employer)**:
```tsx
const response = await fetch('/api/campaigns?role=employer');
const { campaigns } = await response.json();
```

**Fetching Campaigns (Worker)**:
```tsx
const response = await fetch('/api/campaigns?role=worker');
const { campaigns } = await response.json();
```

**Creating a Campaign**:
```tsx
const response = await fetch('/api/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Q4 Social Media Blast',
    description: 'Help us with social media content',
    type: 'ongoing',
    category: 'Social Media',
    required_skills: ['#social-media', '#content-creation'],
    target_workers: 50,
    base_payment: 10.00,
    currency: 'USD',
    visibility: 'public',
    group_chat_enabled: true,
    initial_deposit: 500.00
  })
});
```

**Joining a Campaign**:
```tsx
const response = await fetch(`/api/campaigns/${campaignId}/members`, {
  method: 'POST'
});
```

**Sending a Bonus Payment**:
```tsx
const response = await fetch(`/api/campaigns/${campaignId}/bonus-payment`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    worker_id: 'user-uuid-here',
    amount: 5.00,
    note: 'Excellent work on the last submission!'
  })
});
```

## 🎨 Design Guidelines

### Color Scheme
- **Employer**: Indigo (`indigo-600`, `indigo-700`)
- **Worker**: Purple (`purple-600`, `purple-700`)
- **Success**: Green (`green-500`, `green-600`)
- **Warning**: Yellow/Orange (`yellow-500`, `orange-500`)
- **Danger**: Red (`red-500`, `red-600`)

### Icons (Remix Icon)
- Campaign: `ri-flag-line`
- Employer: `ri-briefcase-line`
- Worker: `ri-tools-line`
- Chat: `ri-message-3-line`
- Payment: `ri-money-dollar-circle-line`
- Submit: `ri-upload-line`
- Members: `ri-team-line`

### Responsive Breakpoints
- Mobile: Default (< 640px)
- Tablet: `sm:` (≥ 640px)
- Desktop: `lg:` (≥ 1024px)

## 🔔 Notifications System

The notification system hooks are already in place through the API. When implementing the UI notification component, listen for these events:

1. **Campaign Join**: When a worker joins a campaign
2. **New Message**: When a new chat message is posted
3. **Submission Review**: When employer reviews a submission
4. **Bonus Payment**: When employer sends a bonus payment
5. **Campaign Status Change**: When campaign is paused/completed/cancelled

## 🧪 Testing Checklist

### Employer Flow
- [ ] Create a new campaign
- [ ] View campaign dashboard
- [ ] See workers joining
- [ ] View and respond to submissions
- [ ] Send messages in group chat
- [ ] Send bonus payment to a worker
- [ ] Remove a worker from campaign
- [ ] Pause/Complete campaign

### Worker Flow
- [ ] Browse campaign marketplace
- [ ] Filter campaigns by category/skills
- [ ] Join a campaign
- [ ] Access group chat
- [ ] Submit work
- [ ] Receive bonus payment notification
- [ ] See updated wallet balance

## 📦 Database Schema Reference

### Campaign Status Values
- `active` - Campaign is accepting workers
- `paused` - Temporarily not accepting
- `completed` - Successfully finished
- `cancelled` - Terminated early

### Member Status Values
- `active` - Currently in campaign
- `removed` - Kicked by employer
- `left` - Left voluntarily

### Submission Status Values
- `pending` - Awaiting review
- `approved` - Accepted by employer
- `rejected` - Declined by employer

### Message Types
- `text` - Regular chat message
- `system` - System notification (joins, leaves)
- `payment_notification` - Bonus payment announcement

## 🚀 Next Steps

1. Create the Employer Dashboard page
2. Build the Create Campaign Wizard
3. Implement the Campaign Management page with integrated chat
4. Build the Worker Marketplace
5. Create the GroupChatComponent
6. Add campaign navigation to main dashboard
7. Implement notification system
8. Test complete user journeys
9. Add analytics/reporting features (optional)

## 💡 Enhancement Ideas

1. **Real-time Chat**: Integrate WebSockets or Server-Sent Events for live chat
2. **File Uploads**: Allow workers to upload proof files
3. **Campaign Templates**: Pre-defined campaign templates for common use cases
4. **Skill Verification**: Badge system for verified skills
5. **Dispute Resolution**: Built-in dispute handling between employers and workers
6. **Rating System**: Workers rate campaigns, employers rate workers
7. **Campaign Analytics**: Detailed charts and metrics
8. **Milestone Payments**: Support for milestone-based payment models
9. **Bulk Actions**: Pay multiple workers at once
10. **Export Reports**: CSV/PDF export of campaign data

---

**Created**: $(date)
**Status**: Database & API Complete ✅ | UI In Progress 🚧
**Next Priority**: Employer Dashboard & Create Campaign Wizard
