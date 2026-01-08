/**
 * OAuth Login Endpoint
 * Initiates the OAuth flow by redirecting to Linear's authorization page
 */

import { NextResponse } from 'next/server';
import {
  getOAuthConfig,
  generateState,
  generatePKCE,
  buildAuthorizationUrl,
} from '@/lib/auth/oauth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const config = getOAuthConfig();

    // Generate state for CSRF protection
    const state = generateState();

    // Generate PKCE parameters for extra security
    const { codeVerifier, codeChallenge } = generatePKCE();

    // Store state and code verifier in secure cookies for verification in callback
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    cookieStore.set('oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    // Build authorization URL and redirect
    const authUrl = buildAuthorizationUrl(config, state, { codeChallenge });

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth login error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate OAuth flow',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
