"use client";

import { useEffect, useRef } from "react";

type EditorCanvasProps = {
  html: string;
  placeholder?: string;
  editorRef: React.RefObject<HTMLDivElement>;
  onInput: (html: string) => void;
};

export function EditorCanvas({ html, placeholder, editorRef, onInput }: EditorCanvasProps) {
  const lastHtml = useRef<string>(html);

  useEffect(() => {
    if (!editorRef.current) return;
    if (html !== lastHtml.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
      lastHtml.current = html;
    }
  }, [html, editorRef]);

  useEffect(() => {
    if (!editorRef.current || lastHtml.current) return;
    if (placeholder) {
      editorRef.current.dataset.placeholder = placeholder;
    }
  }, [placeholder, editorRef]);

  useEffect(() => {
    const target = editorRef.current;
    if (!target) return;

    const handleInput = () => {
      const next = target.innerHTML;
      lastHtml.current = next;
      onInput(next);
    };

    const handlePaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const text = event.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };

    target.addEventListener("input", handleInput);
    target.addEventListener("blur", handleInput);
    target.addEventListener("paste", handlePaste);

    return () => {
      target.removeEventListener("input", handleInput);
      target.removeEventListener("blur", handleInput);
      target.removeEventListener("paste", handlePaste);
    };
  }, [editorRef, onInput]);

  return (
    <div
      ref={editorRef}
      className="editor-area"
      contentEditable
      aria-label="Document editor"
      spellCheck={true}
      suppressContentEditableWarning
      data-placeholder={placeholder}
    />
  );
}
