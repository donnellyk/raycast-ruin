import {
  List,
  ActionPanel,
  Action,
  Detail,
  Icon,
  showToast,
  Toast,
  confirmAlert,
  Alert,
  launchCommand,
  LaunchType,
} from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import { listQueries, runQuery, deleteQuery, readNoteContent } from "./lib/ruin";
import type { SavedQuery, Note } from "./lib/types";

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

function QueryResults({ query }: { query: SavedQuery }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const results = runQuery(query.name);
      setNotes(results);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Query failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [query.name]);

  return (
    <List isLoading={isLoading} navigationTitle={`Results: ${query.name}`}>
      {notes.length === 0 && !isLoading ? (
        <List.EmptyView title="No Results" description={`Query: ${query.query}`} icon={Icon.MagnifyingGlass} />
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

export default function Command() {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadQueries = useCallback(() => {
    setIsLoading(true);
    try {
      const result = listQueries();
      setQueries(result);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load queries",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  async function handleDelete(query: SavedQuery) {
    const confirmed = await confirmAlert({
      title: `Delete "${query.name}"?`,
      message: `Query: ${query.query}`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        deleteQuery(query.name);
        await showToast({ style: Toast.Style.Success, title: `Deleted ${query.name}` });
        loadQueries();
      } catch (error) {
        await showToast({
          style: Toast.Style.Failure,
          title: "Delete failed",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter saved queries...">
      {queries.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No Saved Queries"
          description="Save queries using the ruin CLI: ruin query save <name> <query>"
          icon={Icon.Bookmark}
          actions={
            <ActionPanel>
              <Action
                title="Search Notes"
                icon={Icon.MagnifyingGlass}
                onAction={() => launchCommand({ name: "search-notes", type: LaunchType.UserInitiated })}
              />
            </ActionPanel>
          }
        />
      ) : (
        queries.map((query) => (
          <List.Item
            key={query.name}
            title={query.name}
            subtitle={query.query}
            icon={Icon.Bookmark}
            actions={
              <ActionPanel>
                <Action.Push title="Run Query" icon={Icon.Play} target={<QueryResults query={query} />} />
                <Action
                  title="Delete Query"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => handleDelete(query)}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                />
                <Action.CopyToClipboard
                  title="Copy Query"
                  content={query.query}
                  shortcut={{ modifiers: ["cmd"], key: "c" }}
                />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
