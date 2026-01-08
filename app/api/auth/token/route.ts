/**
 * Token Endpoint
 * Returns the current access token, refreshing if necessary
 */

import { NextResponse } from 'next/server';
import { getSession, updateSession } from '@/lib/auth/session';
import { getOAuthConfig, refreshAccessToken, isTokenExpired } from '@/lib/auth/oauth';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Check if token needs refresh (5 minute buffer)
    if (isTokenExpired(session.expiresAt, 300)) {
      if (!session.refreshToken) {
        return NextResponse.json(
          { error: 'Token expired and no refresh token available' },
          { status: 401 }
        );
      }

      try {
        // Refresh the token
        const config = getOAuthConfig();
        const newTokens = await refreshAccessToken(config, session.refreshToken);

        // Update session with new tokens
        const newExpiresAt = Math.floor(Date.now() / 1000) + newTokens.expires_in;
        await updateSession({
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token || session.refreshToken,
          expiresAt: newExpiresAt,
        });

        return NextResponse.json({
          accessToken: newTokens.access_token,
          expiresAt: newExpiresAt,
        });
      } catch (error) {
        console.error('Token refresh failed:', error);
        return NextResponse.json(
          { error: 'Failed to refresh token' },
          { status: 401 }
        );
      }
    }

    // Token is still valid
    return NextResponse.json({
      accessToken: session.accessToken,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Token endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
