import { List, Icon, showToast, Toast, LaunchProps } from "@raycast/api";
import { useState, useEffect } from "react";
import { searchNotes } from "./lib/ruin";
import { NoteListItem } from "./components/NoteListItem";
import type { Note } from "./lib/types";

interface LaunchContext {
  query?: string;
}

export default function Command(props: LaunchProps<{ launchContext?: LaunchContext }>) {
  const initialQuery = props.launchContext?.query || "";
  const [searchText, setSearchText] = useState(initialQuery);
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
      isShowingDetail
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
        notes.map((note) => <NoteListItem key={note.uuid} note={note} />)
      )}
    </List>
  );
}
