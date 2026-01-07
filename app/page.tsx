"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/appStore";
import { initializeLinearClient } from "@/lib/linear/client";

export default function Home() {
  const router = useRouter();
  const apiKey = useAppStore((state) => state.apiKey);

  useEffect(() => {
    if (apiKey) {
      initializeLinearClient(apiKey);
      router.push("/projects");
    } else {
      router.push("/setup");
    }
  }, [apiKey, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Linear Hill Charts</h1>
        <p className="text-muted-foreground mb-8">
          Visualize your Linear issues as interactive hill charts
        </p>
        <p className="text-sm text-muted-foreground">
          Loading...
        </p>
      </div>
    </div>
  );
}
