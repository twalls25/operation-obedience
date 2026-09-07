export const RESOURCE_TYPES = ["book", "sermon", "video", "article", "plan"] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  book: "Book",
  sermon: "Sermon",
  video: "Video",
  article: "Article",
  plan: "Plan",
};
