import { useEffect, useMemo, useRef, useState } from "react";
import initialTools from "./data/tools.json";
import { ToolCard } from "./components/ToolCard";
import { ToolForm } from "./components/ToolForm";
import type { Tool, ToolDraft } from "./types/tool";
import { uniqueId } from "./utils/toolHelpers";
import "./tools.css";

const editable = import.meta.env.DEV;

export function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>(initialTools as Tool[]);
  const [editing, setEditing] = useState<Tool | null | undefined>(undefined);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [type, setType] = useState("All");
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const importInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editable) return;
    fetch("/api/tools")
      .then((response) => response.json())
      .then((data) => Array.isArray(data) && setTools(data))
      .catch(() => setSaveState("error"));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...tools]
      .filter((tool) => !normalized || [tool.name, tool.description, tool.notes, ...tool.categories, ...tool.tags, ...tool.platforms].join(" ").toLowerCase().includes(normalized))
      .filter((tool) => status === "All" || tool.status === status)
      .filter((tool) => type === "All" || tool.type === type)
      .filter((tool) => !favouritesOnly || tool.favourite)
      .sort((a, b) => Number(b.favourite) - Number(a.favourite) || a.name.localeCompare(b.name));
  }, [tools, query, status, type, favouritesOnly]);

  const statuses = ["All", ...new Set(tools.map((tool) => tool.status))];
  const types = ["All", ...new Set(tools.map((tool) => tool.type))];

  async function persist(next: Tool[]) {
    setTools(next);
    if (!editable) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/tools", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next)
      });
      if (!response.ok) throw new Error("Save failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function saveTool(draft: ToolDraft) {
    const today = new Date().toISOString().slice(0, 10);
    if (editing) {
      void persist(tools.map((tool) => tool.id === editing.id ? { ...tool, ...draft, id: uniqueId(draft.name, tools, editing.id), dateUpdated: today } : tool));
    } else {
      void persist([...tools, { ...draft, id: uniqueId(draft.name, tools), dateAdded: today, dateUpdated: today }]);
    }
    setEditing(undefined);
  }

  function deleteTool(tool: Tool) {
    if (window.confirm(`Delete “${tool.name}”?\n\nThe JSON file will be updated immediately.`)) {
      void persist(tools.filter((item) => item.id !== tool.id));
    }
  }

  function exportJson() {
    const blob = new Blob([`${JSON.stringify(tools, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "tools-backup.json";
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
        if (window.confirm(`Replace the current list with ${parsed.length} imported tools?`)) void persist(parsed);
      } catch {
        window.alert("That file is not a valid tools JSON backup.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="tools-page">
      <header className="site-header">
        <div>
          <p className="eyebrow">Personal directory</p>
          <h1>Websites, apps & tools</h1>
          <p className="intro">Things I use, things I am testing, and things worth remembering.</p>
        </div>
        <div className="header-actions">
          {editable ? <>
            <span className={`save-state ${saveState}`}>{saveState === "saving" ? "Saving…" : saveState === "error" ? "Save error" : "Saved to tools.json"}</span>
            <button className="button primary" onClick={() => setEditing(null)}>+ Add tool</button>
            <button className="button secondary" onClick={exportJson}>Export</button>
            <button className="button secondary" onClick={() => importInput.current?.click()}>Import</button>
            <input ref={importInput} hidden type="file" accept="application/json" onChange={(event) => importJson(event.target.files?.[0])} />
          </> : null}
        </div>
      </header>

      {editable && <aside className="local-notice"><strong>Local editing mode.</strong> Add, edit, and delete actions write directly to <code>src/data/tools.json</code>. Commit and push that file to publish your updates.</aside>}

      <main>
        <section className="filters" aria-label="Tool filters">
          <label className="search-field">Search<input type="search" placeholder="Search names, notes, categories, tags…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <label>Status<select value={status} onChange={(e) => setStatus(e.target.value)}>{statuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Type<select value={type} onChange={(e) => setType(e.target.value)}>{types.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="checkbox-row"><input type="checkbox" checked={favouritesOnly} onChange={(e) => setFavouritesOnly(e.target.checked)} /> Favourites only</label>
        </section>

        <div className="results-line"><strong>{filtered.length}</strong> of {tools.length} tools</div>
        {filtered.length > 0 ? <section className="tool-grid">{filtered.map((tool) => <ToolCard key={tool.id} tool={tool} editable={editable} onEdit={(item) => setEditing(item)} onDelete={deleteTool} />)}</section> : <section className="empty-state"><h2>No matching tools</h2><p>Try clearing one of the filters or add a new item.</p></section>}
      </main>

      <footer className="site-footer">Last published data is stored with this website.</footer>
      {editing !== undefined && <ToolForm tool={editing} onSave={saveTool} onCancel={() => setEditing(undefined)} />}
    </div>
  );
}
