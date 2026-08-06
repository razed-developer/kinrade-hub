import type { TrackedRepository } from "../types/repository";
import { formatCount } from "../utils/repositoryHelpers";

interface Props {
  item: TrackedRepository;
  editable: boolean;
  onEdit: (item: TrackedRepository) => void;
  onDelete: (item: TrackedRepository) => void;
}

export function RepositoryCard({ item, editable, onEdit, onDelete }: Props) {
  return (
    <article className="repository-card">
      <div className="repository-topline">
        <span className="repository-path">{item.owner}/{item.repository}</span>
        {item.favourite && <span className="repository-favourite" title="Favourite" aria-label="Favourite">★</span>}
      </div>
      <h2>{item.name}</h2>
      <p className="repository-description">{item.description || "No description saved."}</p>

      <div className="repository-metadata">
        <span>{item.status}</span>
        {item.language && <span>{item.language}</span>}
        {item.license && <span>{item.license}</span>}
        {item.stars !== null && <span>★ {formatCount(item.stars)}</span>}
        {item.forks !== null && <span>⑂ {formatCount(item.forks)}</span>}
      </div>

      {item.categories.length > 0 && <div className="repository-tags">{item.categories.map((category) => <span key={category}>{category}</span>)}</div>}
      {item.reasonForFollowing && <p className="repository-note"><strong>Why:</strong> {item.reasonForFollowing}</p>}
      {item.possibleUse && <p className="repository-note"><strong>Possible use:</strong> {item.possibleUse}</p>}
      {item.notes && <p className="repository-notes">{item.notes}</p>}

      <div className="repository-actions">
        <a className="repository-button primary" href={item.url} target="_blank" rel="noreferrer">Repository</a>
        {item.homepage && <a className="repository-button secondary" href={item.homepage} target="_blank" rel="noreferrer">Website</a>}
        {editable && <>
          <button className="repository-button secondary" type="button" onClick={() => onEdit(item)}>Edit</button>
          <button className="repository-button danger" type="button" onClick={() => onDelete(item)}>Delete</button>
        </>}
      </div>
    </article>
  );
}
