"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DocumentShelf } from "@/components/DocumentShelf";
import { EditorCanvas } from "@/components/EditorCanvas";
import { ExportPanel } from "@/components/ExportPanel";
import { FormattingToolbar } from "@/components/FormattingToolbar";
import { StatsPanel } from "@/components/StatsPanel";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { computeMetrics, generateTitleFromContent } from "@/lib/editorUtils";

type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  titleLocked: boolean;
};

const STORAGE_KEY = "qc-documents-v1";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Untitled document");
  const [content, setContent] = useState<string>("");
  const [titleLocked, setTitleLocked] = useState<boolean>(false);
  const [initialized, setInitialized] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const debouncedContent = useDebouncedValue(content, 600);
  const debouncedTitle = useDebouncedValue(title, 400);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as DocumentRecord[];
        if (Array.isArray(stored) && stored.length > 0) {
          const sorted = stored.sort((a, b) => b.updatedAt - a.updatedAt);
          setDocuments(sorted);
          setCurrentId(sorted[0].id);
          setTitle(sorted[0].title);
          setContent(sorted[0].content);
          setTitleLocked(sorted[0].titleLocked ?? false);
        } else {
          startFreshDocument();
        }
      } else {
        startFreshDocument();
      }
    } catch {
      startFreshDocument();
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents, initialized]);

  useEffect(() => {
    if (!initialized) return;
    persistCurrentDocument(debouncedContent, debouncedTitle, titleLocked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent, debouncedTitle, titleLocked, currentId, initialized]);

  const metrics = useMemo(() => computeMetrics(content), [content]);

  const handleContentChange = (next: string) => {
    setContent(next);
    if (!titleLocked) {
      const auto = generateTitleFromContent(next);
      if (auto && auto !== title) {
        setTitle(auto);
      }
    }
  };

  const handleTitleInput = (next: string) => {
    setTitle(next);
    setTitleLocked(true);
  };

  const handleResetTitle = () => {
    const auto = generateTitleFromContent(content);
    setTitle(auto);
    setTitleLocked(false);
  };

  const handleNewDocument = () => {
    persistCurrentDocument(content, title, titleLocked);
    startFreshDocument();
    requestAnimationFrame(() => editorRef.current?.focus());
  };

  const handleSnapshot = () => {
    if (!currentId) return;
    const snapshotId = makeId();
    const now = Date.now();
    const snapshot: DocumentRecord = {
      id: snapshotId,
      title: `${title} (snapshot)`,
      content,
      updatedAt: now,
      titleLocked: true
    };
    setDocuments((prev) => [snapshot, ...prev]);
  };

  const handleSelectDocument = (id: string) => {
    if (currentId === id) return;
    persistCurrentDocument(content, title, titleLocked);
    const doc = documents.find((item) => item.id === id);
    if (!doc) return;
    setCurrentId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
    setTitleLocked(doc.titleLocked ?? false);
    requestAnimationFrame(() => editorRef.current?.focus());
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((doc) => doc.id !== id);
      if (currentId === id) {
        if (filtered.length > 0) {
          const next = filtered[0];
          setCurrentId(next.id);
          setTitle(next.title);
          setContent(next.content);
          setTitleLocked(next.titleLocked ?? false);
        } else {
          startFreshDocument();
        }
      }
      return filtered;
    });
  };

  const handleDuplicateDocument = (id: string) => {
    const original = documents.find((doc) => doc.id === id);
    if (!original) return;
    const copy: DocumentRecord = {
      ...original,
      id: makeId(),
      title: `${original.title} (copy)`,
      updatedAt: Date.now(),
      titleLocked: true
    };
    setDocuments((prev) => [copy, ...prev]);
  };

  const persistCurrentDocument = (html: string, currentTitle: string, locked: boolean) => {
    if (!currentId) {
      const cleaned = stripHtml(html);
      const effectiveTitle =
        locked && currentTitle
          ? currentTitle
          : generateTitleFromContent(html) || (currentTitle?.trim() ? currentTitle : "Untitled document");

      if (!locked && !cleaned.trim() && effectiveTitle === "Untitled document") {
        return;
      }

      const id = makeId();
      setCurrentId(id);
      setDocuments((prev) => [
        {
          id,
          title: effectiveTitle,
          content: html,
          updatedAt: Date.now(),
          titleLocked: locked
        },
        ...prev
      ]);
      return;
    }

    setDocuments((prev) => {
      const index = prev.findIndex((doc) => doc.id === currentId);
      const resolvedTitle =
        locked && currentTitle
          ? currentTitle
          : generateTitleFromContent(html) || currentTitle || "Untitled document";

      if (index === -1) {
        if (!html && !resolvedTitle) return prev;
        return [
          {
            id: currentId,
            title: resolvedTitle,
            content: html,
            updatedAt: Date.now(),
            titleLocked: locked
          },
          ...prev
        ];
      }

      const existing = prev[index];
      if (existing.content === html && existing.title === resolvedTitle && existing.titleLocked === locked) {
        return prev;
      }

      const updated: DocumentRecord = {
        ...existing,
        title: resolvedTitle,
        content: html,
        updatedAt: Date.now(),
        titleLocked: locked
      };

      const next = [...prev];
      next.splice(index, 1);
      next.unshift(updated);
      return next;
    });
  };

  const startFreshDocument = () => {
    setCurrentId(null);
    setTitle("Untitled document");
    setContent("");
    setTitleLocked(false);
  };

  return (
    <div className="workspace">
      <div className="panel">
        <div className="panel-header">
          <div>
            <input
              className="textarea"
              style={{ minHeight: "auto", fontSize: "1.3rem", fontWeight: 600 }}
              value={title}
              onChange={(event) => handleTitleInput(event.target.value)}
              placeholder="Document title"
            />
          </div>
          <div className="action-row">
            <button type="button" className="secondary-btn" onClick={handleResetTitle}>
              Auto title
            </button>
            <button type="button" className="primary-btn" onClick={handleNewDocument}>
              New document
            </button>
          </div>
        </div>
        <div className="panel-body">
          <FormattingToolbar
            editorRef={editorRef}
            onContentSync={(html) => {
              setContent(html);
              persistCurrentDocument(html, title, titleLocked);
            }}
          />
          <EditorCanvas
            editorRef={editorRef}
            html={content}
            onInput={handleContentChange}
            placeholder="Start drafting your ideas here…"
          />
        </div>
      </div>

      <div className="workspace-sidebar">
        <StatsPanel
          words={metrics.words}
          characters={metrics.characters}
          sentences={metrics.sentences}
          paragraphs={metrics.paragraphs}
          readingTime={metrics.readingTime}
        />
        <ExportPanel html={content} onSnapshot={handleSnapshot} />
        <DocumentShelf
          documents={documents}
          currentId={currentId}
          onSelect={handleSelectDocument}
          onDelete={handleDeleteDocument}
          onDuplicate={handleDuplicateDocument}
        />
      </div>
    </div>
  );
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
