import { Form, ActionPanel, Action, showHUD, popToRoot } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useState, useEffect } from "react";
import { createNote, listTags } from "./lib/ruin";
import type { Tag } from "./lib/types";

interface FormValues {
  title: string;
  content: string;
  tags: string[];
}

export default function Command() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

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

  const { handleSubmit, itemProps } = useForm<FormValues>({
    onSubmit: async (values) => {
      try {
        // Append selected tags to content
        let finalContent = values.content;
        if (values.tags.length > 0) {
          const tagStr = values.tags.join(" ");
          finalContent = `${values.content} ${tagStr}`;
        }

        createNote(finalContent, values.title || undefined);
        await showHUD("Note created");
        await popToRoot();
      } catch (error) {
        await showHUD(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    initialValues: {
      title: "",
      content: "",
      tags: [],
    },
    validation: {
      content: FormValidation.Required,
    },
  });

  return (
    <Form
      isLoading={isLoadingTags}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create Note" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Title" placeholder="Optional title for the note" {...itemProps.title} />
      <Form.TextArea
        title="Content"
        placeholder="Note content (use #tags inline)"
        enableMarkdown
        {...itemProps.content}
      />
      <Form.TagPicker title="Tags" {...itemProps.tags}>
        {tags.map((tag) => (
          <Form.TagPicker.Item key={tag.Name} value={tag.Name} title={tag.Name} />
        ))}
      </Form.TagPicker>
    </Form>
  );
}
