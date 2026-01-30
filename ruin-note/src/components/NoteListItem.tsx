import { List, ActionPanel, Action } from "@raycast/api";
import { useMemo } from "react";
import { readNoteContent } from "../lib/ruin";
import { parseNoteForDisplay } from "../lib/noteParser";
import type { Note } from "../lib/types";

export function NoteListItem({ note }: { note: Note }) {
  const { content, parsed } = useMemo(() => {
    try {
      const text = readNoteContent(note.path);
      return { content: text, parsed: parseNoteForDisplay(text) };
    } catch {
      return { content: null, parsed: null };
    }
  }, [note.path]);

  const displayTitle = parsed?.title || note.path.split("/").pop() || "Untitled";
  const subtitle = parsed?.subtitle || "";

  return (
    <List.Item
      key={note.uuid}
      title={displayTitle}
      subtitle={subtitle}
      detail={
        <List.Item.Detail
          markdown={parsed?.bodyContent || content || ""}
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
