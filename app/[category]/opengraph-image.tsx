import OgImage, { colorSchemes } from "@/components/metadata/opengraph-image";
import { categories } from "@/data/tools";

// Configuration
export const alt = "Toolz - Your Ultimate Developer Tools Resource";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ category: string }> }) {
  // Get params
  const paramsCategory = (await params).category;

  // get category details
  const category = categories.find((category) => category.slug === paramsCategory);

  // Get params with defaults
  const colorScheme = Object.keys(colorSchemes)[
    Math.floor(Math.random() * Object.keys(colorSchemes).length)
  ] as keyof typeof colorSchemes;

  const tool = `Curated collection of ${category?.name?.toLowerCase() || "miscellaneous tools"}`;
  const url =
    process.env.NEXT_PUBLIC_BASE_URL && category ? process.env.NEXT_PUBLIC_BASE_URL + "/" + category?.slug : "";
  const title = category?.description || "Find the Perfect Tool for Your Next Project";

  return OgImage(colorScheme, tool, category?.name, url, title);
}
