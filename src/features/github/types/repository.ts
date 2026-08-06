export type RepositoryStatus =
  | "Actively using"
  | "Following"
  | "Want to try"
  | "Evaluating"
  | "Stopped following"
  | "Archived";

export interface TrackedRepository {
  id: string;
  owner: string;
  repository: string;
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  license: string;
  topics: string[];
  stars: number | null;
  forks: number | null;
  lastUpdated: string;
  status: RepositoryStatus;
  categories: string[];
  personalTags: string[];
  notes: string;
  reasonForFollowing: string;
  possibleUse: string;
  favourite: boolean;
  dateAdded: string;
  dateReviewed: string;
}

export type RepositoryDraft = Omit<TrackedRepository, "id" | "dateAdded">;

export interface GitHubApiRepository {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  license: { spdx_id: string | null; name: string } | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  owner: { login: string };
}
