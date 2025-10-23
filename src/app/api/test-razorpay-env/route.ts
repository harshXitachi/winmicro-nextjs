import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING',
      RAZORPAY_MODE: process.env.RAZORPAY_MODE || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      allRazorpayEnvVars: Object.keys(process.env).filter(key => key.includes('RAZORPAY')),
    };

    console.log('🔍 Environment Variables Test:', envCheck);

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      environment: envCheck,
    });
  } catch (error: any) {
    console.error('Environment check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check environment' },
      { status: 500 }
    );
  }
}
