"use client";

import { Breadcrumbs } from "@/components/app-ui/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useCommandMenu } from "@/hooks/use-command-menu";

export function Header() {
  const { openMenu } = useCommandMenu();

  return (
    <header className="flex h-12 w-full bg-sidebar shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b border-b-sidebar-border">
      <div className="flex items-center gap-2 px-4 flex-1">
        <SidebarTrigger className="-ml-1" />

        <Breadcrumbs />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="relative w-9 p-0 xl:w-44 xl:border-muted-foreground/30 xl:bg-background xl:shadow-sm  xl:justify-start xl:px-3 xl:py-2 hover:bg-background/80 hover:shadow-sm transition-all duration-200 rounded-lg border border-transparent hover:border-border/50"
            onClick={openMenu}
          >
            <Search className="h-4 w-4 xl:mr-1 text-muted-foreground" />
            <span className="hidden xl:inline-flex text-muted-foreground">Quick search...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background/80 px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>
      </div>
    </header>
  );
}
