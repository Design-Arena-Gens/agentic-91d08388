"use client";

type DocumentShelfProps = {
  documents: {
    id: string;
    title: string;
    updatedAt: number;
    content: string;
    titleLocked: boolean;
  }[];
  currentId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
};

export function DocumentShelf({ documents, currentId, onSelect, onDelete, onDuplicate }: DocumentShelfProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Documents</h3>
        <span className="badge">{documents.length} saved</span>
      </div>
      <div className="panel-body">
        {documents.length === 0 ? (
          <div className="empty-state">
            Your documents will show up here once you autosave or manually save a draft.
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc) => (
              <article
                key={doc.id}
                className="document-card"
                onClick={() => onSelect(doc.id)}
                data-active={doc.id === currentId}
              >
                <div className="flex-between">
                  <h4>{doc.title}</h4>
                  <time className="document-meta">{relativeTime(doc.updatedAt)}</time>
                </div>
                <p className="document-meta">{preview(doc.content)}</p>
                <div className="action-row" style={{ marginTop: "0.7rem" }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDuplicate(doc.id);
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(doc.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function preview(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "Empty document";
  return text.length > 80 ? `${text.slice(0, 77)}…` : text;
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} wk${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} yr${years > 1 ? "s" : ""} ago`;
}
