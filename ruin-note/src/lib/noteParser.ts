/**
 * Parse note content and extract title/subtitle for list display.
 *
 * Title: First line of document (after frontmatter), stripped of markdown
 * Subtitle: Remaining lines, stripped of markdown, joined with spaces
 */

export interface ParsedNoteDisplay {
  title: string;
  subtitle: string;
  frontmatter: Record<string, string>;
  bodyContent: string;
}

/**
 * Remove YAML frontmatter from content.
 * Frontmatter is delimited by --- at start and end.
 */
export function removeFrontmatter(raw: string): { content: string; frontmatter: Record<string, string> } {
  const frontmatter: Record<string, string> = {};

  // Match frontmatter block: starts with ---, ends with ---
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { content: raw, frontmatter };
  }

  const yamlContent = match[1];
  const content = raw.slice(match[0].length);

  // Parse simple key: value pairs from YAML
  for (const line of yamlContent.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      if (key && value) {
        frontmatter[key] = value;
      }
    }
  }

  return { content, frontmatter };
}

/**
 * Strip markdown formatting from a single line of text.
 */
export function stripMarkdownLine(line: string): string {
  return (
    line
      // Remove header markers (# ## ### etc)
      .replace(/^#+\s+/, "")
      // Remove bold **text** or __text__
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      // Remove italic *text* or _text_
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/(?<![a-zA-Z])_([^_]+)_(?![a-zA-Z])/g, "$1")
      // Remove inline code `code`
      .replace(/`([^`]+)`/g, "$1")
      // Remove images ![alt](url) - must be before links
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // Remove links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove blockquote markers
      .replace(/^>\s*/, "")
      // Remove list markers (-, *, +, 1.)
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      // Trim whitespace
      .trim()
  );
}

/**
 * Parse note content into title and subtitle for display.
 */
export function parseNoteForDisplay(raw: string): ParsedNoteDisplay {
  const { content, frontmatter } = removeFrontmatter(raw);

  // Split into lines and filter empty ones
  const lines = content.split(/\r?\n/);

  // Find first non-empty line for title
  let titleLineIndex = -1;
  let title = "";
  for (let i = 0; i < lines.length; i++) {
    const stripped = stripMarkdownLine(lines[i]);
    if (stripped) {
      title = stripped;
      titleLineIndex = i;
      break;
    }
  }

  // Subtitle is remaining lines joined
  let subtitle = "";
  if (titleLineIndex >= 0) {
    const remainingLines = lines.slice(titleLineIndex + 1);
    const strippedLines = remainingLines.map((line) => stripMarkdownLine(line)).filter((line) => line.length > 0);
    subtitle = strippedLines.join(" ");
  }

  return {
    title,
    subtitle,
    frontmatter,
    bodyContent: content,
  };
}
