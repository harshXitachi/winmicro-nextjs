import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Admin credentials stored in environment or config file
const getAdminCredentials = () => {
  return {
    email: process.env.ADMIN_EMAIL || 'admin@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'admin1',
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { new_password, confirm_password } = body;

    // Validate input
    if (!new_password || !confirm_password) {
      return NextResponse.json(
        { error: 'New password and confirmation are required' },
        { status: 400 }
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Update admin password in environment variable
    // In production, you'd want to update this in a database
    process.env.ADMIN_PASSWORD = new_password;

    return NextResponse.json(
      {
        success: true,
        message: 'Admin password updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Admin password update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
