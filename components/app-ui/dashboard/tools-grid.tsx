"use client";

import React from "react";
import { ToolCard } from "./tool-card";

interface ToolsGridProps {
  tools: any[];
  favorites: (number | string)[];
  onToggleFavorite: (id: number | string) => void;
}

export function ToolsGrid({
  tools,
  favorites,
  onToggleFavorite,
}: ToolsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          isFavorite={favorites.includes(tool.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
