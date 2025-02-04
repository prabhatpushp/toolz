import OgImage from "@/components/metadata/opengraph-image";

// Configuration
export const alt = "Toolz - Your Ultimate Developer Tools Resource";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  // Get params

  // Get params with defaults
  const colorScheme = "green";
  const tool = "Curated collection of tools";
  const category = "Miscellaneous Tools";
  const url = process.env.NEXT_PUBLIC_BASE_URL || "";
  const title = "Find the Perfect Tool for Your Next Project";

  return OgImage(colorScheme, tool, category, url, title);
}
