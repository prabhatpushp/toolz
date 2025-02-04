"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ToolsGrid } from "@/components/app-ui/dashboard/tools-grid";
import { CategorySection } from "@/components/app-ui/dashboard/category-section";
import { useBreadcrumbsStore } from "@/store/breadcrumbs-store";
import { useFavoritesStore } from "@/store/favorites-store";

import { tools, categories } from "@/data/tools";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const setItems = useBreadcrumbsStore((state) => state.setItems);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  useEffect(() => {
    setItems([]);
  }, [setItems]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredTools = tools.filter((tool) => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      tool.title.toLowerCase().includes(searchTerm) ||
      tool.description.toLowerCase().includes(searchTerm) ||
      tool.category.toLowerCase().includes(searchTerm);

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(tool.category);

    return matchesSearch && matchesCategory;
  });

  const favoriteTools = filteredTools.filter((tool) => favorites.includes(tool.id));
  const toolsByCategory = categories.reduce((acc, category) => {
    acc[category.slug] = filteredTools.filter((tool) => tool.category === category.slug);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          Developer Tools Hub
        </h1>
        <p className="text-muted-foreground text-center mb-12 text-lg">
          Discover and bookmark your favorite development tools
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 transition-colors duration-200 group-hover:text-muted-foreground group-focus-within:text-primary/70 z-50">
            <Search className="h-[18px] w-[18px] stroke-[2] transition-transform duration-200 group-hover:scale-105 group-focus-within:scale-105" />
          </div>
          <div className="group">
            <Input
              type="text"
              placeholder="Search tools or categories..."
              className="pl-12 pr-16 h-14 bg-background/60 backdrop-blur-sm border-2 border-border/50 shadow-sm transition-all duration-200 hover:border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary text-base rounded-xl placeholder:text-muted-foreground/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border/50 bg-background/80 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex shadow-sm">
            <span className="text-xs">⌘</span>K
          </kbd>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              <X className="h-4 w-4 stroke-[1.5] hover:stroke-2" />
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category.slug}
                variant={selectedCategories.includes(category.slug) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105",
                  "flex items-center gap-2 font-medium",
                  selectedCategories.includes(category.slug)
                    ? "bg-primary/90 hover:bg-primary shadow-md"
                    : "hover:bg-accent/80 hover:text-accent-foreground border-2"
                )}
                onClick={() => toggleCategory(category.slug)}
              >
                {category.icon && <category.icon className="w-4 h-4" />}
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          {/* Favorites Section */}
          {favoriteTools.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-semibold mb-6 text-foreground/90 px-2">Favorites</h2>
              <ToolsGrid tools={favoriteTools} favorites={favorites} onToggleFavorite={toggleFavorite} />
            </div>
          )}

          {/* Categorized Tools Sections */}
          <div className="space-y-16">
            {categories.map(
              (category) =>
                toolsByCategory[category.slug].length > 0 && (
                  <CategorySection
                    key={category.slug}
                    category={category.name}
                    tools={toolsByCategory[category.slug]}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
