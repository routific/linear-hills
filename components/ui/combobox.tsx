"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ComboboxOption {
  value: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  loadingMessage = "Loading...",
  isLoading = false,
  disabled = false,
  id,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const selected = options.find((o) => o.value === value);

  // Group options by their group field
  const grouped = React.useMemo(() => {
    const groups = new Map<string | undefined, ComboboxOption[]>();
    for (const opt of options) {
      const key = opt.group;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(opt);
    }
    return groups;
  }, [options]);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-busy={isLoading}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <span className="truncate">
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.icon}
                {selected.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          {isLoading ? (
            <Loader2
              className="ml-2 h-4 w-4 shrink-0 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
          )}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Content
        className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        sideOffset={4}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
          <CommandPrimitive
            className="flex h-full w-full flex-col overflow-hidden"
            shouldFilter={true}
          >
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandPrimitive.Input
                value={search}
                onValueChange={setSearch}
                placeholder={searchPlaceholder}
                className="flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandPrimitive.List className="max-h-[200px] p-1" style={{ overflowY: "auto" }}>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div
                    className="flex items-center gap-2 py-2 px-2 text-sm text-muted-foreground"
                    role="status"
                    aria-live="polite"
                  >
                    <Loader2
                      className="h-4 w-4 shrink-0 animate-spin"
                      aria-hidden
                    />
                    {loadingMessage}
                  </div>
                </CommandPrimitive.Loading>
              )}
              <CommandPrimitive.Empty className="py-2 px-2 text-sm text-muted-foreground">
                {emptyMessage}
              </CommandPrimitive.Empty>
              {Array.from(grouped.entries()).map(([group, items]) => {
                if (group) {
                  return (
                    <CommandPrimitive.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                    >
                      {items.map((opt) => (
                        <CommandPrimitive.Item
                          key={opt.value}
                          value={opt.label}
                          disabled={opt.disabled}
                          onSelect={() => {
                            onValueChange(opt.value);
                            setOpen(false);
                            setSearch("");
                          }}
                          className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                        >
                          <span className="flex items-center gap-2">
                            {opt.icon}
                            {opt.label}
                          </span>
                          {opt.value === value && (
                            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </CommandPrimitive.Item>
                      ))}
                    </CommandPrimitive.Group>
                  );
                }
                return items.map((opt) => (
                  <CommandPrimitive.Item
                    key={opt.value}
                    value={opt.label}
                    disabled={opt.disabled}
                    onSelect={() => {
                      onValueChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </span>
                    {opt.value === value && (
                      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </CommandPrimitive.Item>
                ));
              })}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </PopoverPrimitive.Content>
    </PopoverPrimitive.Root>
  );
}
