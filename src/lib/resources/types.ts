export const RESOURCE_TYPES = ["book", "sermon", "video", "article", "plan"] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  book: "Book",
  sermon: "Sermon",
  video: "Video",
  article: "Article",
  plan: "Plan",
};

// Logged-out visitors only see these types (see CLAUDE.md's "Public vs
// member visibility" note) — plan/video require an account.
export const PUBLIC_RESOURCE_TYPES = ["book", "sermon", "article"] as const;
