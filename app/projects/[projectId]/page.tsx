"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { HillChart } from "@/components/hill-chart/HillChart";
import { useAppStore } from "@/lib/store/appStore";
import { initializeLinearClient } from "@/lib/linear/client";
import { useLinearIssues } from "@/lib/hooks/useLinearIssues";
import { use } from "react";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const projects = useAppStore((state) => state.projects);
  const lastSync = useAppStore((state) => state.lastSync);
  const setLastSync = useAppStore((state) => state.setLastSync);

  const project = projects.find((p) => p.id === resolvedParams.projectId);

  const { refetch, isFetching } = useLinearIssues({
    teamId: project?.linearTeamId || "",
    projectId: project?.linearProjectId,
    labelFilter: project?.labelFilter || "",
    enabled: !!project,
  });

  useEffect(() => {
    if (isAuthenticated) {
      initializeLinearClient().catch((error) => {
        console.error('Failed to initialize Linear client:', error);
        router.push('/setup');
      });
    } else {
      router.push("/setup");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Hillchart not found</p>
          <Button onClick={() => router.push("/projects")}>
            Back to Hillcharts
          </Button>
        </div>
      </div>
    );
  }

  const handleSync = async () => {
    await refetch();
    setLastSync(new Date().toISOString());
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/projects")}
              className="hover:bg-muted/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hillcharts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isFetching}
              className="border-border/50 shadow-sm"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              {isFetching ? "Syncing..." : "Sync"}
            </Button>
          </div>

          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {project.description}
              </p>
            )}
            {lastSync && (
              <p className="text-xs text-muted-foreground mt-2">
                Last synced {formatDistanceToNow(new Date(lastSync))} ago
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <HillChart
          projectId={project.id}
          teamId={project.linearTeamId}
          linearProjectId={project.linearProjectId}
          labelFilter={project.labelFilter}
        />
      </main>
    </div>
  );
}
