/**
 * OAuth 2.0 utilities for Linear integration
 * Implements the OAuth flow as per Linear's documentation
 */

import crypto from 'crypto';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface OAuthState {
  state: string;
  codeVerifier?: string;
}

/**
 * Get OAuth configuration from environment variables
 */
export function getOAuthConfig(): OAuthConfig {
  const clientId = process.env.LINEAR_OAUTH_CLIENT_ID;
  const clientSecret = process.env.LINEAR_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.LINEAR_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing required OAuth environment variables. Please check LINEAR_OAUTH_CLIENT_ID, LINEAR_OAUTH_CLIENT_SECRET, and LINEAR_OAUTH_REDIRECT_URI.'
    );
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    authorizationUrl: 'https://linear.app/oauth/authorize',
    tokenUrl: 'https://api.linear.app/oauth/token',
    scopes: ['read'], // Request minimal required scopes
  };
}

/**
 * Generate a secure random state parameter for CSRF protection
 */
export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate PKCE code verifier and challenge
 * PKCE adds an extra layer of security for public clients
 */
export function generatePKCE(): {
  codeVerifier: string;
  codeChallenge: string;
} {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

/**
 * Build the authorization URL to redirect users to Linear
 */
export function buildAuthorizationUrl(
  config: OAuthConfig,
  state: string,
  pkce?: { codeChallenge: string }
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    actor: 'user', // Specify user-initiated OAuth
  });

  // Add PKCE parameters if provided
  if (pkce) {
    params.append('code_challenge', pkce.codeChallenge);
    params.append('code_challenge_method', 'S256');
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for access and refresh tokens
 */
export async function exchangeCodeForTokens(
  config: OAuthConfig,
  code: string,
  codeVerifier?: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  // Add PKCE code verifier if provided
  if (codeVerifier) {
    params.append('code_verifier', codeVerifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }

  return response.json();
}

/**
 * Refresh an expired access token using a refresh token
 */
export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh access token: ${error}`);
  }

  return response.json();
}

/**
 * Revoke an access or refresh token
 */
export async function revokeToken(
  accessToken: string,
  refreshToken?: string
): Promise<void> {
  const revokeUrl = 'https://api.linear.app/oauth/revoke';

  // Revoke access token
  await fetch(revokeUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // Revoke refresh token if provided
  if (refreshToken) {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
    });

    await fetch(revokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
  }
}

/**
 * Check if a token is expired or will expire soon
 */
export function isTokenExpired(
  expiresAt: number,
  bufferSeconds: number = 300
): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now >= expiresAt - bufferSeconds;
}
