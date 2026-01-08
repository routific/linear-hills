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
import Image from "next/image";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="relative transition-all duration-300">
              <Image
                src="/logo.png"
                alt="Linear Hill Charts Logo"
                width={140}
                height={140}
                className="w-32 h-32 object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Title */}
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
              className="w-full shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
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
              className="text-primary hover:underline transition-colors"
            >
              View Linear Documentation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
