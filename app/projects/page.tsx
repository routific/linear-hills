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
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Linear Hill Charts</h1>
            <p className="text-sm text-muted-foreground">
              Manage your project hill charts
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Change API Key
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Projects</h2>
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <CreateProjectDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No projects yet. Create your first hill chart project to get started.
            </p>
            <CreateProjectDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </CreateProjectDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
