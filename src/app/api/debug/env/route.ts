import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/debug/env - Debug environment variables (remove in production)
export async function GET(request: NextRequest) {
  try {
    // Only allow in development or with special debug key
    const debugKey = request.nextUrl.searchParams.get('key');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment && debugKey !== 'debug123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const envCheck = {
      // PayPal Configuration
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID ? '[SET]' : '[MISSING]',
        secret: process.env.PAYPAL_SECRET ? '[SET]' : '[MISSING]',
        mode: process.env.PAYPAL_MODE || 'not set',
        apiBase: process.env.PAYPAL_API_BASE || 'not set',
      },
      
      // App Configuration
      app: {
        url: process.env.NEXT_PUBLIC_APP_URL || '[MISSING]',
        name: process.env.APP_NAME || 'not set',
        nodeEnv: process.env.NODE_ENV,
      },
      
      // Firebase Configuration (if using Firebase auth)
      firebase: {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ? '[SET]' : '[MISSING]',
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? '[SET]' : '[MISSING]',
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY ? '[SET]' : '[MISSING]',
      },
      
      // Database Configuration
      database: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '[SET]' : '[MISSING]',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]',
      },
      
      // System Info
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      }
    };

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Environment variables check completed'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to check environment variables'
    }, { status: 500 });
  }
}
