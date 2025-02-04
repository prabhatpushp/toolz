"use client";

import { ToolsGrid } from "./tools-grid";

interface CategorySectionProps {
    category: string;
    tools: any[];
    favorites: (number | string)[];
    onToggleFavorite: (id: number | string) => void;
}

export function CategorySection({ category, tools, favorites, onToggleFavorite }: CategorySectionProps) {
    return (
        <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category}</h2>
            <ToolsGrid tools={tools} favorites={favorites} onToggleFavorite={onToggleFavorite} />
        </div>
    );
}
