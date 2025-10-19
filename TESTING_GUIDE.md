# MicroWin - Comprehensive Testing Guide

This guide outlines all the features that have been implemented and provides step-by-step testing procedures.

## Prerequisites
- PostgreSQL database is running
- Environment variables are configured
- Application is running on http://localhost:3000

## 1. Authentication & User Management

### Test User Registration
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Fill in:
   - First Name: Test
   - Last Name: User
   - Email: testuser@example.com
   - Password: Test123!
4. Click "Create Account"
5. **Expected**: User is created with 0.00 wallet balance (not 1000)
6. **Verify**: User is redirected to dashboard

### Test User Login
1. Navigate to `/auth`
2. Enter credentials
3. Click "Sign In"
4. **Expected**: Redirect to dashboard with user profile loaded

## 2. Task Application System

### Test Task Application Submission
1. Login as a worker
2. Navigate to `/marketplace`
3. Browse available tasks
4. Click "Apply" on any task
5. Fill in application form with:
   - Proposal message
   - Estimated time
   - Bid amount
6. Click "Submit Application"
7. **Expected**: 
   - Success message appears
   - Application is saved to database
   - Application status is "pending"

### Test Application Approval (Employer Side)
1. Login as task owner/employer
2. Navigate to dashboard
3. Go to "Messages" section
4. Find conversation with applicant
5. Review application details
6. Click "Accept Application"
7. **Expected**:
   - Application status changes to "accepted"
   - Task moves to worker's active tasks
   - Notification sent to worker

### Test Application Rejection
1. Follow steps 1-5 above
2. Click "Reject Application"
3. **Expected**:
   - Application status changes to "rejected"
   - Worker is notified

## 3. Real-Time Messaging System

### Test Message Sending
1. Login as user
2. Navigate to Messages
3. Select a conversation or start new one
4. Type a message
5. Click send button
6. **Expected**:
   - Message appears instantly
   - Message is saved to database
   - Timestamp is displayed

### Test Emoji Picker
1. In message compose area
2. Click emoji button (😊)
3. Select an emoji from picker
4. **Expected**:
   - Emoji is inserted into message
   - Can send emoji in message

### Test Sticker Sending
1. In message compose area
2. Click sticker button
3. Browse sticker categories
4. Select a sticker
5. **Expected**:
   - Sticker is sent as message
   - Displays properly in conversation

### Test Message Read Status
1. Send a message to another user
2. Wait for recipient to view
3. **Expected**:
   - Message shows as "delivered"
   - Changes to "read" when viewed

## 4. Payment & Commission System

### Test Direct Wallet Transfer
1. Login as employer
2. Navigate to Messages
3. Open conversation with worker
4. Click "Send Payment" button
5. Enter amount (e.g., 1000)
6. Add optional note
7. Click "Send Payment"
8. **Expected**:
   - 1% commission (10) deducted
   - Worker receives 990
   - Admin account receives 10
   - Transaction recorded in database

### Test Wallet Balance Update
1. After payment transaction
2. Check sender's wallet
3. **Expected**: Balance decreased by full amount (1000)
4. Check receiver's wallet
5. **Expected**: Balance increased by amount minus commission (990)
6. Check admin wallet
7. **Expected**: Balance increased by commission (10)

### Test Transaction History
1. Navigate to Wallet section
2. View transaction history
3. **Expected**:
   - All transactions listed
   - Shows type (credit/debit)
   - Shows commission amount
   - Displays timestamps
   - Shows sender/recipient

## 5. KYC Verification System

### Test KYC Document Submission
1. Login as user
2. Navigate to Profile section
3. Scroll to "KYC Verification"
4. Select document type (e.g., Aadhar, PAN)
5. Click upload area
6. Select image/PDF file (max 5MB)
7. Click "Submit for Verification"
8. **Expected**:
   - Success message displayed
   - Status changes to "Pending"
   - Document uploaded to database
   - Submitted timestamp recorded

### Test KYC Admin Verification
1. Login as admin user
2. Navigate to dashboard
3. Click user menu → "KYC Verification"
4. See list of pending KYC submissions
5. Click "Review" on a submission
6. View document details
7. Click "Approve" or "Reject"
8. If rejecting, enter reason
9. **Expected**:
   - Status updates to "verified" or "rejected"
   - User is notified
   - Verification timestamp recorded
   - Rejection reason saved (if rejected)

