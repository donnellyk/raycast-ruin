import { List, ActionPanel, Action } from "@raycast/api";
import { useState, useEffect } from "react";
import { readNoteContent, parseNoteContent, stripMarkdown } from "../lib/ruin";
import type { Note } from "../lib/types";

function useNoteContent(path: string) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const text = readNoteContent(path);
      setContent(text);
    } catch {
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  return { content, isLoading };
}

export function NoteListItem({ note }: { note: Note }) {
  const { content, isLoading } = useNoteContent(note.path);

  const parsed = content ? parseNoteContent(content) : null;
  const displayTitle = parsed?.h1Title || note.title || note.path.split("/").pop() || "Untitled";
  const subtitle = content ? stripMarkdown(content) : "";

  return (
    <List.Item
      key={note.uuid}
      title={displayTitle}
      subtitle={subtitle}
      detail={
        <List.Item.Detail
          isLoading={isLoading}
          markdown={parsed?.content || content || ""}
          metadata={
            <List.Item.Detail.Metadata>
              {parsed &&
                Object.entries(parsed.frontmatter)
                  .filter(([key]) => key !== "tags" && key !== "inline-tags")
                  .map(([key, value]) => <List.Item.Detail.Metadata.Label key={key} title={key} text={value} />)}
              {parsed && Object.keys(parsed.frontmatter).length > 0 && <List.Item.Detail.Metadata.Separator />}
              <List.Item.Detail.Metadata.Label title="Path" text={note.path} />
              {note.tags && note.tags.length > 0 && (
                <List.Item.Detail.Metadata.TagList title="Tags">
                  {note.tags.map((tag) => (
                    <List.Item.Detail.Metadata.TagList.Item key={tag} text={tag} />
                  ))}
                </List.Item.Detail.Metadata.TagList>
              )}
            </List.Item.Detail.Metadata>
          }
        />
      }
      actions={
        <ActionPanel>
          <Action.Open title="Open in Editor" target={note.path} />
          <Action.ShowInFinder path={note.path} />
          <Action.CopyToClipboard title="Copy Path" content={note.path} />
        </ActionPanel>
      }
    />
  );
}
