"use server";

import { toolsByCategory } from "@/data/tools";
import ClientPage from "./client-page";

export async function generateMetadata({ params }: { params: Promise<{ category: string; tool: string }> }) {
  const { category: paramsCategory, tool: paramsTool } = await params;

  const tool = toolsByCategory[paramsCategory].find((tool) => tool.slug === paramsTool);
  if (!tool) {
    return {};
  }
  return {
    title: "Toolz | " + tool.title,
    description: tool.description,
  };
}

const Tool = async ({ params }: { params: Promise<{ category: string; tool: string }> }) => {
  const { category, tool } = await params;
  return <ClientPage tool={tool} category={category} />;
};

export async function generateStaticParams() {
  const paths: { tool: string; category: string }[] = [];
  Object.keys(toolsByCategory).map((category) => {
    toolsByCategory[category].map((tool) => {
      paths.push({
        tool: tool.slug,
        category: category,
      });
    });
  });
  return paths;
}

export default Tool;
