import type { Tool, ToolDraft } from "../types/tool";

export const emptyDraft: ToolDraft = {
  name: "",
  description: "",
  url: "",
  type: "Website",
  status: "Interested",
  categories: [],
  tags: [],
  platforms: [],
  pricing: "Unknown",
  notes: "",
  favourite: false
};

export function slugify(value: string): string {
  const result = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return result || `tool-${Date.now()}`;
}

export function uniqueId(name: string, tools: Tool[], currentId?: string): string {
  const root = slugify(name);
  let candidate = root;
  let number = 2;
  while (tools.some((tool) => tool.id === candidate && tool.id !== currentId)) {
    candidate = `${root}-${number}`;
    number += 1;
  }
  return candidate;
}

export function splitList(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString();
}
