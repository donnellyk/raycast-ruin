import { List, ActionPanel, Action, Detail, Icon, showToast, Toast, launchCommand, LaunchType } from "@raycast/api";
import { useState, useEffect } from "react";
import { getTodayNotes, readNoteContent } from "./lib/ruin";
import type { Note } from "./lib/types";

function NoteDetail({ note }: { note: Note }) {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const text = readNoteContent(note.path);
      setContent(text);
    } catch {
      setContent("Failed to load note content");
    } finally {
      setIsLoading(false);
    }
  }, [note.path]);

  return (
    <Detail
      isLoading={isLoading}
      markdown={content}
      navigationTitle={note.title || "Note"}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Path" text={note.path} />
          <Detail.Metadata.Label title="UUID" text={note.uuid} />
          {note.tags.length > 0 && (
            <Detail.Metadata.TagList title="Tags">
              {note.tags.map((tag) => (
                <Detail.Metadata.TagList.Item key={tag} text={tag} />
              ))}
            </Detail.Metadata.TagList>
          )}
        </Detail.Metadata>
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

export default function Command() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const results = getTodayNotes();
      setNotes(results);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load today's notes",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter today's notes...">
      {notes.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No Notes Today"
          description="Create your first note of the day"
          icon={Icon.Calendar}
          actions={
            <ActionPanel>
              <Action
                title="Capture Note"
                icon={Icon.Plus}
                onAction={() => launchCommand({ name: "capture-note", type: LaunchType.UserInitiated })}
              />
            </ActionPanel>
          }
        />
      ) : (
        notes.map((note) => (
          <List.Item
            key={note.uuid}
            title={note.title || note.path.split("/").pop() || "Untitled"}
            subtitle={note.path}
            accessories={note.tags.map((tag) => ({ tag }))}
            actions={
              <ActionPanel>
                <Action.Push title="View Note" icon={Icon.Eye} target={<NoteDetail note={note} />} />
                <Action.Open title="Open in Editor" target={note.path} />
                <Action.ShowInFinder path={note.path} />
                <Action.CopyToClipboard title="Copy Path" content={note.path} />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
