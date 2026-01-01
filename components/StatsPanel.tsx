"use client";

type StatsPanelProps = {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
};

export function StatsPanel({ words, characters, sentences, paragraphs, readingTime }: StatsPanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Document metrics</h3>
        <span className="badge">Live</span>
      </div>
      <div className="panel-body">
        <div className="stats-grid">
          <StatCard label="Word count" value={words.toLocaleString()} />
          <StatCard label="Characters" value={characters.toLocaleString()} />
          <StatCard label="Sentences" value={sentences.toLocaleString()} />
          <StatCard label="Paragraphs" value={paragraphs.toLocaleString()} />
        </div>
        <div className="stat-card">
          <span className="stat-label">Estimated reading time</span>
          <span className="stat-value">{readingTime}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}
