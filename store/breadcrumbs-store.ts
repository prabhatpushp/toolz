import { create } from 'zustand'

type BreadcrumbItem = {
  label: string
  href?: string
  icon?: any
}

interface BreadcrumbsState {
  items: BreadcrumbItem[]
  setItems: (items: BreadcrumbItem[]) => void
  addItem: (item: BreadcrumbItem) => void
  removeItem: (label: string) => void
  clearItems: () => void
}

export const useBreadcrumbsStore = create<BreadcrumbsState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (label) => set((state) => ({ items: state.items.filter((item) => item.label !== label) })),
  clearItems: () => set({ items: [] }),
}))
