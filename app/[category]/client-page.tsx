"use client";

import { CategorySection } from "@/components/app-ui/dashboard/category-section";
import { categories, toolsByCategory } from "@/data/tools";
import { useBreadcrumbsStore } from "@/store/breadcrumbs-store";
import { useFavoritesStore } from "@/store/favorites-store";
import { notFound } from "next/navigation";
import React, { useEffect } from "react";

const ClientPage = ({ category: paramCategory }: { category: string }) => {
  const category = categories.find((category) => category.slug === paramCategory);
  if (!category) {
    return notFound();
  }

  const setItems = useBreadcrumbsStore((state) => state.setItems);
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  useEffect(() => {
    setItems([{ label: category.name }]);
  }, [setItems]);

  const tools = toolsByCategory[category.slug];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          {category.name}
        </h1>
        <p className="text-muted-foreground text-center mb-12 text-lg">
          Explore our curated collection of {category.name.toLowerCase()}
        </p>

        <div className="max-w-7xl mx-auto">
          <CategorySection
            key={category.slug}
            category={category.name}
            tools={toolsByCategory[category.slug]}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
