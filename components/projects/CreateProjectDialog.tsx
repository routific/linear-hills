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
import { useAppStore } from "@/lib/store/appStore";
import type { Project } from "@/types";

interface CreateProjectDialogProps {
  children: React.ReactNode;
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [labelFilter, setLabelFilter] = useState("");

  const { data: teams, isLoading: isLoadingTeams } = useLinearTeams(open);
  const addProject = useAppStore((state) => state.addProject);

  const handleCreate = () => {
    if (!name.trim() || !selectedTeamId || !labelFilter.trim()) {
      return;
    }

    const project: Project = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim() || undefined,
      linearTeamId: selectedTeamId,
      labelFilter: labelFilter.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addProject(project);

    setName("");
    setDescription("");
    setSelectedTeamId("");
    setLabelFilter("");
    setOpen(false);
  };

  const isValid = name.trim() && selectedTeamId && labelFilter.trim();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Create a new hill chart for Linear issues with a specific label
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
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
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
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
            <Label htmlFor="label">Label Filter</Label>
            <Input
              id="label"
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
          <Button type="button" onClick={handleCreate} disabled={!isValid}>
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
