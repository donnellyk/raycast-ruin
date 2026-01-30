import { execSync } from "child_process";
import { readFileSync } from "fs";
import type { Note, Tag, SavedQuery, LogResult } from "./types";

const RUIN_PATH = "/Users/kevin/go/bin/ruin";

function exec(args: string[]): string {
  const result = execSync(`${RUIN_PATH} ${args.join(" ")}`, {
    encoding: "utf-8",
    maxBuffer: 10 * 1024 * 1024,
  });
  return result;
}

export function searchNotes(query: string): Note[] {
  if (!query.trim()) return [];
  const output = exec(["search", JSON.stringify(query), "--json"]);
  return JSON.parse(output) as Note[];
}

export function getTodayNotes(): Note[] {
  const output = exec(["today", "--json"]);
  return JSON.parse(output) as Note[];
}

export function listTags(): Tag[] {
  const output = exec(["tags", "list", "--json"]);
  return JSON.parse(output) as Tag[];
}

export function renameTag(oldName: string, newName: string): void {
  exec(["tags", "rename", JSON.stringify(oldName), JSON.stringify(newName), "--force"]);
}

export function deleteTag(name: string): void {
  exec(["tags", "delete", JSON.stringify(name), "--force"]);
}

export function listQueries(): SavedQuery[] {
  const output = exec(["query", "list", "--json"]);
  const result = JSON.parse(output);
  return Array.isArray(result) ? result : [];
}

export function runQuery(name: string): Note[] {
  const output = exec(["query", "run", name, "--json"]);
  return JSON.parse(output) as Note[];
}

export function deleteQuery(name: string): void {
  exec(["query", "delete", name, "--force"]);
}

export function createNote(content: string): LogResult {
  const output = execSync(`${RUIN_PATH} log --stdin --json`, {
    encoding: "utf-8",
    input: content,
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(output) as LogResult;
}

export function readNoteContent(path: string): string {
  return readFileSync(path, "utf-8");
}

export interface ParsedNote {
  frontmatter: Record<string, string>;
  content: string;
  h1Title: string | null;
}

export function parseNoteContent(raw: string): ParsedNote {
  const frontmatter: Record<string, string> = {};
  let content = raw;

  // Extract frontmatter if present
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (frontmatterMatch) {
    content = raw.slice(frontmatterMatch[0].length);
    const yamlLines = frontmatterMatch[1].split("\n");
    for (const line of yamlLines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        frontmatter[key] = value;
      }
    }
  }

  // Extract H1 title
  const h1Match = content.match(/^#\s+(.+)$/m);
  const h1Title = h1Match ? h1Match[1].trim() : null;

  return { frontmatter, content, h1Title };
}

export function stripMarkdown(text: string): string {
  return (
    text
      // Remove frontmatter
      .replace(/^---\n[\s\S]*?\n---\n?/, "")
      // Remove headers
      .replace(/^#+\s+/gm, "")
      // Remove bold/italic
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/_([^_]+)_/g, "$1")
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove list markers
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, "")
      // Collapse newlines and whitespace
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}
