"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/appStore";
import { initializeLinearClient } from "@/lib/linear/client";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize Linear client when authenticated
      initializeLinearClient().catch((error) => {
        console.error('Failed to initialize Linear client:', error);
        router.push('/setup');
      });
      router.push("/projects");
    } else {
      router.push("/setup");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Linear Hill Charts
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          Visualize your Linear issues as interactive hill charts
        </p>
        <div className="relative inline-block">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 mx-auto"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-8 w-8 border-t-2 border-primary" style={{ animationDuration: '0.8s' }}></div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Loading...
        </p>
      </div>
    </div>
  );
}
