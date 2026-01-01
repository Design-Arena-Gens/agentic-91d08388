"use client";

import { useEffect, useMemo, useState } from "react";

type Command =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "justifyFull"
  | "removeFormat"
  | "insertHorizontalRule"
  | "createLink"
  | "code"
  | "backColor";

type ButtonConfig = {
  label: string;
  command: Command;
  value?: string;
  shortcut?: string;
  icon?: string;
};

const toolbarGroups: ButtonConfig[][] = [
  [
    { label: "Bold", command: "bold", shortcut: "⌘/Ctrl+B", icon: "B" },
    { label: "Italic", command: "italic", shortcut: "⌘/Ctrl+I", icon: "I" },
    { label: "Underline", command: "underline", shortcut: "⌘/Ctrl+U", icon: "U" },
    { label: "Strike", command: "strikeThrough", icon: "S" }
  ],
  [
    { label: "Paragraph", command: "formatBlock", value: "p", icon: "¶" },
    { label: "Heading 1", command: "formatBlock", value: "h1", icon: "H1" },
    { label: "Heading 2", command: "formatBlock", value: "h2", icon: "H2" },
    { label: "Code", command: "code", icon: "</>" }
  ],
  [
    { label: "Bulleted list", command: "insertUnorderedList", icon: "•" },
    { label: "Numbered list", command: "insertOrderedList", icon: "1." },
    { label: "Divider", command: "insertHorizontalRule", icon: "─" }
  ],
  [
    { label: "Align left", command: "justifyLeft", icon: "⭠" },
    { label: "Align center", command: "justifyCenter", icon: "⇔" },
    { label: "Align right", command: "justifyRight", icon: "⭢" },
    { label: "Justify", command: "justifyFull", icon: "≋" }
  ],
  [
    { label: "Highlight", command: "backColor", value: "#fff3a3", icon: "🖍️" },
    { label: "Link", command: "createLink", icon: "🔗" },
    { label: "Clear", command: "removeFormat", icon: "⟲" }
  ]
];

type FormattingToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement>;
  onContentSync: (html: string) => void;
};

export function FormattingToolbar({ editorRef, onContentSync }: FormattingToolbarProps) {
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>({});

  const monitoredCommands = useMemo(
    () => [
      "bold",
      "italic",
      "underline",
      "strikeThrough",
      "insertUnorderedList",
      "insertOrderedList",
      "justifyLeft",
      "justifyCenter",
      "justifyRight",
      "justifyFull"
    ],
    []
  );

  useEffect(() => {
    const updateState = () => {
      if (!editorRef.current) return;
      const next: Record<string, boolean> = {};
      monitoredCommands.forEach((command) => {
        try {
          next[command] = document.queryCommandState(command);
        } catch {
          next[command] = false;
        }
      });
      setActiveStates(next);
    };

    document.addEventListener("selectionchange", updateState);
    return () => document.removeEventListener("selectionchange", updateState);
  }, [editorRef, monitoredCommands]);

  const execCommand = async (button: ButtonConfig) => {
    const target = editorRef.current;
    if (!target) return;
    target.focus();

    if (button.command === "createLink") {
      const url = prompt("Enter URL");
      if (!url) return;
      document.execCommand("createLink", false, url);
      onContentSync(target.innerHTML);
      return;
    }

    if (button.command === "code") {
      document.execCommand("formatBlock", false, "pre");
      onContentSync(target.innerHTML);
      return;
    }

    try {
      document.execCommand(button.command, false, button.value ?? "");
      onContentSync(target.innerHTML);
    } catch {
      // ignore unsupported commands
    }
  };

  return (
    <div className="toolbar">
      {toolbarGroups.map((group, index) => (
        <div key={index} className="toolbar-group">
          {group.map((button) => (
            <button
              key={button.label}
              type="button"
              className={`toolbar-button ${activeStates[button.command] ? "active" : ""}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => execCommand(button)}
              title={button.shortcut ? `${button.label} (${button.shortcut})` : button.label}
            >
              {button.icon ?? button.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
