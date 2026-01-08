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
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
    </div>
  );
}
