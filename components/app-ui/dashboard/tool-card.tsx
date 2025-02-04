"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  tool: any;
  isFavorite: boolean;
  onToggleFavorite: (id: number | string) => void;
}

export function ToolCard({
  tool,
  isFavorite,
  onToggleFavorite,
}: ToolCardProps) {
  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(tool.id);
  };

  return (
    <Link href={`/${tool.category}/${tool.slug}`}>
      <Card className="relative flex flex-col p-6 bg-background/50 dark:bg-background/80 hover:bg-accent/50 dark:hover:bg-accent/20 shadow-sm hover:shadow-lg transition-all duration-300 w-full md:w-[300px] md:h-[300px] cursor-pointer border border-border">
        {tool.isNew && (
          <Badge
            className="absolute right-2 top-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-3 py-1 rounded-full flex items-center gap-1"
            variant="secondary"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-primary-foreground animate-pulse mr-1"></span>
            NEW
          </Badge>
        )}
        <div className="p-3 bg-muted rounded-xl mb-4 w-fit group-hover:scale-105 transition-transform duration-300">
          {React.createElement(tool.icon || Code2, {
            className: "h-7 w-7 text-primary",
          })}
        </div>
        <div className="flex-1">
          <h3 className="mb-3 text-xl font-semibold line-clamp-2 text-foreground">
            {tool.title}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground overflow-hidden line-clamp-4 leading-relaxed">
            {tool.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 transition-colors duration-300"
          >
            Open →
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "text-gray-400 hover:text-blue-600 transition-colors duration-300 cursor-pointer",
              isFavorite && "text-blue-600"
            )}
            onClick={handleHeartClick}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        </div>
      </Card>
    </Link>
  );
}
