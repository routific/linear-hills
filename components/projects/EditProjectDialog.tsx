"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useLinearTeams } from "@/lib/hooks/useLinearTeams";
import { useLinearProjects } from "@/lib/hooks/useLinearProjects";
import { useLinearLabels } from "@/lib/hooks/useLinearLabels";
import { useAppStore } from "@/lib/store/appStore";
import { useUpdateProject } from "@/lib/hooks/mutations/useProjectMutations";
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
  const { data: labels, isLoading: isLoadingLabels } = useLinearLabels(
    selectedTeamId,
    open && !!selectedTeamId
  );

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const updateProjectStore = useAppStore((state) => state.updateProject);
  const updateProjectMutation = useUpdateProject();

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

  const projectOptions: ComboboxOption[] = useMemo(
    () =>
      projects?.map((p) => ({
        value: p.id,
        label: p.name,
      })) ?? [],
    [projects]
  );

  const labelOptions: ComboboxOption[] = useMemo(
    () =>
      labels?.map((l) => ({
        value: l.name,
        label: l.name,
        group: l.groupName,
        icon: (
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: l.color }}
          />
        ),
      })) ?? [],
    [labels]
  );

  const handleSave = () => {
    if (!name.trim() || !selectedTeamId || !selectedProjectId || !labelFilter.trim()) {
      return;
    }

    const team = teams?.find((t) => t.id === selectedTeamId);
    const linearProject = projects?.find((p) => p.id === selectedProjectId);
    const label = labels?.find((l) => l.name === labelFilter);

    const updates = {
      name: name.trim(),
      description: description.trim() || undefined,
      linearTeamId: selectedTeamId,
      linearTeamName: team?.name,
      linearProjectId: selectedProjectId,
      linearProjectName: linearProject?.name,
      labelFilter: label?.name || labelFilter.trim(),
      updatedAt: new Date().toISOString(),
    };

    // Use mutation for authenticated users, store for unauthenticated
    if (isAuthenticated) {
      updateProjectMutation.mutate({ id: project.id, updates });
    } else {
      updateProjectStore(project.id, updates);
    }

    setOpen(false);
  };

  const isValid = name.trim() && selectedTeamId && selectedProjectId && labelFilter.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
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
                setLabelFilter(""); // Reset label when team changes
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
            <Combobox
              id="edit-project"
              options={projectOptions}
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              placeholder="Select a project"
              searchPlaceholder="Search projects..."
              emptyMessage="No projects found"
              loadingMessage="Loading projects..."
              isLoading={isLoadingProjects}
              disabled={!selectedTeamId}
            />
            <p className="text-xs text-muted-foreground">
              Select the Linear project to filter issues from
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-label">Label Filter</Label>
            <Combobox
              id="edit-label"
              options={labelOptions}
              value={labelFilter}
              onValueChange={setLabelFilter}
              placeholder="Select a label"
              searchPlaceholder="Search labels..."
              emptyMessage="No labels found"
              loadingMessage="Loading labels..."
              isLoading={isLoadingLabels}
              disabled={!selectedTeamId}
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
