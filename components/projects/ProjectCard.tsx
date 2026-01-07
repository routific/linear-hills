"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pencil, Folder, Tag, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditProjectDialog } from "./EditProjectDialog";
import { useLinearTeams } from "@/lib/hooks/useLinearTeams";
import { useLinearProjects } from "@/lib/hooks/useLinearProjects";
import { useAppStore } from "@/lib/store/appStore";
import type { Project } from "@/types";
import { useState } from "react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const deleteProject = useAppStore((state) => state.deleteProject);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch team and project names
  const { data: teams } = useLinearTeams(true);
  const { data: projects } = useLinearProjects(project.linearTeamId, true);

  const teamName = teams?.find((t) => t.id === project.linearTeamId)?.name || project.linearTeamId;
  const projectName = projects?.find((p) => p.id === project.linearProjectId)?.name || project.linearProjectId;

  const handleClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showConfirm) {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    } else {
      deleteProject(project.id);
      setShowConfirm(false);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-xl hover:shadow-primary/10 transition-all relative group border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/50 overflow-hidden"
      onClick={handleClick}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="relative space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="group-hover:text-primary transition-colors mb-1">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2 text-xs">
                {project.description}
              </CardDescription>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <EditProjectDialog project={project}>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </EditProjectDialog>
            <Button
              variant={showConfirm ? "destructive" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Project and Filter Info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground min-w-[3rem]">Team:</span>
            <span className="px-2 py-1 bg-muted/50 rounded-md font-medium text-foreground">
              {teamName}
            </span>
          </div>

          {project.linearProjectId && (
            <div className="flex items-center gap-2 text-xs">
              <Folder className="w-3.5 h-3.5 text-primary/70 flex-shrink-0" />
              <span className="text-muted-foreground min-w-[3rem]">Project:</span>
              <span className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-md font-medium text-primary">
                {projectName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs">
            <Tag className="w-3.5 h-3.5 text-accent/70 flex-shrink-0" />
            <span className="text-muted-foreground min-w-[3rem]">Label:</span>
            <span className="px-2 py-1 bg-accent/10 border border-accent/20 rounded-md font-mono text-accent">
              {project.labelFilter}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(project.updatedAt))} ago
          </span>
        </div>

        {showConfirm && (
          <div className="pt-2">
            <p className="text-xs text-destructive font-semibold">
              Click again to confirm deletion
            </p>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
