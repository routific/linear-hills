"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { useAppStore } from "@/lib/store/appStore";
import { useWorkspaceData } from "@/lib/hooks/useWorkspaceData";
import { useLinearProjectStates } from "@/lib/hooks/useLinearProjectStates";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const router = useRouter();
  const storeProjects = useAppStore((state) => state.projects);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const logout = useAppStore((state) => state.logout);
  const [shippedExpanded, setShippedExpanded] = useState(false);

  // Use workspace data if authenticated, otherwise fall back to store
  const { data: workspaceData } = useWorkspaceData();
  const projects: Project[] = isAuthenticated && workspaceData
    ? workspaceData.projects
    : storeProjects;

  const teamIds = useMemo(
    () => projects.map((p) => p.linearTeamId).filter(Boolean) as string[],
    [projects]
  );
  const { stateByProjectId } = useLinearProjectStates(teamIds, isAuthenticated);

  const { activeProjects, shippedProjects } = useMemo(() => {
    const active: Project[] = [];
    const shipped: Project[] = [];
    for (const project of projects) {
      const state = project.linearProjectId
        ? stateByProjectId[project.linearProjectId]
        : undefined;
      if (state === "completed") {
        shipped.push(project);
      } else {
        active.push(project);
      }
    }
    return { activeProjects: active, shippedProjects: shipped };
  }, [projects, stateByProjectId]);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/setup");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Linear Hill Charts
          </h1>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-border/50">
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-muted-foreground">
            {projects.length} {projects.length === 1 ? "hillchart" : "hillcharts"}
          </p>
          <CreateProjectDialog>
            <Button className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              New Hillchart
            </Button>
          </CreateProjectDialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              No hillcharts yet. Create your first hillchart to get started.
            </p>
            <CreateProjectDialog>
              <Button className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Create Hillchart
              </Button>
            </CreateProjectDialog>
          </div>
        ) : (
          <div className="space-y-12">
            {activeProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {activeProjects.length === 0 && shippedProjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                No active hillcharts. All projects have shipped.
              </p>
            )}

            {shippedProjects.length > 0 && (
              <section>
                <button
                  type="button"
                  onClick={() => setShippedExpanded((v) => !v)}
                  className="flex items-center gap-2 mb-6 group"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform ${
                      shippedExpanded ? "" : "-rotate-90"
                    }`}
                  />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    Shipped
                  </h2>
                  <span className="text-xs text-muted-foreground/70">
                    {shippedProjects.length}
                  </span>
                </button>
                {shippedExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shippedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
