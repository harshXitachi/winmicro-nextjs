import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export const GET = auth0.handleAuth();
export const POST = auth0.handleAuth();