### Test KYC Benefits
1. After verification approval
2. Check user profile
3. **Expected**:
   - Shows "Verified" badge
   - Verified date displayed
   - Status shows green checkmark

## 6. Profile Picture Sync

### Test Avatar Update
1. Login as user
2. Navigate to Profile section
3. Click camera icon on avatar
4. Select new avatar from gallery or upload custom
5. Save profile changes
6. **Expected**:
   - Avatar updates immediately
   - New avatar shows in navbar
   - New avatar shows in messages
   - New avatar shows in task applications

### Test Avatar Display Consistency
1. After avatar update
2. Check multiple locations:
   - Dashboard navbar
   - Profile page
   - Message conversations
   - Task listings (if user posted tasks)
3. **Expected**: Same avatar displayed everywhere

## 7. Admin Panel Features

### Test Admin Commission Settings
1. Login as admin
2. Navigate to admin settings (if separate admin panel)
3. Find commission rate setting
4. Update commission rate (e.g., change from 1% to 2%)
5. Save changes
6. Test a new payment transaction
7. **Expected**:
   - New commission rate is applied
   - Calculation is correct

### Test Admin KYC Management
1. Login as admin
2. Access KYC verification panel
3. View all pending submissions
4. Filter by status
5. Approve/reject submissions
6. **Expected**:
   - All KYC submissions visible
   - Can sort and filter
   - Actions work correctly
   - User notifications sent

## 8. Database Integrity Tests

### Test Wallet Balance Consistency
1. Record initial balances for test users
2. Perform multiple transactions
3. Check wallet balances
4. Sum all transactions
5. **Expected**:
   - Balances match transaction history
   - No money created or lost
   - Commission properly accounted

### Test Application Linking
1. Submit task application
2. Check database for:
   - Application record
   - Task association
   - User association
3. Accept application
4. Verify messages table includes application_id
5. **Expected**:
   - All relationships maintained
   - Foreign keys intact

## 9. Edge Cases & Error Handling

### Test Insufficient Wallet Balance
1. Try to send payment exceeding wallet balance
2. **Expected**: Error message, transaction blocked

### Test Invalid KYC Upload
1. Try uploading file > 5MB
2. **Expected**: Error message displayed

### Test Duplicate Application
1. Try applying to same task twice
2. **Expected**: Error or warning displayed

### Test Message to Non-Existent User
1. Try sending message to invalid user ID
2. **Expected**: Error handled gracefully

## 10. Security Tests

### Test Authentication Required
1. Try accessing dashboard without login
2. **Expected**: Redirect to /auth

### Test Admin-Only Routes
1. Login as regular user
2. Try accessing `/api/admin/kyc`
3. **Expected**: 403 Forbidden error

### Test Transaction Authorization
1. Try to send payment from another user's wallet (via API manipulation)
2. **Expected**: Authorization check prevents it

## Performance Tests

### Test Message Loading
1. Create conversation with 100+ messages
2. Open conversation
3. **Expected**: Messages load quickly, pagination works

### Test Task Marketplace
1. Create 50+ tasks
2. Browse marketplace
3. Apply filters
4. **Expected**: Fast loading, smooth filtering

## Browser Compatibility

Test all features in:
- Chrome
- Firefox
- Safari
- Edge

## Mobile Responsiveness

Test UI on:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

---

## Bug Reporting Template

When reporting bugs, include:
1. **Steps to Reproduce**: Detailed steps
2. **Expected Behavior**: What should happen
3. **Actual Behavior**: What actually happened
4. **Screenshots**: If applicable
5. **Browser/Device**: Environment details
6. **Console Errors**: Any JavaScript errors

## Test Results Checklist

Mark each section when completed:

- [ ] Authentication & User Management
- [ ] Task Application System
- [ ] Real-Time Messaging
- [ ] Payment & Commission
- [ ] KYC Verification
- [ ] Profile Picture Sync
- [ ] Admin Panel Features
- [ ] Database Integrity
- [ ] Edge Cases
- [ ] Security
- [ ] Performance
- [ ] Browser Compatibility
- [ ] Mobile Responsiveness

---

## Notes

- Test with fresh database for accurate results
- Use multiple test accounts for different roles
- Clear browser cache between major test runs
- Monitor database queries during performance testing
- Check browser console for errors during all tests

## Support

For issues or questions during testing, check:
- Application logs
- Browser console
- Database logs
- Network tab in dev tools
