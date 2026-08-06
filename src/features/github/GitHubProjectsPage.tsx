import { useEffect, useMemo, useRef, useState } from "react";
import initialRepositories from "./data/repositories.json";
import { RepositoryCard } from "./components/RepositoryCard";
import { RepositoryForm } from "./components/RepositoryForm";
import type { RepositoryDraft, TrackedRepository } from "./types/repository";
import { uniqueRepositoryId } from "./utils/repositoryHelpers";
import "./github.css";

const editable = import.meta.env.DEV;

export function GitHubProjectsPage() {
  const [items, setItems] = useState<TrackedRepository[]>(initialRepositories as TrackedRepository[]);
  const [editing, setEditing] = useState<TrackedRepository | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [language, setLanguage] = useState("All");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editable) return;
    fetch("/api/github-projects").then((response) => response.json()).then((data) => Array.isArray(data) && setItems(data)).catch(() => setSaveState("error"));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...items]
      .filter((item) => !normalized || [item.name, item.owner, item.repository, item.description, item.notes, item.reasonForFollowing, item.possibleUse, ...item.categories, ...item.personalTags, ...item.topics].join(" ").toLowerCase().includes(normalized))
      .filter((item) => status === "All" || item.status === status)
      .filter((item) => language === "All" || item.language === language)
      .filter((item) => !favouritesOnly || item.favourite)
      .sort((a, b) => Number(b.favourite) - Number(a.favourite) || a.name.localeCompare(b.name));
  }, [items, query, status, language, favouritesOnly]);

  const statuses = ["All", ...new Set(items.map((item) => item.status))];
  const languages = ["All", ...new Set(items.map((item) => item.language).filter(Boolean))];

  async function persist(next: TrackedRepository[]) {
    setItems(next);
    if (!editable) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/github-projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error("Save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function saveRepository(draft: RepositoryDraft) {
    const today = new Date().toISOString().slice(0, 10);
    if (editing) {
      void persist(items.map((item) => item.id === editing.id ? { ...item, ...draft, id: uniqueRepositoryId(draft.owner, draft.repository, items, editing.id) } : item));
    } else {
      void persist([...items, { ...draft, id: uniqueRepositoryId(draft.owner, draft.repository, items), dateAdded: today }]);
    }
    setEditing(undefined);
  }

  function deleteRepository(item: TrackedRepository) {
    if (window.confirm(`Delete “${item.name}”?\n\nThe JSON file will be updated immediately.`)) void persist(items.filter((entry) => entry.id !== item.id));
  }

  function exportJson() {
    const blob = new Blob([`${JSON.stringify(items, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "github-projects-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importJson(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed)) throw new Error();
        if (window.confirm(`Replace the current list with ${parsed.length} imported repositories?`)) void persist(parsed);
      } catch {
        window.alert("That file is not a valid GitHub projects JSON backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="github-projects-page">
      <header className="github-page-header">
        <div><p className="github-eyebrow">Open-source watchlist</p><h1>GitHub Projects</h1><p className="github-intro">Repositories I use, follow, evaluate, or want to remember.</p></div>
        <div className="github-header-actions">
          {editable && <>
            <span className={`github-save-state ${saveState}`}>{saveState === "saving" ? "Saving…" : saveState === "error" ? "Save error" : "Saved to repositories.json"}</span>
            <button className="repository-button primary" onClick={() => setEditing(null)}>+ Add repository</button>
            <button className="repository-button secondary" onClick={exportJson}>Export</button>
            <button className="repository-button secondary" onClick={() => importInput.current?.click()}>Import</button>
            <input ref={importInput} hidden type="file" accept="application/json" onChange={(event) => importJson(event.target.files?.[0])} />
          </>}
        </div>
      </header>
      {editable && <aside className="github-local-notice"><strong>Local editing mode.</strong> Changes write directly to <code>src/features/github/data/repositories.json</code>. Commit and push that file to publish updates.</aside>}
      <main className="github-projects-main">
        <section className="github-filters" aria-label="Repository filters">
          <label className="github-search-field">Search<input type="search" placeholder="Search names, notes, owners, topics…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Language<select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="github-checkbox-row"><input type="checkbox" checked={favouritesOnly} onChange={(event) => setFavouritesOnly(event.target.checked)} /> Favourites only</label>
        </section>
        <div className="github-results-line"><strong>{filtered.length}</strong> of {items.length} repositories</div>
        {filtered.length > 0 ? <section className="repository-grid">{filtered.map((item) => <RepositoryCard key={item.id} item={item} editable={editable} onEdit={setEditing} onDelete={deleteRepository} />)}</section> : <section className="github-empty-state"><h2>No matching repositories</h2><p>Clear a filter or add another project.</p></section>}
      </main>
      {editing !== undefined && <RepositoryForm item={editing} onSave={saveRepository} onCancel={() => setEditing(undefined)} />}
    </div>
  );
}
