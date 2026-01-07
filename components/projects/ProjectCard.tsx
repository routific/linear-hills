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
      className="cursor-pointer hover:shadow-lg transition-shadow relative"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle>{project.name}</CardTitle>
          <Button
            variant={showConfirm ? "destructive" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0 -mt-1 -mr-1"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {project.description || `Filter: ${project.labelFilter}`}
        </CardDescription>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Label: {project.labelFilter}</span>
          <span>
            Updated {formatDistanceToNow(new Date(project.updatedAt))} ago
          </span>
        </div>
        {showConfirm && (
          <p className="text-xs text-destructive mt-2">
            Click again to confirm deletion
          </p>
        )}
      </CardHeader>
    </Card>
  );
}
