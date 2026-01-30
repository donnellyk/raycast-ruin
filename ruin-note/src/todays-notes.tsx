import { List, ActionPanel, Action, Icon, showToast, Toast, launchCommand, LaunchType } from "@raycast/api";
import { useState, useEffect } from "react";
import { getTodayNotes } from "./lib/ruin";
import { NoteListItem } from "./components/NoteListItem";
import type { Note } from "./lib/types";

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
    <List isLoading={isLoading} isShowingDetail searchBarPlaceholder="Filter today's notes...">
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
        notes.map((note) => <NoteListItem key={note.uuid} note={note} />)
      )}
    </List>
  );
}
