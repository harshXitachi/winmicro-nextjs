const fs = require('fs');
const path = require('path');

// List of API route files that use getCurrentUser
const apiRoutes = [
  'src/app/api/campaigns/[id]/members/route.ts',
  'src/app/api/campaigns/[id]/chat/route.ts',
  'src/app/api/campaigns/[id]/route.ts',
  'src/app/api/campaigns/[id]/check-membership/route.ts',
  'src/app/api/campaigns/[id]/submissions/route.ts',
  'src/app/api/campaigns/[id]/bonus-payment/route.ts',
  'src/app/api/campaigns/route.ts',
  'src/app/api/tasks/route.ts',
  'src/app/api/tasks/[id]/route.ts',
  'src/app/api/admin/wallet/withdraw-commission/route.ts',
  'src/app/api/admin/wallet/route.ts',
  'src/app/api/admin/transactions/route.ts',
  'src/app/api/admin/users/ban/route.ts',
  'src/app/api/admin/users/[userId]/reset-password/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/stats/route.ts',
  'src/app/api/admin/settings/route.ts',
  'src/app/api/wallet/deposit-inr/route.ts',
  'src/app/api/wallet/deposit-usd/route.ts',
  'src/app/api/wallet/withdraw-inr/route.ts',
  'src/app/api/wallet/transactions/route.ts',
  'src/app/api/profile/[userId]/route.ts',
];

const rootDir = path.join(__dirname, '..');

apiRoutes.forEach(filePath => {
  const fullPath = path.join(rootDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if already has dynamic export
  if (content.includes("export const dynamic = 'force-dynamic'")) {
    console.log(`Already patched: ${filePath}`);
    return;
  }
  
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('type ')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Insert after last import
    lines.splice(lastImportIndex + 1, 0, '', "export const dynamic = 'force-dynamic';");
    content = lines.join('\n');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Patched: ${filePath}`);
  } else {
    console.log(`Could not patch: ${filePath} (no imports found)`);
  }
});

console.log('Done!');
