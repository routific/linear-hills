/**
 * Logout Endpoint
 * Revokes OAuth tokens and clears session
 */

import { NextResponse } from 'next/server';
import { getSession, clearSession } from '@/lib/auth/session';
import { revokeToken } from '@/lib/auth/oauth';

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      // Revoke tokens at Linear
      try {
        await revokeToken(session.accessToken, session.refreshToken);
      } catch (error) {
        // Log but don't fail - still clear local session
        console.error('Failed to revoke tokens:', error);
      }
    }

    // Clear session cookie
    await clearSession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear session even if there was an error
    await clearSession();
    return NextResponse.json(
      { error: 'Logout completed with errors' },
      { status: 500 }
    );
  }
}
