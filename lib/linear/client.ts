import { LinearClient } from "@linear/sdk";

let linearClient: LinearClient | null = null;
let currentToken: string | null = null;

/**
 * Fetch the current access token from the server
 * This will automatically refresh the token if it's expired
 */
async function getAccessToken(): Promise<string> {
  const response = await fetch('/api/auth/token', {
    credentials: 'include', // Include cookies for session
  });

  if (!response.ok) {
    throw new Error('Failed to get access token. Please log in again.');
  }

  const data = await response.json();
  return data.accessToken;
}

/**
 * Initialize Linear client with OAuth token
 * This will fetch the token from the server and create a new client
 */
export async function initializeLinearClient(): Promise<LinearClient> {
  const accessToken = await getAccessToken();
  currentToken = accessToken;
  linearClient = new LinearClient({ accessToken });
  return linearClient;
}

/**
 * Get the Linear client, refreshing the token if necessary
 * This ensures we always have a valid client with a fresh token
 */
export async function getLinearClient(): Promise<LinearClient> {
  // If client doesn't exist or token might be stale, reinitialize
  if (!linearClient) {
    return await initializeLinearClient();
  }

  // Try to refresh token in case it's expired
  try {
    const newToken = await getAccessToken();
    if (newToken !== currentToken) {
      // Token was refreshed, update client
      currentToken = newToken;
      linearClient = new LinearClient({ accessToken: newToken });
    }
  } catch (error) {
    // If token fetch fails, clear client and throw
    clearLinearClient();
    throw error;
  }

  return linearClient;
}

/**
 * Clear the Linear client (used during logout)
 */
export function clearLinearClient(): void {
  linearClient = null;
  currentToken = null;
}

/**
 * Check if Linear client is initialized
 */
export function isLinearClientInitialized(): boolean {
  return linearClient !== null;
}
