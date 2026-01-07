"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <CardTitle className="group-hover:text-primary transition-colors">{project.name}</CardTitle>
          <Button
            variant={showConfirm ? "destructive" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="line-clamp-2">
          {project.description || `Filter: ${project.labelFilter}`}
        </CardDescription>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-muted/50 rounded-md font-mono">
            {project.labelFilter}
          </span>
          <span>
            {formatDistanceToNow(new Date(project.updatedAt))} ago
          </span>
        </div>
        {showConfirm && (
          <p className="text-xs text-destructive mt-2 font-semibold">
            Click again to confirm deletion
          </p>
        )}
      </CardHeader>
    </Card>
  );
}
