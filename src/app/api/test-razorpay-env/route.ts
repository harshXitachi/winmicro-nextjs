import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Comprehensive environment variable check
    const envCheck = {
      // Primary Razorpay variables
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING',
      RAZORPAY_MODE: process.env.RAZORPAY_MODE || 'NOT SET',
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET ? 'SET' : 'MISSING',
      
      // Alternative variable names
      RAZORPAY_KEYID: process.env.RAZORPAY_KEYID ? 'SET' : 'MISSING',
      RAZORPAY_KEYSECRET: process.env.RAZORPAY_KEYSECRET ? 'SET' : 'MISSING',
      
      // Next.js public variables
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'SET' : 'MISSING',
      NEXT_PUBLIC_RAZORPAY_KEY_SECRET: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING',
      
      // Environment info
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      
      // All Razorpay-related environment variables
      allRazorpayEnvVars: Object.keys(process.env).filter(key => key.includes('RAZORPAY')),
      
      // Key previews (first 10 characters for security)
      keyIdPreview: process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET',
      keySecretPreview: process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.substring(0, 10) + '...' : 'NOT SET',
      
      // Configuration status
      isConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
    };

    console.log('🔍 Comprehensive Razorpay Environment Check:', envCheck);

    // Test Razorpay configuration
    const testRazorpayConfig = async () => {
      try {
        const { createRazorpayOrder } = await import('@/lib/payments/razorpay');
        // This will trigger the validation in the razorpay.ts file
        return { status: 'Configuration loaded successfully' };
      } catch (error: any) {
        return { 
          status: 'Configuration failed', 
          error: error.message,
          details: 'This indicates the Razorpay configuration is not properly set up'
        };
      }
    };

    const configTest = await testRazorpayConfig();

    return NextResponse.json({
      success: true,
      message: 'Comprehensive Razorpay environment variables check',
      environment: envCheck,
      configurationTest: configTest,
      recommendations: {
        ifMissing: !envCheck.isConfigured ? [
          '1. Go to AWS Amplify Console > Your App > Environment Variables',
          '2. Add RAZORPAY_KEY_ID with your Razorpay Key ID',
          '3. Add RAZORPAY_KEY_SECRET with your Razorpay Key Secret',
          '4. Add RAZORPAY_MODE as "live" or "test"',
          '5. Save and redeploy your application'
        ] : ['✅ Razorpay credentials are properly configured'],
        troubleshooting: [
          'If variables are set but still not working:',
          '- Check for typos in variable names',
          '- Ensure no extra spaces in values',
          '- Redeploy after adding variables',
          '- Check AWS Amplify build logs for errors'
        ]
      }
    });
  } catch (error: any) {
    console.error('Environment check error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to check environment',
        success: false,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          timestamp: new Date().toISOString(),
          error: error.message
        }
      },
      { status: 500 }
    );
  }
}
