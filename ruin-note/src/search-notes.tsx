import { List, ActionPanel, Action, Detail, Icon, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import { searchNotes, readNoteContent } from "./lib/ruin";
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
          {note.tags && note.tags.length > 0 && (
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
  const [searchText, setSearchText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!searchText.trim()) {
      setNotes([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = searchNotes(searchText);
      setNotes(results);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchText]);

  return (
    <List
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search notes (#tag, text, created:today...)"
      throttle
    >
      {notes.length === 0 && searchText.trim() ? (
        <List.EmptyView title="No Results" description="Try a different search query" icon={Icon.MagnifyingGlass} />
      ) : notes.length === 0 ? (
        <List.EmptyView
          title="Search Notes"
          description="Enter a query to search (e.g., #tag, text, created:today)"
          icon={Icon.Document}
        />
      ) : (
        notes.map((note) => (
          <List.Item
            key={note.uuid}
            title={note.title || note.path.split("/").pop() || "Untitled"}
            subtitle={note.path}
            accessories={(note.tags || []).map((tag) => ({ tag }))}
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
