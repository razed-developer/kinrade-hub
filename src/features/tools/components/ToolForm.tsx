import { useEffect, useState, type FormEvent } from "react";
import { pricingOptions, toolStatuses, toolTypes, type Tool, type ToolDraft } from "../types/tool";
import { emptyDraft, splitList } from "../utils/toolHelpers";

interface ToolFormProps {
  tool: Tool | null;
  onSave: (draft: ToolDraft) => void;
  onCancel: () => void;
}

export function ToolForm({ tool, onSave, onCancel }: ToolFormProps) {
  const [draft, setDraft] = useState<ToolDraft>(emptyDraft);
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");
  const [platforms, setPlatforms] = useState("");

  useEffect(() => {
    const next = tool
      ? {
          name: tool.name,
          description: tool.description,
          url: tool.url,
          type: tool.type,
          status: tool.status,
          categories: tool.categories,
          tags: tool.tags,
          platforms: tool.platforms,
          pricing: tool.pricing,
          notes: tool.notes,
          favourite: tool.favourite
        }
      : emptyDraft;
    setDraft(next);
    setCategories(next.categories.join(", "));
    setTags(next.tags.join(", "));
    setPlatforms(next.platforms.join(", "));
  }, [tool]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      url: draft.url.trim(),
      notes: draft.notes.trim(),
      categories: splitList(categories),
      tags: splitList(tags),
      platforms: splitList(platforms)
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section className="editor-panel" role="dialog" aria-modal="true" aria-labelledby="editor-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="editor-header">
          <div>
            <p className="eyebrow">Local editor</p>
            <h2 id="editor-title">{tool ? `Edit ${tool.name}` : "Add a tool"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close editor">×</button>
        </header>

        <form onSubmit={submit} className="tool-form">
          <label>Name<input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
          <label>Website address<input required type="url" placeholder="https://example.com" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} /></label>
          <label className="wide">Description<textarea required rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>

          <label>Type<select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as ToolDraft["type"] })}>{toolTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ToolDraft["status"] })}>{toolStatuses.map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Pricing<select value={draft.pricing} onChange={(e) => setDraft({ ...draft, pricing: e.target.value as ToolDraft["pricing"] })}>{pricingOptions.map((value) => <option key={value}>{value}</option>)}</select></label>

          <label className="wide">Categories <span>comma separated</span><input value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="Development, Productivity" /></label>
          <label className="wide">Tags <span>comma separated</span><input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="markdown, self-hosted" /></label>
          <label className="wide">Platforms <span>comma separated</span><input value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Windows, Linux, Web" /></label>
          <label className="wide">Personal notes<textarea rows={4} value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /></label>

          <label className="checkbox-row wide"><input type="checkbox" checked={draft.favourite} onChange={(e) => setDraft({ ...draft, favourite: e.target.checked })} /> Mark as a favourite</label>

          <footer className="form-actions wide">
            <button type="button" className="button secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="button primary">{tool ? "Save changes" : "Add tool"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
