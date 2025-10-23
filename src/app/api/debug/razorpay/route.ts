import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/debug/razorpay - Debug Razorpay environment variables
export async function GET(request: NextRequest) {
  try {
    const debugKey = request.nextUrl.searchParams.get('key');
    
    if (debugKey !== 'debug123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const razorpayCheck = {
      // Environment Variables
      keyId: process.env.RAZORPAY_KEY_ID ? '[SET]' : '[MISSING]',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? '[SET]' : '[MISSING]',
      mode: process.env.RAZORPAY_MODE || 'not set',
      
      // Values (first 10 chars for security)
      keyIdValue: process.env.RAZORPAY_KEY_ID ? 
        process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET',
      keySecretValue: process.env.RAZORPAY_KEY_SECRET ? 
        process.env.RAZORPAY_KEY_SECRET.substring(0, 10) + '...' : 'NOT SET',
      
      // System Info
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      razorpay: razorpayCheck,
      message: 'Razorpay environment variables check'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to check Razorpay environment variables'
    }, { status: 500 });
  }
}
