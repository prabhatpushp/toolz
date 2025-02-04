import * as React from "react";
import { type LucideIcon } from "lucide-react";

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { NavThemeToggle } from "@/components/app-ui/sidebar/nav-theme-toggle";

export function NavSecondary({
    items,
    ...props
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        target?: string;
    }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild size="sm" tooltip={item.title}>
                                <Link href={item.url} target={item.target || "_self"}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <NavThemeToggle />
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
