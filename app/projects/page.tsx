"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { useAppStore } from "@/lib/store/appStore";

export default function ProjectsPage() {
  const router = useRouter();
  const projects = useAppStore((state) => state.projects);
  const apiKey = useAppStore((state) => state.apiKey);
  const clearApiKey = useAppStore((state) => state.clearApiKey);

  const handleLogout = () => {
    clearApiKey();
    router.push("/setup");
  };

  if (!apiKey) {
    router.push("/setup");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/95 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Linear Hill Charts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your project hill charts
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-border/50">
            Change API Key
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateProjectDialog>
            <Button className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              No projects yet. Create your first hill chart project to get started.
            </p>
            <CreateProjectDialog>
              <Button className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CreateProjectDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
