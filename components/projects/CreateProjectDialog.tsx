"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { useLinearTeams } from "@/lib/hooks/useLinearTeams";
import { useLinearProjects } from "@/lib/hooks/useLinearProjects";
import { useLinearLabels } from "@/lib/hooks/useLinearLabels";
import { useAppStore } from "@/lib/store/appStore";
import { useCreateProject } from "@/lib/hooks/mutations/useProjectMutations";
import { getLinearClient } from "@/lib/linear/client";
import { SettingsDialog } from "./SettingsDialog";
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

  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const addProjectStore = useAppStore((state) => state.addProject);
  const defaultLabelFilter = useAppStore(
    (state) => state.workspaceSettings.defaultLabelFilter
  );
  const createProjectMutation = useCreateProject();

  const [labelFilter, setLabelFilter] = useState(defaultLabelFilter);

  // Keep labelFilter in sync with workspace default when it changes (e.g. via
  // SettingsDialog) and the user hasn't overridden it for this hillchart.
  useEffect(() => {
    if (open) {
      setLabelFilter(defaultLabelFilter);
    }
  }, [open, defaultLabelFilter]);

  const { data: teams, isLoading: isLoadingTeams } = useLinearTeams(open);
  const { data: projects, isLoading: isLoadingProjects } = useLinearProjects(
    selectedTeamId,
    open && !!selectedTeamId
  );
  const { data: labels, isLoading: isLoadingLabels } = useLinearLabels(
    selectedTeamId,
    open && !!selectedTeamId
  );

  const projectOptions: ComboboxOption[] = useMemo(
    () =>
      projects?.map((p) => ({
        value: p.id,
        label: p.name,
      })) ?? [],
    [projects]
  );

  const labelOptions: ComboboxOption[] = useMemo(() => {
    const opts: ComboboxOption[] =
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
      })) ?? [];
    // Ensure the current value (e.g., the workspace default) is selectable
    // even if it doesn't appear in this team's label set.
    if (labelFilter && !opts.some((o) => o.value === labelFilter)) {
      opts.unshift({ value: labelFilter, label: labelFilter });
    }
    return opts;
  }, [labels, labelFilter]);

  const handleCreate = () => {
    const trimmedLabel = labelFilter.trim();
    if (!name.trim() || !selectedTeamId || !selectedProjectId || !trimmedLabel) {
      return;
    }

    const team = teams?.find((t) => t.id === selectedTeamId);
    const linearProject = projects?.find((p) => p.id === selectedProjectId);

    const project: Project = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim() || undefined,
      linearTeamId: selectedTeamId,
      linearTeamName: team?.name,
      linearProjectId: selectedProjectId,
      linearProjectName: linearProject?.name,
      labelFilter: trimmedLabel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use mutation for authenticated users, store for unauthenticated
    if (isAuthenticated) {
      createProjectMutation.mutate(project, {
        onSuccess: async () => {
          try {
            const client = await getLinearClient();
            const hillchartUrl = `${window.location.origin}/projects/${project.id}`;
            await client.createEntityExternalLink({
              projectId: project.linearProjectId,
              label: `Hill chart: ${project.name}`,
              url: hillchartUrl,
            });
          } catch (err) {
            console.error("Failed to add hillchart link to Linear project:", err);
          }
        },
      });
    } else {
      addProjectStore(project);
    }

    setName("");
    setDescription("");
    setSelectedTeamId("");
    setSelectedProjectId("");
    setLabelFilter(defaultLabelFilter);
    setOpen(false);
  };

  const isValid =
    name.trim() && selectedTeamId && selectedProjectId && labelFilter.trim();

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
            <Combobox
              id="project"
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
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="label">Label filter</Label>
              <SettingsDialog>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline whitespace-nowrap"
                >
                  Change default in Settings
                </button>
              </SettingsDialog>
            </div>
            <Combobox
              id="label"
              options={labelOptions}
              value={labelFilter}
              onValueChange={setLabelFilter}
              placeholder="Select a label"
              searchPlaceholder="Search labels..."
              emptyMessage={
                selectedTeamId
                  ? "No labels found"
                  : "Pick a team above to load more labels"
              }
              loadingMessage="Loading labels..."
              isLoading={isLoadingLabels}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to the workspace label ({defaultLabelFilter}). Override
              for this hillchart by picking another.
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
