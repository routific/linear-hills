"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useAppStore } from "@/lib/store/appStore";
import { useLinearTeams } from "@/lib/hooks/useLinearTeams";
import { useLinearLabels } from "@/lib/hooks/useLinearLabels";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultLabelFilter = useAppStore(
    (state) => state.workspaceSettings.defaultLabelFilter
  );
  const updateDefaultLabelFilter = useAppStore(
    (state) => state.updateDefaultLabelFilter
  );

  const [value, setValue] = useState(defaultLabelFilter);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const queryClient = useQueryClient();

  const { data: teams, isLoading: isLoadingTeams } = useLinearTeams(open);
  const { data: labels, isLoading: isLoadingLabels } = useLinearLabels(
    selectedTeamId,
    open && !!selectedTeamId
  );

  useEffect(() => {
    if (open) {
      setValue(defaultLabelFilter);
      setError(null);
    } else {
      setSelectedTeamId("");
    }
  }, [open, defaultLabelFilter]);

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

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (trimmed === defaultLabelFilter) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateDefaultLabelFilter(trimmed);
      queryClient.invalidateQueries({ queryKey: ["workspace-data"] });
      queryClient.invalidateQueries({ queryKey: ["linear-issues"] });
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
          <DialogDescription>
            Preferences applied to every hillchart in this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="default-label">Default label filter</Label>
            <Input
              id="default-label"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Slice"
            />
            <p className="text-xs text-muted-foreground">
              Only Linear issues with this label appear on hillcharts. Type it
              directly if you know the name, or pick from a team below.
            </p>
          </div>

          <div className="grid gap-3 rounded-md border border-border/50 bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Browse labels
            </p>

            <div className="grid gap-2">
              <Label htmlFor="settings-team" className="text-xs">
                Linear team
              </Label>
              <Select
                value={selectedTeamId}
                onValueChange={setSelectedTeamId}
              >
                <SelectTrigger id="settings-team">
                  <SelectValue placeholder="Select a team to load labels" />
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
              <Label htmlFor="settings-label" className="text-xs">
                Label
              </Label>
              <Combobox
                id="settings-label"
                options={labelOptions}
                value={value}
                onValueChange={setValue}
                placeholder="Pick a label"
                searchPlaceholder="Search labels..."
                emptyMessage={
                  selectedTeamId ? "No labels found" : "Select a team first"
                }
                loadingMessage="Loading labels..."
                isLoading={isLoadingLabels}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !value.trim()}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
