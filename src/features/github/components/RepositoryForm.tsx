import { useState } from "react";
import type { GitHubApiRepository, RepositoryDraft, RepositoryStatus, TrackedRepository } from "../types/repository";
import { joinList, parseGitHubUrl, splitList } from "../utils/repositoryHelpers";

interface Props {
  item: TrackedRepository | null;
  onSave: (draft: RepositoryDraft) => void;
  onCancel: () => void;
}

const statuses: RepositoryStatus[] = ["Actively using", "Following", "Want to try", "Evaluating", "Stopped following", "Archived"];

function emptyDraft(): RepositoryDraft {
  return {
    owner: "", repository: "", name: "", description: "", url: "", homepage: "", language: "", license: "", topics: [],
    stars: null, forks: null, lastUpdated: "", status: "Following", categories: [], personalTags: [], notes: "",
    reasonForFollowing: "", possibleUse: "", favourite: false, dateReviewed: ""
  };
}

export function RepositoryForm({ item, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<RepositoryDraft>(item ? {
    owner: item.owner, repository: item.repository, name: item.name, description: item.description, url: item.url,
    homepage: item.homepage, language: item.language, license: item.license, topics: item.topics, stars: item.stars,
    forks: item.forks, lastUpdated: item.lastUpdated, status: item.status, categories: item.categories,
    personalTags: item.personalTags, notes: item.notes, reasonForFollowing: item.reasonForFollowing,
    possibleUse: item.possibleUse, favourite: item.favourite, dateReviewed: item.dateReviewed
  } : emptyDraft());
  const [repositoryUrl, setRepositoryUrl] = useState(item?.url ?? "");
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "error">("idle");
  const [fetchError, setFetchError] = useState("");

  function update<K extends keyof RepositoryDraft>(key: K, value: RepositoryDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function fetchMetadata() {
    const parsed = parseGitHubUrl(repositoryUrl);
    if (!parsed) {
      setFetchState("error");
      setFetchError("Enter a repository URL like https://github.com/owner/project");
      return;
    }
    setFetchState("loading");
    setFetchError("");
    try {
      const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repository)}`, {
        headers: { Accept: "application/vnd.github+json" }
      });
      if (!response.ok) throw new Error(response.status === 404 ? "Repository not found." : `GitHub returned ${response.status}.`);
      const data = await response.json() as GitHubApiRepository;
      setDraft((current) => ({
        ...current,
        owner: data.owner.login,
        repository: data.name,
        name: data.name,
        description: data.description ?? "",
        url: data.html_url,
        homepage: data.homepage ?? "",
        language: data.language ?? "",
        license: data.license?.spdx_id ?? data.license?.name ?? "",
        topics: data.topics ?? [],
        stars: data.stargazers_count,
        forks: data.forks_count,
        lastUpdated: data.updated_at,
        dateReviewed: new Date().toISOString().slice(0, 10)
      }));
      setRepositoryUrl(data.html_url);
      setFetchState("idle");
    } catch (error) {
      setFetchState("error");
      setFetchError(error instanceof Error ? error.message : "Could not fetch repository data.");
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.owner.trim() || !draft.repository.trim() || !draft.name.trim() || !draft.url.trim()) return;
    onSave(draft);
  }

  return (
    <div className="github-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="github-editor-panel" role="dialog" aria-modal="true" aria-labelledby="repository-editor-title">
        <header className="github-editor-header"><h2 id="repository-editor-title">{item ? "Edit repository" : "Add repository"}</h2><button type="button" className="github-icon-button" onClick={onCancel} aria-label="Close">×</button></header>
        <form className="repository-form" onSubmit={submit}>
          <div className="github-fetch-row wide">
            <label>GitHub repository URL<input type="url" value={repositoryUrl} placeholder="https://github.com/owner/project" onChange={(event) => setRepositoryUrl(event.target.value)} /></label>
            <button className="repository-button primary" type="button" disabled={fetchState === "loading"} onClick={fetchMetadata}>{fetchState === "loading" ? "Fetching…" : "Fetch from GitHub"}</button>
          </div>
          {fetchState === "error" && <p className="github-form-error wide">{fetchError}</p>}
          <label>Owner<input required value={draft.owner} onChange={(event) => update("owner", event.target.value)} /></label>
          <label>Repository name<input required value={draft.repository} onChange={(event) => update("repository", event.target.value)} /></label>
          <label className="wide">Display name<input required value={draft.name} onChange={(event) => update("name", event.target.value)} /></label>
          <label className="wide">Repository URL<input required type="url" value={draft.url} onChange={(event) => update("url", event.target.value)} /></label>
          <label className="wide">Description<textarea rows={3} value={draft.description} onChange={(event) => update("description", event.target.value)} /></label>
          <label>Homepage<input type="url" value={draft.homepage} onChange={(event) => update("homepage", event.target.value)} /></label>
          <label>Status<select value={draft.status} onChange={(event) => update("status", event.target.value as RepositoryStatus)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Language<input value={draft.language} onChange={(event) => update("language", event.target.value)} /></label>
          <label>License<input value={draft.license} onChange={(event) => update("license", event.target.value)} /></label>
          <label className="wide">Categories <span>Comma separated</span><input value={joinList(draft.categories)} onChange={(event) => update("categories", splitList(event.target.value))} /></label>
          <label className="wide">Personal tags <span>Comma separated</span><input value={joinList(draft.personalTags)} onChange={(event) => update("personalTags", splitList(event.target.value))} /></label>
          <label className="wide">Why are you following it?<textarea rows={2} value={draft.reasonForFollowing} onChange={(event) => update("reasonForFollowing", event.target.value)} /></label>
          <label className="wide">Possible use<textarea rows={2} value={draft.possibleUse} onChange={(event) => update("possibleUse", event.target.value)} /></label>
          <label className="wide">Notes<textarea rows={4} value={draft.notes} onChange={(event) => update("notes", event.target.value)} /></label>
          <label className="github-checkbox-row wide"><input type="checkbox" checked={draft.favourite} onChange={(event) => update("favourite", event.target.checked)} /> Favourite repository</label>
          <div className="github-form-actions wide"><button className="repository-button secondary" type="button" onClick={onCancel}>Cancel</button><button className="repository-button primary" type="submit">Save repository</button></div>
        </form>
      </section>
    </div>
  );
}
