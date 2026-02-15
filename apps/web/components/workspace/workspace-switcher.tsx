'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { CreateWorkspaceDialog } from './create-workspace-dialog';
import { switchWorkspace, type WorkspaceWithRole } from '@/lib/workspace/actions';

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceWithRole[];
  activeWorkspace: WorkspaceWithRole;
  isCollapsed?: boolean;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  isCollapsed = false,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleSwitch = (workspaceId: string) => {
    if (workspaceId === activeWorkspace.id) return;

    startTransition(async () => {
      await switchWorkspace(workspaceId);
      router.refresh();
      setIsOpen(false);
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Building2 className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{activeWorkspace.name}</span>
            <span className="truncate text-xs text-muted-foreground capitalize">
              {activeWorkspace.role}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
        align="start"
        side={isCollapsed ? 'right' : 'bottom'}
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleSwitch(workspace.id)}
            className="cursor-pointer gap-2 p-2"
            disabled={isPending}
          >
            <div className="flex size-6 items-center justify-center rounded-sm border">
              <Building2 className="size-4 shrink-0" />
            </div>
            <div className="flex-1 truncate">{workspace.name}</div>
            {workspace.id === activeWorkspace.id && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <CreateWorkspaceDialog
          trigger={
            <DropdownMenuItem
              className="cursor-pointer gap-2 p-2"
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <span className="text-muted-foreground">Add workspace</span>
            </DropdownMenuItem>
          }
          onSuccess={() => setIsOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
