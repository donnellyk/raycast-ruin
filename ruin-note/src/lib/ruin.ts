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
