import { NextRequest, NextResponse } from 'next/server';
import { db, admin_settings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await db.select().from(admin_settings);
    
    // Convert array to object
    const settingsObj: any = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    return NextResponse.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update each setting
    for (const [key, value] of Object.entries(body)) {
      await db
        .update(admin_settings)
        .set({ value: String(value), updated_at: new Date() })
        .where(eq(admin_settings.key, key));
    }

    return NextResponse.json({ settings: body });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
