/**
 * Authentication Middleware
 * Validates session and retrieves workspace context for API routes
 */

import { LinearClient } from '@linear/sdk';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import type { User, Workspace } from '@prisma/client';

export class AuthenticationError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export interface AuthContext {
  user: User;
  workspace: Workspace;
  linearClient: LinearClient;
}

/**
 * Authenticates the request and returns user and workspace context
 * Throws AuthenticationError if authentication fails
 */
export async function authenticateRequest(): Promise<AuthContext> {
  // Get session from encrypted cookie
  const session = await getSession();
  if (!session) {
    throw new AuthenticationError('No active session', 401);
  }

  // Create Linear client with access token
  const linearClient = new LinearClient({ accessToken: session.accessToken });

  try {
    // Fetch viewer and organization from Linear
    const viewer = await linearClient.viewer;
    const organization = await viewer.organization;

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { linearUserId: viewer.id },
      include: {
        workspaces: {
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      throw new AuthenticationError('User not found in database', 404);
    }

    // Find workspace for the current organization
    const workspaceUser = user.workspaces.find(
      (wu) => wu.workspace.linearOrganizationId === organization.id
    );

    if (!workspaceUser) {
      throw new AuthenticationError('Not a member of this workspace', 403);
    }

    // Update last seen timestamp (throttled to once every 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!user.lastSeenAt || user.lastSeenAt < fiveMinutesAgo) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      });
    }

    return {
      user,
      workspace: workspaceUser.workspace,
      linearClient,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    console.error('Authentication error:', error);
    throw new AuthenticationError(
      'Failed to authenticate request',
      500
    );
  }
}
