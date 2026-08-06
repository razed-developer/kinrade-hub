import type { TrackedRepository } from "../types/repository";

export function splitList(value: string): string[] {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function joinList(values: string[]): string {
  return values.join(", ");
}

export function uniqueRepositoryId(owner: string, repository: string, items: TrackedRepository[], currentId?: string): string {
  const base = `${owner}-${repository}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "repository";
  let id = base;
  let suffix = 2;
  while (items.some((item) => item.id === id && item.id !== currentId)) id = `${base}-${suffix++}`;
  return id;
}

export function parseGitHubUrl(value: string): { owner: string; repository: string } | null {
  const trimmed = value.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  const match = trimmed.match(/^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/#?]+)$/i);
  if (!match) return null;
  return { owner: match[1], repository: match[2] };
}

export function formatCount(value: number | null): string {
  if (value === null) return "Unknown";
  return new Intl.NumberFormat("en-CA", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
