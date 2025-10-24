import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Comprehensive PhonePe environment variable check
    const envCheck = {
      // Primary PhonePe variables
      PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID ? 'SET' : 'MISSING',
      PHONEPE_SECRET_KEY: process.env.PHONEPE_SECRET_KEY ? 'SET' : 'MISSING',
      PHONEPE_KEY_INDEX: process.env.PHONEPE_KEY_INDEX || 'NOT SET',
      PHONEPE_BASE_URL: process.env.PHONEPE_BASE_URL || 'NOT SET',
      
      // Alternative variable names
      PHONEPE_MERCHANTID: process.env.PHONEPE_MERCHANTID ? 'SET' : 'MISSING',
      PHONEPE_SECRET: process.env.PHONEPE_SECRET ? 'SET' : 'MISSING',
      
      // Environment info
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      
      // All PhonePe-related environment variables
      allPhonePeEnvVars: Object.keys(process.env).filter(key => key.includes('PHONEPE')),
      
      // Key previews (first 10 characters for security)
      merchantIdPreview: process.env.PHONEPE_MERCHANT_ID ? process.env.PHONEPE_MERCHANT_ID.substring(0, 10) + '...' : 'NOT SET',
      secretKeyPreview: process.env.PHONEPE_SECRET_KEY ? process.env.PHONEPE_SECRET_KEY.substring(0, 10) + '...' : 'NOT SET',
      
      // Configuration status
      isConfigured: !!(process.env.PHONEPE_MERCHANT_ID && process.env.PHONEPE_SECRET_KEY),
      hasMerchantId: !!process.env.PHONEPE_MERCHANT_ID,
      hasSecretKey: !!process.env.PHONEPE_SECRET_KEY,
      hasBaseUrl: !!process.env.PHONEPE_BASE_URL,
    };

    console.log('🔍 Comprehensive PhonePe Environment Check:', envCheck);

    // Test PhonePe configuration
    const testPhonePeConfig = async () => {
      try {
        const { createPhonePePayment, createPhonePePaymentMock } = await import('@/lib/payments/phonepe');
        // This will trigger the validation in the phonepe.ts file
        return { status: 'Configuration loaded successfully' };
      } catch (error: any) {
        return { 
          status: 'Configuration failed', 
          error: error.message,
          details: 'This indicates the PhonePe configuration is not properly set up'
        };
      }
    };

    const configTest = await testPhonePeConfig();

    // Determine if using mock or live implementation
    const useMock = process.env.NODE_ENV === 'development' || !process.env.PHONEPE_MERCHANT_ID;

    return NextResponse.json({
      success: true,
      message: 'Comprehensive PhonePe environment variables check',
      environment: envCheck,
      configurationTest: configTest,
      implementation: {
        usingMock: useMock,
        reason: useMock ? 'Development mode or missing credentials' : 'Live PhonePe integration',
        recommendation: useMock 
          ? 'Add PhonePe credentials to use live integration'
          : 'PhonePe credentials are configured for live integration'
      },
      recommendations: {
        ifMissing: !envCheck.isConfigured ? [
          '1. Go to AWS Amplify Console > Your App > Environment Variables',
          '2. Add PHONEPE_MERCHANT_ID with your PhonePe Merchant ID',
          '3. Add PHONEPE_SECRET_KEY with your PhonePe Secret Key',
          '4. Add PHONEPE_KEY_INDEX as "1" (usually)',
          '5. Add PHONEPE_BASE_URL for sandbox or production',
          '6. Save and redeploy your application'
        ] : ['✅ PhonePe credentials are properly configured'],
        troubleshooting: [
          'If variables are set but still not working:',
          '- Check for typos in variable names',
          '- Ensure no extra spaces in values',
          '- Redeploy after adding variables',
          '- Check AWS Amplify build logs for errors',
          '- Verify PhonePe dashboard credentials are correct'
        ],
        phonePeSetup: [
          'To get PhonePe credentials:',
          '1. Visit https://business.phonepe.com/',
          '2. Sign up as a merchant',
          '3. Complete KYC process',
          '4. Get credentials from dashboard',
          '5. Use sandbox for testing, production for live'
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
