"use server";

import { categories, toolsByCategory } from "@/data/tools";
import React from "react";
import ClientPage from "./client-page";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const paramsCategory = (await params).category;

  // get category details
  const category = categories.find((category) => category.slug === paramsCategory);

  if (!category) {
    return {};
  }
  return {
    title: "Toolz | " + category.name,
    description: category.description,
  };
}

const Category = async ({ params }: { params: Promise<{ category: string }> }) => {
  const paramsCategory = (await params).category;

  return <ClientPage category={paramsCategory} />;
};

export async function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export default Category;
