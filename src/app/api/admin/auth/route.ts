import { NextRequest, NextResponse } from 'next/server';

// Admin credentials - in production, these should come from a secure database
// Using environment variables is recommended for production
const ADMIN_CREDENTIALS = [
  {
    id: '1',
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin1', // Change in production!
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin with matching credentials
    const admin = ADMIN_CREDENTIALS.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        admin_id: admin.id,
        email: admin.email,
        message: 'Admin login successful',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
