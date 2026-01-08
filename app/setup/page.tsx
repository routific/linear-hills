"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for OAuth errors from callback
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        access_denied: 'You denied access to your Linear account',
        invalid_request: 'Invalid OAuth request',
        invalid_state: 'Invalid security token. Please try again',
        callback_failed: 'Failed to complete authentication',
      };

      setError(
        errorDescription ||
        errorMessages[errorParam] ||
        'Authentication failed. Please try again'
      );
    }
  }, [searchParams]);

  const handleLogin = () => {
    setIsLoading(true);
    setError(null);
    // Redirect to OAuth login endpoint
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Linear Hill Charts
          </h1>
          <p className="text-muted-foreground">
            Visualize your Linear issues as interactive hill charts
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Connect your Linear account to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This app uses OAuth 2.0 to securely access your Linear account.
                You&apos;ll be redirected to Linear to authorize access.
              </p>

              <div className="p-3 rounded-lg bg-primary/5 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Permissions requested:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Read access to your teams, projects, and issues</span>
                  </li>
                </ul>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full shadow-lg shadow-primary/20"
            >
              {isLoading ? 'Connecting...' : 'Connect with Linear'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By connecting, you agree to authorize this app to access your Linear data
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a
              href="https://linear.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View Linear Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
