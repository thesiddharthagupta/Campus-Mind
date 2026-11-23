import { Bookmark, FileText } from 'lucide-react';
import type { Material } from '../../../shared/types/common';

type MaterialCardProps = {
  material: Material;
  onBookmark: (id: string) => void;
  onOpen: (storagePath?: string) => void;
};

export function MaterialCard({ material, onBookmark, onOpen }: MaterialCardProps) {
  return (
    <article className="material-card">
      <div className={`material-cover ${material.color}`}>
        <div className="cover-decoration" />
        <span className="cover-type">{material.kind}</span>
        <FileText size={31} />
        <button
          className={`bookmark-control ${material.bookmarked ? 'saved' : ''}`}
          aria-label={material.bookmarked ? 'Remove bookmark' : 'Bookmark material'}
          onClick={() => onBookmark(material.id)}
        >
          <Bookmark size={16} fill={material.bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="material-copy">
        <span className="material-subject">{material.subject}</span>
        <h3>{material.title}</h3>
        <p>{material.description}</p>
        <div className="material-meta">
          <span>{material.author}</span>
          <span>{material.pages} pages · {material.size}</span>
        </div>
        {material.storagePath && (
          <button className="material-open-button" onClick={() => onOpen(material.storagePath)}>
            Open file ↗
          </button>
        )}
      </div>
    </article>
  );
}
