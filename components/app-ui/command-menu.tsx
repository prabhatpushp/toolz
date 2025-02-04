"use client"

import * as React from "react"
import {
  Settings,
  Search,
  Key,
  Palette,
  HelpCircle,
  MessageCircle,
  Heart,
  Twitter,
  Github,
  Mail,
  BookOpen,
  LayoutGrid,
  Home,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { tools } from "@/data/tools"
import { useCommandMenu } from "@/hooks/use-command-menu"

// Function to get recent searches from localStorage
const getRecentSearches = () => {
  if (typeof window === "undefined") return []
  const searches = localStorage.getItem("recentSearches")
  return searches ? JSON.parse(searches) : []
}

// Function to save a search to recent searches
const saveRecentSearch = (search: string) => {
  if (typeof window === "undefined") return
  const searches = getRecentSearches()
  const newSearches = [search, ...searches.filter((s: string) => s !== search)].slice(0, 3)
  localStorage.setItem("recentSearches", JSON.stringify(newSearches))
}

export function CommandMenu() {
  const { isOpen, closeMenu } = useCommandMenu()
  const [search, setSearch] = React.useState("")
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])
  const router = useRouter()

  // Load recent searches on mount
  React.useEffect(() => {
    setRecentSearches(getRecentSearches())
  }, [])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        useCommandMenu.getState().toggleMenu()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    closeMenu()
    command()
  }, [closeMenu])

  // Group tools by category
  const toolsByCategory = React.useMemo(() => {
    return tools.reduce((acc, tool) => {
      const category = tool.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(tool)
      return acc
    }, {} as Record<string, typeof tools>)
  }, [])

  const navigateToTool = (tool: (typeof tools)[0]) => {
    const categorySlug = (tool.category || "other").toLowerCase().replace(/\s+/g, "-")
    const toolSlug = tool.slug
    saveRecentSearch(tool.title)
    setRecentSearches(getRecentSearches())
    runCommand(() => router.push(`/${categorySlug}/${toolSlug}`))
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={closeMenu}>
      <DialogTitle className="sr-only">Command Menu</DialogTitle>
      <CommandInput 
        placeholder="Type a command or search for tools..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
            <Home className="mr-2 h-4 w-4" />
            Home
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/categories"))}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Browse Categories
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/api-keys"))}>
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </CommandItem>
        </CommandGroup>

        {recentSearches.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((item) => (
                <CommandItem 
                  key={item}
                  onSelect={() => {
                    setSearch(item)
                  }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {item}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Support & Feedback">
          <CommandItem onSelect={() => runCommand(() => window.open("https://docs.toolz.com", "_blank"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            Documentation
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.open("https://github.com/toolz/issues", "_blank"))}>
            <Github className="mr-2 h-4 w-4" />
            Report an Issue
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.open("https://twitter.com/toolz", "_blank"))}>
            <Twitter className="mr-2 h-4 w-4" />
            Follow us on Twitter
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => window.location.href = "mailto:support@toolz.com")}>
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
          <React.Fragment key={category}>
            <CommandGroup heading={category}>
              {categoryTools
                .filter(tool => 
                  !search || 
                  tool.title.toLowerCase().includes(search.toLowerCase()) ||
                  tool.description.toLowerCase().includes(search.toLowerCase())
                )
                .map((tool) => (
                  <CommandItem
                    key={tool.id}
                    onSelect={() => navigateToTool(tool)}
                  >
                    <div className="mr-2 flex h-4 w-4 items-center justify-center">
                      {<tool.icon className="h-4 w-4" />}
                    </div>
                    {tool.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
