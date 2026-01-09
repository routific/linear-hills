"use client";

import { useState, useEffect } from "react";
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
import { useAppStore } from "@/lib/store/appStore";
import type { Project } from "@/types";

interface EditProjectDialogProps {
  project: Project;
  children: React.ReactNode;
}

export function EditProjectDialog({ project, children }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [selectedTeamId, setSelectedTeamId] = useState(project.linearTeamId);
  const [selectedProjectId, setSelectedProjectId] = useState(project.linearProjectId || "");
  const [labelFilter, setLabelFilter] = useState(project.labelFilter);

  const { data: teams, isLoading: isLoadingTeams } = useLinearTeams(open);
  const { data: projects, isLoading: isLoadingProjects } = useLinearProjects(
    selectedTeamId,
    open && !!selectedTeamId
  );
  const updateProject = useAppStore((state) => state.updateProject);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(project.name);
      setDescription(project.description || "");
      setSelectedTeamId(project.linearTeamId);
      setSelectedProjectId(project.linearProjectId || "");
      setLabelFilter(project.labelFilter);
    }
  }, [open, project]);

  const handleSave = () => {
    if (!name.trim() || !selectedTeamId || !selectedProjectId || !labelFilter.trim()) {
      return;
    }

    const team = teams?.find((t) => t.id === selectedTeamId);
    const linearProject = projects?.find((p) => p.id === selectedProjectId);

    updateProject(project.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      linearTeamId: selectedTeamId,
      linearTeamName: team?.name,
      linearProjectId: selectedProjectId,
      linearProjectName: linearProject?.name,
      labelFilter: labelFilter.trim(),
      updatedAt: new Date().toISOString(),
    });

    setOpen(false);
  };

  const isValid = name.trim() && selectedTeamId && selectedProjectId && labelFilter.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Hillchart</DialogTitle>
          <DialogDescription>
            Update your hillchart settings
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Hillchart Name</Label>
            <Input
              id="edit-name"
              placeholder="Q1 2024 Features"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Input
              id="edit-description"
              placeholder="Track progress of Q1 features"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-team">Linear Team</Label>
            <Select
              value={selectedTeamId}
              onValueChange={(value) => {
                setSelectedTeamId(value);
                setSelectedProjectId(""); // Reset project when team changes
              }}
            >
              <SelectTrigger id="edit-team">
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
            <Label htmlFor="edit-project">Linear Project</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={!selectedTeamId}
            >
              <SelectTrigger id="edit-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProjects && (
                  <SelectItem value="loading" disabled>
                    Loading projects...
                  </SelectItem>
                )}
                {projects?.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id}>
                    {proj.name}
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
            <Label htmlFor="edit-label">Label Filter</Label>
            <Input
              id="edit-label"
              placeholder="hill-chart"
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
            />
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
          <Button type="button" onClick={handleSave} disabled={!isValid}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
