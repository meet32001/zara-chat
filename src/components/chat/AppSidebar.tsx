import { NavLink } from "react-router-dom";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pin, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
};

interface AppSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AppSidebar({ conversations, activeId, onSelect, onDelete }: AppSidebarProps) {
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations]
  );

  return (
    <Sidebar className="w-64" collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <SidebarInput placeholder="Search" aria-label="Search chats" />
        </div>
      </SidebarHeader>
      <SidebarContent className="no-scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sorted.map((c) => (
                <SidebarMenuItem key={c.id}>
                  <SidebarMenuButton asChild isActive={activeId === c.id}>
                    <button
                      className="w-full text-left flex items-center justify-between"
                      onClick={() => onSelect(c.id)}
                      aria-label={`Open ${c.title}`}
                    >
                      <span className="truncate">{c.title}</span>
                      <span className="ml-2 hidden sm:flex items-center gap-1 opacity-70">
                        <Pin className="h-3.5 w-3.5" />
                        <button
                          className="h-6 w-6 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {sorted.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground">No chats yet</div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
