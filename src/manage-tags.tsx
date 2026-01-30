import {
  List,
  ActionPanel,
  Action,
  Form,
  Icon,
  showToast,
  Toast,
  useNavigation,
  confirmAlert,
  Alert,
} from "@raycast/api";
import { useState, useEffect, useCallback } from "react";
import { listTags, renameTag, deleteTag, searchNotes } from "./lib/ruin";
import type { Tag, Note } from "./lib/types";

type SortOrder = "count" | "name";

function RenameTagForm({ tag, onRenamed }: { tag: Tag; onRenamed: () => void }) {
  const { pop } = useNavigation();
  const [newName, setNewName] = useState(tag.Name);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!newName.trim() || newName === tag.Name) {
      await showToast({ style: Toast.Style.Failure, title: "Enter a new tag name" });
      return;
    }

    setIsLoading(true);
    try {
      renameTag(tag.Name, newName);
      await showToast({ style: Toast.Style.Success, title: `Renamed to ${newName}` });
      onRenamed();
      pop();
    } catch (error) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Rename failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Rename Tag" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description text={`Renaming tag: ${tag.Name} (${tag.Count} notes)`} />
      <Form.TextField id="newName" title="New Name" placeholder="#new-tag-name" value={newName} onChange={setNewName} />
    </Form>
  );
}

function TagNotesList({ tag }: { tag: Tag }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const results = searchNotes(tag.Name);
      setNotes(results);
    } catch {
      // Ignore errors
    } finally {
      setIsLoading(false);
    }
  }, [tag.Name]);

  return (
    <List isLoading={isLoading} navigationTitle={`Notes with ${tag.Name}`}>
      {notes.map((note) => (
        <List.Item
          key={note.uuid}
          title={note.title || note.path.split("/").pop() || "Untitled"}
          subtitle={note.path}
          accessories={(note.tags || []).filter((t) => t !== tag.Name).map((t) => ({ tag: t }))}
          actions={
            <ActionPanel>
              <Action.Open title="Open in Editor" target={note.path} />
              <Action.ShowInFinder path={note.path} />
              <Action.CopyToClipboard title="Copy Path" content={note.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export default function Command() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<SortOrder>("count");

  const loadTags = useCallback(() => {
    setIsLoading(true);
    try {
      const result = listTags();
      setTags(result);
    } catch (error) {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load tags",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const sortedTags = [...tags].sort((a, b) => {
    if (sortOrder === "count") {
      return b.Count - a.Count;
    }
    return a.Name.localeCompare(b.Name);
  });

  async function handleDelete(tag: Tag) {
    const confirmed = await confirmAlert({
      title: `Delete ${tag.Name}?`,
      message: `This will remove the tag from ${tag.Count} note(s).`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });

    if (confirmed) {
      try {
        deleteTag(tag.Name);
        await showToast({ style: Toast.Style.Success, title: `Deleted ${tag.Name}` });
        loadTags();
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
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter tags..."
      searchBarAccessory={
        <List.Dropdown tooltip="Sort Order" value={sortOrder} onChange={(value) => setSortOrder(value as SortOrder)}>
          <List.Dropdown.Item title="By Count" value="count" />
          <List.Dropdown.Item title="By Name" value="name" />
        </List.Dropdown>
      }
    >
      {sortedTags.length === 0 && !isLoading ? (
        <List.EmptyView title="No Tags" description="Create notes with #tags to see them here" icon={Icon.Tag} />
      ) : (
        sortedTags.map((tag) => (
          <List.Item
            key={tag.Name}
            title={tag.Name}
            accessories={[{ text: `${tag.Count} notes` }]}
            actions={
              <ActionPanel>
                <Action.Push title="View Notes" icon={Icon.List} target={<TagNotesList tag={tag} />} />
                <Action.Push
                  title="Rename Tag"
                  icon={Icon.Pencil}
                  target={<RenameTagForm tag={tag} onRenamed={loadTags} />}
                  shortcut={{ modifiers: ["cmd"], key: "r" }}
                />
                <Action
                  title="Delete Tag"
                  icon={Icon.Trash}
                  style={Action.Style.Destructive}
                  onAction={() => handleDelete(tag)}
                  shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                />
                <Action.CopyToClipboard
                  title="Copy Tag"
                  content={tag.Name}
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
