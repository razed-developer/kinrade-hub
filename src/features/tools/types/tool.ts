export const toolTypes = ["Website", "Desktop App", "Mobile App", "Service", "Extension", "Library", "Other"] as const;
export const toolStatuses = ["Using", "Testing", "Interested", "Stopped Using", "Archived"] as const;
export const pricingOptions = ["Free", "Freemium", "Paid", "Self-hosted", "Unknown"] as const;

export type ToolType = (typeof toolTypes)[number];
export type ToolStatus = (typeof toolStatuses)[number];
export type Pricing = (typeof pricingOptions)[number];

export interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  type: ToolType;
  status: ToolStatus;
  categories: string[];
  tags: string[];
  platforms: string[];
  pricing: Pricing;
  notes: string;
  favourite: boolean;
  dateAdded: string;
  dateUpdated: string;
}

export type ToolDraft = Omit<Tool, "id" | "dateAdded" | "dateUpdated">;
