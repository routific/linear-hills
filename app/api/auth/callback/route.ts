/**
 * OAuth Callback Endpoint
 * Handles the OAuth redirect from Linear, exchanges code for tokens
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { LinearClient } from '@linear/sdk';
import { getOAuthConfig, exchangeCodeForTokens } from '@/lib/auth/oauth';
import { setSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/setup?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || '')}`,
          request.url
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          '/setup?error=invalid_request&error_description=Missing code or state parameter',
          request.url
        )
      );
    }

    // Verify state to prevent CSRF attacks
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL(
          '/setup?error=invalid_state&error_description=State parameter mismatch',
          request.url
        )
      );
    }

    // Get code verifier for PKCE
    const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;

    // Exchange authorization code for tokens
    const config = getOAuthConfig();
    const tokens = await exchangeCodeForTokens(config, code, codeVerifier);

    // Calculate token expiration time
    const expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

    // Store tokens in encrypted session
    await setSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scope: tokens.scope,
    });

    // Fetch Linear user and organization data
    const client = new LinearClient({ accessToken: tokens.access_token });
    const viewer = await client.viewer;
    const organization = await viewer.organization;

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { linearUserId: viewer.id },
      create: {
        linearUserId: viewer.id,
        linearUserName: viewer.name,
        linearUserEmail: viewer.email,
        avatarUrl: viewer.avatarUrl,
      },
      update: {
        linearUserName: viewer.name,
        linearUserEmail: viewer.email,
        avatarUrl: viewer.avatarUrl,
        lastSeenAt: new Date(),
      },
    });

    // Create or update workspace (organization) in database
    const workspace = await prisma.workspace.upsert({
      where: { linearOrganizationId: organization.id },
      create: {
        linearOrganizationId: organization.id,
        linearOrganizationName: organization.name,
      },
      update: {
        linearOrganizationName: organization.name,
      },
    });

    // Link user to workspace
    await prisma.workspaceUser.upsert({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspace.id,
        },
      },
      create: {
        userId: user.id,
        workspaceId: workspace.id,
      },
      update: {},
    });

    // Clear OAuth state cookies
    cookieStore.delete('oauth_state');
    cookieStore.delete('oauth_code_verifier');

    // Redirect to projects page
    return NextResponse.redirect(new URL('/projects', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/setup?error=callback_failed&error_description=${encodeURIComponent(
          error instanceof Error ? error.message : 'Failed to complete OAuth flow'
        )}`,
        request.url
      )
    );
  }
}
