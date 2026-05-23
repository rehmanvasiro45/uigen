import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// --- getToolLabel unit tests ---

test("getToolLabel: str_replace_editor create", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating App.jsx");
});

test("getToolLabel: str_replace_editor str_replace", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.jsx" })).toBe("Editing Button.jsx");
});

test("getToolLabel: str_replace_editor insert", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/App.jsx" })).toBe("Editing App.jsx");
});

test("getToolLabel: str_replace_editor view", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Reverting App.jsx");
});

test("getToolLabel: str_replace_editor unknown command falls back to working on file", () => {
  expect(getToolLabel("str_replace_editor", { command: "unknown", path: "/App.jsx" })).toBe("Working on App.jsx");
});

test("getToolLabel: str_replace_editor missing path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe("Creating file");
});

test("getToolLabel: file_manager rename", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/Old.jsx", new_path: "/New.jsx" })).toBe("Renaming Old.jsx to New.jsx");
});

test("getToolLabel: file_manager delete", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting App.jsx");
});

test("getToolLabel: file_manager rename missing new_path", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/App.jsx" })).toBe("Renaming file");
});

test("getToolLabel: unknown tool falls back to tool name", () => {
  expect(getToolLabel("some_other_tool", { command: "do_thing" })).toBe("some_other_tool");
});

test("getToolLabel: partial args during streaming", () => {
  expect(getToolLabel("str_replace_editor", {})).toBe("Working on file");
});

// --- ToolInvocationBadge render tests ---

test("shows spinner and label while in-progress", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="call"
      args={{ command: "create", path: "/App.jsx" }}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  // spinner present (lucide renders an svg)
  const svg = document.querySelector("svg");
  expect(svg).not.toBeNull();
});

test("shows green dot and label when done", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
      result="ok"
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
  const dot = document.querySelector(".bg-emerald-500");
  expect(dot).not.toBeNull();
});

test("shows spinner when state is result but result is null", () => {
  render(
    <ToolInvocationBadge
      toolName="str_replace_editor"
      state="result"
      args={{ command: "create", path: "/App.jsx" }}
      result={null}
    />
  );
  const dot = document.querySelector(".bg-emerald-500");
  expect(dot).toBeNull();
  const svg = document.querySelector("svg");
  expect(svg).not.toBeNull();
});

test("shows file_manager rename label", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      state="call"
      args={{ command: "rename", path: "/Old.jsx", new_path: "/New.jsx" }}
    />
  );
  expect(screen.getByText("Renaming Old.jsx to New.jsx")).toBeDefined();
});

test("shows file_manager delete label", () => {
  render(
    <ToolInvocationBadge
      toolName="file_manager"
      state="result"
      args={{ command: "delete", path: "/Unused.jsx" }}
      result="ok"
    />
  );
  expect(screen.getByText("Deleting Unused.jsx")).toBeDefined();
});
