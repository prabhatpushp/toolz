import OgImage, { colorSchemes } from "@/components/metadata/opengraph-image";
import { categories, tools } from "@/data/tools";

// Configuration
export const alt = "Toolz - Your Ultimate Developer Tools Resource";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ category: string; tool: string }> }) {
  // Get params
  const { category: paramsCategory, tool: paramsTool } = await params;

  // get category details
  const category = categories.find((category) => category.slug === paramsCategory);

  // get tool details
  const tool = tools.find((tool) => tool.slug === paramsTool);

  const colorScheme = Object.keys(colorSchemes)[
    Math.floor(Math.random() * Object.keys(colorSchemes).length)
  ] as keyof typeof colorSchemes;

  // Get params with defaults

  const toolName = tool?.title || `Curated collection of ${category?.name?.toLowerCase() || "miscellaneous tools"}`;
  const url =
    process.env.NEXT_PUBLIC_BASE_URL && category && tool
      ? process.env.NEXT_PUBLIC_BASE_URL + "/" + category?.slug + "/" + tool?.slug
      : "";
  const title = tool?.description || category?.description || "Find the Perfect Tool for Your Next Project";

  return OgImage(colorScheme, toolName, category?.name, url, title);
}
