/**
 * Session Status Endpoint
 * Check if user has a valid OAuth session
 */

import { NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const isValid = await hasValidSession();

    return NextResponse.json({ authenticated: isValid });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
