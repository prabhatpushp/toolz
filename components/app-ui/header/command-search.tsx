"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCommandMenu } from "@/hooks/use-command-menu"

export function CommandSearch() {
  const { openMenu } = useCommandMenu()

  return (
    <Button
      variant="outline"
      className="relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      onClick={openMenu}
    >
      <span className="hidden lg:inline-flex">Search tools...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-[0.4rem] top-[0.4rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
