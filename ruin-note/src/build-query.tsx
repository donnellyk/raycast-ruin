import { Form, ActionPanel, Action, Icon, showHUD, Clipboard, launchCommand, LaunchType } from "@raycast/api";
import { useState, useEffect, useMemo } from "react";
import { listTags } from "./lib/ruin";
import type { Tag } from "./lib/types";

const DATE_FILTER_TYPES = [
  { title: "None", value: "" },
  { title: "On", value: "on" },
  { title: "Created", value: "created" },
  { title: "Updated", value: "updated" },
  { title: "Before", value: "before" },
  { title: "After", value: "after" },
  { title: "Between", value: "between" },
];

const DATE_PRESETS = [
  { title: "Today", value: "today" },
  { title: "Yesterday", value: "yesterday" },
  { title: "This Week", value: "this-week" },
  { title: "Last Week", value: "last-week" },
  { title: "This Month", value: "this-month" },
  { title: "Last Month", value: "last-month" },
  { title: "Last 7 Days", value: "7d" },
  { title: "Last 30 Days", value: "30d" },
  { title: "Custom", value: "custom" },
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function Command() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  // Form values
  const [textSearch, setTextSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [titleFilter, setTitleFilter] = useState("");
  const [dateFilterType, setDateFilterType] = useState("");
  const [datePreset, setDatePreset] = useState("today");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const result = listTags();
      setTags(result);
    } catch {
      // Ignore errors loading tags
    } finally {
      setIsLoadingTags(false);
    }
  }, []);

  // Build the query string
  const query = useMemo(() => {
    const parts: string[] = [];

    // Add text search
    if (textSearch.trim()) {
      parts.push(textSearch.trim());
    }

    // Add selected tags
    for (const tag of selectedTags) {
      parts.push(tag);
    }

    // Add title filter
    if (titleFilter.trim()) {
      parts.push(`title:${titleFilter.trim()}`);
    }

    // Add date filter
    if (dateFilterType) {
      if (dateFilterType === "between") {
        if (datePreset === "custom") {
          if (customStartDate && customEndDate) {
            parts.push(`between:${formatDate(customStartDate)},${formatDate(customEndDate)}`);
          }
        } else {
          // For presets with between, use the preset as start and today as implicit end
          // This doesn't make semantic sense, so between should typically use custom
          // But we'll just use the preset value for both to show something
          parts.push(`between:${datePreset},today`);
        }
      } else {
        if (datePreset === "custom") {
          if (customStartDate) {
            parts.push(`${dateFilterType}:${formatDate(customStartDate)}`);
          }
        } else {
          parts.push(`${dateFilterType}:${datePreset}`);
        }
      }
    }

    return parts.join(" && ");
  }, [textSearch, selectedTags, titleFilter, dateFilterType, datePreset, customStartDate, customEndDate]);

  const handleRunSearch = async () => {
    if (!query) {
      await showHUD("Please add at least one search term");
      return;
    }
    await launchCommand({
      name: "search-notes",
      type: LaunchType.UserInitiated,
      launchContext: { query },
    });
  };

  const handleCopyQuery = async () => {
    if (!query) {
      await showHUD("Nothing to copy");
      return;
    }
    await Clipboard.copy(query);
    await showHUD("Query copied to clipboard");
  };

  return (
    <Form
      isLoading={isLoadingTags}
      actions={
        <ActionPanel>
          <Action title="Run Search" icon={Icon.MagnifyingGlass} onAction={handleRunSearch} />
          <Action title="Copy Query" icon={Icon.Clipboard} onAction={handleCopyQuery} />
        </ActionPanel>
      }
    >
      <Form.Description title="Query Preview" text={query || "(empty query)"} />

      <Form.Separator />

      <Form.TextField
        id="textSearch"
        title="Text Search"
        placeholder="Search for words in note content..."
        value={textSearch}
        onChange={setTextSearch}
      />

      <Form.TagPicker id="tags" title="Tags" value={selectedTags} onChange={setSelectedTags}>
        {tags.map((tag) => (
          <Form.TagPicker.Item key={tag.Name} value={tag.Name} title={tag.Name} />
        ))}
      </Form.TagPicker>

      <Form.TextField
        id="titleFilter"
        title="Title Contains"
        placeholder="Filter by title..."
        value={titleFilter}
        onChange={setTitleFilter}
      />

      <Form.Separator />

      <Form.Dropdown id="dateFilterType" title="Date Filter" value={dateFilterType} onChange={setDateFilterType}>
        {DATE_FILTER_TYPES.map((type) => (
          <Form.Dropdown.Item key={type.value} value={type.value} title={type.title} />
        ))}
      </Form.Dropdown>

      {dateFilterType && (
        <Form.Dropdown id="datePreset" title="Date Range" value={datePreset} onChange={setDatePreset}>
          {DATE_PRESETS.map((preset) => (
            <Form.Dropdown.Item key={preset.value} value={preset.value} title={preset.title} />
          ))}
        </Form.Dropdown>
      )}

      {dateFilterType && datePreset === "custom" && dateFilterType !== "between" && (
        <Form.DatePicker
          id="customDate"
          title="Date"
          type={Form.DatePicker.Type.Date}
          value={customStartDate}
          onChange={setCustomStartDate}
        />
      )}

      {dateFilterType === "between" && datePreset === "custom" && (
        <>
          <Form.DatePicker
            id="startDate"
            title="Start Date"
            type={Form.DatePicker.Type.Date}
            value={customStartDate}
            onChange={setCustomStartDate}
          />
          <Form.DatePicker
            id="endDate"
            title="End Date"
            type={Form.DatePicker.Type.Date}
            value={customEndDate}
            onChange={setCustomEndDate}
          />
        </>
      )}
    </Form>
  );
}
