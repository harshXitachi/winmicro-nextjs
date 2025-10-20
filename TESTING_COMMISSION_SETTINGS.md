# Testing Commission Settings Persistence

## Issue
Commission settings revert to default values after page refresh.

## Diagnostic Steps

### Step 1: Check Current Database State
Run this command to see what's currently in the database:
```bash
npm run db:init
```

This will show you the current commission_percentage and wallet states.

### Step 2: Test Settings Save

1. **Open Admin Dashboard**
   - Go to http://localhost:3000/admin/dashboard
   - Click on "Settings" in the sidebar

2. **Open Browser Console**
   - Press F12 (Windows) or Cmd+Option+J (Mac)
   - Go to "Console" tab

3. **Change Commission Rate**
   - Change commission from 2% to 4%
   - Click "Save Commission Settings"

4. **Check Console Logs**
   You should see:
   ```
   📝 PATCH /api/admin/wallet: Received body: {...}
   📊 Existing settings: {...}
   🔄 Preparing update data...
   ✅ Updating existing settings with ID: ...
   ✅ Settings updated successfully: {...}
   ```

5. **If you see errors**, screenshot them and share

### Step 3: Test Settings Load

1. **Refresh the page** (F5)

2. **Check Console Logs**
   You should see:
   ```
   📊 Loading commission settings from API...
   📊 Response status: 200
   📊 API Response data: {...}
   📊 Settings from API: {...}
   ✅ Loaded settings: {...}
   ```

3. **Verify the commission_percentage matches what you saved** (4% in this example)

### Step 4: Test Wallet Toggle

1. **Toggle INR Wallet** from OFF to ON
2. **Click "Save Commission Settings"**
3. **Check console** for success message
4. **Refresh page**
5. **Verify INR wallet is still ON** (should be green)

## Common Issues & Solutions

### Issue: Settings not saving
**Symptoms:** Console shows "❌ Failed to update commission settings"

**Solution:**
1. Check you're logged in as admin
2. Verify admin_session exists in localStorage (F12 > Application > Local Storage)
3. Check network tab (F12 > Network) for the PATCH request status

### Issue: Settings loading as default
**Symptoms:** Console shows "⚠️ No settings in response"

**Solution:**
1. Run `npm run db:init` to verify database has records
2. Check `/api/admin/wallet` GET response in Network tab
3. Verify response includes `settings` object

### Issue: INR wallet always OFF
**Check the database output:**
```bash
npm run db:init
```

If it shows `inr_wallet_enabled: false`, that's the ACTUAL saved state. The toggle is working correctly - it's showing the real database value.

## Manual Database Update (if needed)

If you want to reset to defaults, modify the init script and run:
```bash
npm run db:init
```

Or manually update via SQL:
```sql
UPDATE commission_settings 
SET 
  commission_percentage = '3.00',
  inr_wallet_enabled = true,
  usd_wallet_enabled = true,
  usdt_wallet_enabled = true
WHERE id = '99abb585-2adb-4c2b-af36-bb2fcf8849c0';
```

## What We Fixed

1. ✅ Added public `/api/settings/commission` endpoint
2. ✅ Made deposit routes respect commission settings
3. ✅ Added wallet maintenance mode
4. ✅ Added detailed console logging
5. ✅ Fixed TypeScript errors
6. ✅ Created database initialization script

## Current Database State

Based on the init script output:
- Commission: 2.00%
- Commission on Deposits: ✅ Enabled
- Commission on Transfers: ✅ Enabled
- INR Wallet: ❌ Disabled (Orange toggle = OFF)
- USD Wallet: ✅ Enabled
- USDT Wallet: ✅ Enabled

**Note:** If INR wallet shows as OFF/orange, that's the actual database state. You need to toggle it ON and save to enable it.

## Expected Behavior

1. **Change setting** → Click Save → See success alert
2. **Refresh page** → Settings load from database (may take 500ms)
3. **User deposits** → Uses current commission rate
4. **Disabled wallet** → Shows maintenance message

## Need Help?

Share these details:
1. Screenshot of browser console after clicking Save
2. Screenshot of browser console after page refresh
3. Output of `npm run db:init` command
4. Network tab screenshot of PATCH /api/admin/wallet request
