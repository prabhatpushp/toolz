"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect } from "react"
import { useSettingsStore } from "@/store/settings-store"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavThemeToggle() {
  const { theme, toggleTheme } = useSettingsStore()

  useEffect(() => {
    // Update document theme when store theme changes
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        onClick={toggleTheme}
        tooltip={theme === "light" ? "Dark mode" : "Light mode"}
      >
        {theme === "light" ? <Moon /> : <Sun />}
        {theme === "light" ? "Dark mode" : "Light mode"}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
