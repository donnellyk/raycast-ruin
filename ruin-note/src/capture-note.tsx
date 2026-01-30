import { Form, ActionPanel, Action, showHUD, popToRoot } from "@raycast/api";
import { useForm, FormValidation } from "@raycast/utils";
import { useState, useEffect } from "react";
import { createNote, listTags } from "./lib/ruin";
import type { Tag } from "./lib/types";

interface FormValues {
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
        let finalContent = values.content;
        if (values.tags.length > 0) {
          finalContent = `${values.content}\n\n${values.tags.join(" ")}`;
        }

        createNote(finalContent);
        await showHUD("Note created");
        await popToRoot();
      } catch (error) {
        await showHUD(`Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    initialValues: {
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
