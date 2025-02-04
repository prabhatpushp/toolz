"use client";

import * as React from "react";
import { BookOpen, Bot, Command, FileText, Home, LifeBuoy, Send, Settings2, SquareTerminal, Wand2, Github, Linkedin } from "lucide-react";

import { NavMain } from "@/components/app-ui/sidebar/nav-main";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavSecondary } from "@/components/app-ui/sidebar/nav-secondary";
import { NavSettings } from "@/components/app-ui/sidebar/nav-settings";
import { NavThemeToggle } from "@/components/app-ui/sidebar/nav-theme-toggle";
import Link from "next/link";

// This is sample data.
const data = {
    navMain: [
        // {
        //     title: "Playground",
        //     url: "#",
        //     icon: SquareTerminal,
        //     isActive: true,
        //     items: [
        //         {
        //             title: "New Chat",
        //             url: "#",
        //         },
        //         {
        //             title: "History",
        //             url: "#",
        //         },
        //     ],
        // },
        // {
        //     title: "AI Tools",
        //     url: "#",
        //     icon: Wand2,
        //     items: [
        //         {
        //             title: "Text Generation",
        //             url: "#",
        //         },
        //         {
        //             title: "Code Assistant",
        //             url: "#",
        //         },
        //         {
        //             title: "Image Generation",
        //             url: "#",
        //         },
        //     ],
        // },
        // {
        //     title: "Resources",
        //     url: "#",
        //     icon: FileText,
        //     items: [
        //         {
        //             title: "Documentation",
        //             url: "#",
        //         },
        //         {
        //             title: "Examples",
        //             url: "#",
        //         },
        //         {
        //             title: "API Reference",
        //             url: "#",
        //         },
        //     ],
        // },
    ],
    navSecondary: [
        // {
        //     title: "Support",
        //     url: "#",
        //     icon: LifeBuoy,
        // },
        // {
        //     title: "Feedback",
        //     url: "#",
        //     icon: Send,
        // },
        {
            title: "Github",
            url: "https://github.com/prabhatpushp",
            target: "_blank",
            icon: Github,
        },
        {
            title: "Linkedin",
            url: "https://www.linkedin.com/in/prabhat-pushp/",
            target: "_blank",
            icon: Linkedin,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Home className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Tools</span>
                                    <span className="truncate text-xs">Privacy first</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {/* <NavMain items={data.navMain} /> */}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            {/* <SidebarFooter>
                <NavSettings />
            </SidebarFooter> */}
        </Sidebar>
    );
}
