import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppSidebar } from "@/components/app-ui/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CommandMenu } from "@/components/app-ui/command-menu";
import { Header } from "@/components/app-ui/header/Header";
import { Toaster as HotToaster } from "react-hot-toast";
import "./globals.css";
import "@/lib/promise-polyfill";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Toolz - Your Ultimate Developer Tools Collection",
    description: "Discover and access a curated collection of essential developer tools and resources all in one place.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SidebarProvider>
                    <CommandMenu />
                    <AppSidebar />
                    <SidebarInset>
                        <Header />
                        <div className="relative overflow-hidden">{children}</div>
                    </SidebarInset>
                </SidebarProvider>
                <HotToaster position="bottom-right" />
                <SpeedInsights />
            </body>
        </html>
    );
}
