import type { Tool } from "../types/tool";

interface ToolCardProps {
  tool: Tool;
  editable: boolean;
  onEdit: (tool: Tool) => void;
  onDelete: (tool: Tool) => void;
}

export function ToolCard({ tool, editable, onEdit, onDelete }: ToolCardProps) {
  return (
    <article className="tool-card">
      <div className="card-topline">
        <span className="type-label">{tool.type}</span>
        {tool.favourite && <span className="favourite" title="Favourite">★</span>}
      </div>
      <h2>{tool.name}</h2>
      <p className="description">{tool.description}</p>
      <div className="metadata">
        <span>{tool.status}</span>
        <span>{tool.pricing}</span>
        {tool.platforms.slice(0, 2).map((platform) => <span key={platform}>{platform}</span>)}
      </div>
      {tool.categories.length > 0 && <div className="tag-row">{tool.categories.map((category) => <span key={category}>#{category}</span>)}</div>}
      {tool.notes && <p className="notes">{tool.notes}</p>}
      <footer className="card-actions">
        <a className="button primary" href={tool.url} target="_blank" rel="noreferrer">Open site ↗</a>
        {editable && <>
          <button className="button secondary" onClick={() => onEdit(tool)}>Edit</button>
          <button className="button danger" onClick={() => onDelete(tool)}>Delete</button>
        </>}
      </footer>
    </article>
  );
}
