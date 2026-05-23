"use client";

import { Loader2 } from "lucide-react";

type ToolInvocationState = "partial-call" | "call" | "result";

interface ToolInvocationBadgeProps {
  toolName: string;
  state: ToolInvocationState;
  args: Record<string, unknown>;
  result?: unknown;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? path;
}

export function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : null;
  const command = typeof args.command === "string" ? args.command : null;
  const filename = path ? basename(path) : null;

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
      case "undo_edit":
        return filename ? `Reverting ${filename}` : "Reverting file";
      default:
        return filename ? `Working on ${filename}` : "Working on file";
    }
  }

  if (toolName === "file_manager") {
    const newPath = typeof args.new_path === "string" ? args.new_path : null;
    const newFilename = newPath ? basename(newPath) : null;
    switch (command) {
      case "rename":
        return filename && newFilename
          ? `Renaming ${filename} to ${newFilename}`
          : "Renaming file";
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
      default:
        return "Managing files";
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolName, state, args, result }: ToolInvocationBadgeProps) {
  const label = getToolLabel(toolName, args);
  const isDone = state === "result" && result != null;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
