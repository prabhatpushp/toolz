import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            sidebarOpen: true, // Default to open
            theme: 'light', // Default theme
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ 
                theme: state.theme === 'light' ? 'dark' : 'light' 
            })),
        }),
        {
            name: 'app-settings', // Storage key for localStorage
        }
    )
);
