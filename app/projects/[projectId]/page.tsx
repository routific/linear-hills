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
  const apiKey = useAppStore((state) => state.apiKey);
  const projects = useAppStore((state) => state.projects);
  const lastSync = useAppStore((state) => state.lastSync);
  const setLastSync = useAppStore((state) => state.setLastSync);

  const project = projects.find((p) => p.id === resolvedParams.projectId);

  const { refetch, isFetching } = useLinearIssues({
    teamId: project?.linearTeamId || "",
    labelFilter: project?.labelFilter || "",
    enabled: !!project,
  });

  useEffect(() => {
    if (apiKey) {
      initializeLinearClient(apiKey);
    } else {
      router.push("/setup");
    }
  }, [apiKey, router]);

  if (!apiKey) {
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Project not found</p>
          <Button onClick={() => router.push("/projects")}>
            Back to Projects
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
              Back to Projects
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
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-muted/50 rounded-md">
                Team: {project.linearTeamId}
              </span>
              <span className="px-2 py-1 bg-muted/50 rounded-md font-mono">
                {project.labelFilter}
              </span>
              {lastSync && (
                <span>
                  Last synced {formatDistanceToNow(new Date(lastSync))} ago
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <HillChart
          projectId={project.id}
          teamId={project.linearTeamId}
          labelFilter={project.labelFilter}
        />

        <div className="mt-12 text-center text-sm text-muted-foreground space-y-2 max-w-2xl mx-auto">
          <p className="text-base">Drag issues horizontally to update their progress on the hill</p>
          <div className="flex items-center justify-center gap-8 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary/50" />
              <span>0-50%: Figuring things out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>50-100%: Making it happen</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
