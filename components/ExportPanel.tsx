"use client";

import { downloadHtmlFile, downloadTextFile, generateTitleFromContent, htmlToPlainText } from "@/lib/editorUtils";

type ExportPanelProps = {
  html: string;
  onSnapshot: () => void;
};

export function ExportPanel({ html, onSnapshot }: ExportPanelProps) {
  const filename = generateTitleFromContent(html).slice(0, 60).replace(/[^\w\d]+/g, "-");

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="panel-title">Export & backups</h3>
        <button className="secondary-btn" type="button" onClick={onSnapshot}>
          Save snapshot
        </button>
      </div>
      <div className="panel-body">
        <div className="export-options">
          <button
            type="button"
            className="primary-btn"
            onClick={() => downloadTextFile(`${filename}.txt`, htmlToPlainText(html))}
          >
            Download as .txt
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => downloadHtmlFile(`${filename}.html`, html)}
          >
            Download as .html
          </button>
        </div>
      </div>
    </div>
  );
}
