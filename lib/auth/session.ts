/**
 * Session management for OAuth tokens
 * Uses encrypted cookies to store session data securely
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'linear_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp
  scope: string;
}

/**
 * Get session secret from environment
 */
function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Encrypt session data
 */
function encrypt(data: SessionData): string {
  const secret = getSessionSecret();
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secret, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt session data
 */
function decrypt(encryptedData: string): SessionData {
  const secret = getSessionSecret();
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(secret, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

/**
 * Set session data in an encrypted cookie
 */
export async function setSession(data: SessionData): Promise<void> {
  const encrypted = encrypt(data);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Get session data from encrypted cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const encryptedSession = cookieStore.get(SESSION_COOKIE_NAME);

  if (!encryptedSession?.value) {
    return null;
  }

  try {
    return decrypt(encryptedSession.value);
  } catch (error) {
    // Invalid or corrupted session data
    console.error('Failed to decrypt session:', error);
    await clearSession();
    return null;
  }
}

/**
 * Update session data (partial update)
 */
export async function updateSession(
  updates: Partial<SessionData>
): Promise<void> {
  const currentSession = await getSession();
  if (!currentSession) {
    throw new Error('No active session to update');
  }

  await setSession({
    ...currentSession,
    ...updates,
  });
}

/**
 * Clear session data
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Check if session exists and is valid
 */
export async function hasValidSession(): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    return false;
  }

  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  return now < session.expiresAt;
}
