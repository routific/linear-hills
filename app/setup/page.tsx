"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/lib/store/appStore";
import { initializeLinearClient } from "@/lib/linear/client";
import { useLinearTeams } from "@/lib/hooks/useLinearTeams";

export default function SetupPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const setGlobalApiKey = useAppStore((state) => state.setApiKey);

  const {
    data: teams,
    isLoading: isLoadingTeams,
    refetch: testConnection,
  } = useLinearTeams(false);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setConnectionError("Please enter an API key");
      return;
    }

    setIsTestingConnection(true);
    setConnectionError(null);
    setConnectionSuccess(false);

    try {
      initializeLinearClient(apiKey.trim());

      const result = await testConnection();

      if (result.data && result.data.length > 0) {
        setConnectionSuccess(true);
        setConnectionError(null);
      } else {
        setConnectionError("No teams found. Please check your API key.");
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionError(
        error instanceof Error
          ? error.message
          : "Failed to connect to Linear. Please check your API key."
      );
      setConnectionSuccess(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleContinue = () => {
    if (connectionSuccess && apiKey.trim()) {
      setGlobalApiKey(apiKey.trim());
      router.push("/projects");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Linear Hill Charts</CardTitle>
          <CardDescription>
            Enter your Linear API key to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              Linear API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              placeholder="lin_api_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleTestConnection();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{" "}
              <a
                href="https://linear.app/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                Linear Settings
              </a>
            </p>
          </div>

          {connectionError && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {connectionError}
            </div>
          )}

          {connectionSuccess && teams && (
            <div className="p-3 rounded-md bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
              Connected successfully! Found {teams.length} team
              {teams.length !== 1 ? "s" : ""}:{" "}
              {teams.map((t) => t.name).join(", ")}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={isTestingConnection || !apiKey.trim()}
              variant="outline"
              className="flex-1"
            >
              {isTestingConnection ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!connectionSuccess}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
