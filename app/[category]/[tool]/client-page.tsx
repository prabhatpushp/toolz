"use client";

import { categories, toolsByCategory } from "@/data/tools";
import { useBreadcrumbsStore } from "@/store/breadcrumbs-store";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import React, { useEffect } from "react";
import Loader from "@/components/Loader";

const ClientPage = ({
  category: paramCategory,
  tool: paramTool,
}: {
  category: string;
  tool: string;
}) => {
  // check if category and tool exist
  const category = categories.find(
    (category) => category.slug === paramCategory
  );
  if (!category) {
    return notFound();
  }
  const tool = toolsByCategory[category.slug].find(
    (tool) => tool.slug === paramTool
  );

  if (!tool) {
    return notFound();
  }

  // Breadcrumbs
  const setItems = useBreadcrumbsStore((state) => state.setItems);
  useEffect(() => {
    setItems([
      { label: category.name, href: `/${category.slug}` },
      { label: tool.title },
    ]);
  }, [setItems]);

  // Dynamic import
  const ToolComponent = dynamic(
    () => import(`@/tools/${category.slug}/${tool.slug}/page`),
    {
      loading: () => <Loader />,
    }
  );

  return <ToolComponent />;
};

export default ClientPage;
