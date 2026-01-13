"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLinearTeams } from "@/lib/hooks/useLinearTeams";
import { useLinearProjects } from "@/lib/hooks/useLinearProjects";
import { useLinearLabels } from "@/lib/hooks/useLinearLabels";
import { useAppStore } from "@/lib/store/appStore";
import { useCreateProject } from "@/lib/hooks/mutations/useProjectMutations";
import type { Project } from "@/types";

interface CreateProjectDialogProps {
  children: React.ReactNode;
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [labelFilter, setLabelFilter] = useState("");

  const { data: teams, isLoading: isLoadingTeams } = useLinearTeams(open);
  const { data: projects, isLoading: isLoadingProjects } = useLinearProjects(
    selectedTeamId,
    open && !!selectedTeamId
  );
  const { data: labels, isLoading: isLoadingLabels } = useLinearLabels(
    selectedTeamId,
    open && !!selectedTeamId
  );

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const addProjectStore = useAppStore((state) => state.addProject);
  const createProjectMutation = useCreateProject();

  const handleCreate = () => {
    if (!name.trim() || !selectedTeamId || !selectedProjectId || !labelFilter.trim()) {
      return;
    }

    const team = teams?.find((t) => t.id === selectedTeamId);
    const linearProject = projects?.find((p) => p.id === selectedProjectId);
    const label = labels?.find((l) => l.name === labelFilter);

    const project: Project = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim() || undefined,
      linearTeamId: selectedTeamId,
      linearTeamName: team?.name,
      linearProjectId: selectedProjectId,
      linearProjectName: linearProject?.name,
      labelFilter: label?.name || labelFilter.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use mutation for authenticated users, store for unauthenticated
    if (isAuthenticated) {
      createProjectMutation.mutate(project);
    } else {
      addProjectStore(project);
    }

    setName("");
    setDescription("");
    setSelectedTeamId("");
    setSelectedProjectId("");
    setLabelFilter("");
    setOpen(false);
  };

  const isValid = name.trim() && selectedTeamId && selectedProjectId && labelFilter.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Hillchart</DialogTitle>
          <DialogDescription>
            Create a new hillchart for Linear issues with a specific label
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Hillchart Name</Label>
            <Input
              id="name"
              placeholder="Q1 2024 Features"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Track progress of Q1 features"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="team">Linear Team</Label>
            <Select
              value={selectedTeamId}
              onValueChange={(value) => {
                setSelectedTeamId(value);
                setSelectedProjectId(""); // Reset project when team changes
                setLabelFilter(""); // Reset label when team changes
              }}
            >
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTeams && (
                  <SelectItem value="loading" disabled>
                    Loading teams...
                  </SelectItem>
                )}
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} ({team.key})
                  </SelectItem>
                ))}
                {!isLoadingTeams && teams?.length === 0 && (
                  <SelectItem value="none" disabled>
                    No teams found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="project">Linear Project</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={!selectedTeamId}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProjects && (
                  <SelectItem value="loading" disabled>
                    Loading projects...
                  </SelectItem>
                )}
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
                {!isLoadingProjects && projects?.length === 0 && selectedTeamId && (
                  <SelectItem value="none" disabled>
                    No projects found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the Linear project to filter issues from
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="label">Label Filter</Label>
            <Select
              value={labelFilter}
              onValueChange={setLabelFilter}
              disabled={!selectedTeamId}
            >
              <SelectTrigger id="label">
                <SelectValue placeholder="Select a label" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingLabels && (
                  <SelectItem value="loading" disabled>
                    Loading labels...
                  </SelectItem>
                )}
                {labels?.map((label) => (
                  <SelectItem key={label.id} value={label.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </div>
                  </SelectItem>
                ))}
                {!isLoadingLabels && labels?.length === 0 && selectedTeamId && (
                  <SelectItem value="none" disabled>
                    No labels found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Only issues with this label will appear on the hill chart
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleCreate} disabled={!isValid}>
            Create Hillchart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
