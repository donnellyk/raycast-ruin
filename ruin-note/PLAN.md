# Ruin Note - Raycast Extension Plan

## Overview

A Raycast extension for quick note capture and management using the `ruin` CLI.

## Commands

### 1. Capture Note (Primary)
**File**: `src/capture-note.tsx`
**Mode**: `view` (Form)

Form fields:
- **Title** (TextField, optional): Sets filename via `--title`
- **Content** (TextArea, required): Note body with inline `#tags`
- **Tags** (TagPicker): Multi-select from existing tags, appended to content

Submit action:
```bash
ruin log --json [--title "..."] "content #tag1 #tag2"
```

On success: Show HUD "Note created", pop navigation

### 2. Search Notes
**File**: `src/search-notes.tsx`
**Mode**: `view` (List)

- Search bar for query input (tags, text, date filters)
- Live results via `ruin search "<query>" --json`
- List.Item shows title, path, tags as accessories
- Actions:
  - Open in default editor (`Action.Open`)
  - Copy path
  - Show in Finder
  - View content (push Detail view)

### 3. Saved Queries
**File**: `src/saved-queries.tsx`
**Mode**: `view` (List)

List saved queries from `ruin query list --json`

Actions per query:
- **Run**: Execute `ruin query run <name> --json`, push to search results view
- **Delete**: `ruin query delete <name> --force`
- **Copy query string**

Empty state action: Link to Search Notes command

### 4. Manage Tags
**File**: `src/manage-tags.tsx`
**Mode**: `view` (List)

List all tags from `ruin tags list --json` with counts

Actions per tag:
- **Search notes with tag**: Push to search with `#tagname`
- **Rename**: Form to enter new name, `ruin tags rename "#old" "#new" --force`
- **Delete**: Confirm, then `ruin tags delete "#tag" --force`

Sort options via dropdown: by count (default), by name

### 5. Today's Notes
**File**: `src/todays-notes.tsx`
**Mode**: `view` (List)

Quick access to notes created today via `ruin today --json`

- List.Item shows title, tags as accessories
- Actions:
  - Open in default editor
  - Copy path
  - Show in Finder
  - View content (push Detail view)

Empty state: "No notes today" with action to Capture Note

---

## Implementation Order

1. **lib/ruin.ts** - CLI wrapper functions
2. **lib/types.ts** - TypeScript interfaces
3. **capture-note.tsx** - Core use case
4. **search-notes.tsx** - Discovery/retrieval
5. **todays-notes.tsx** - Quick daily view
6. **manage-tags.tsx** - Tag operations
7. **saved-queries.tsx** - Query management

---

## Package.json Updates

Update existing `package.json` with these commands:

```json
{
  "description": "Quick note capture and search with ruin CLI",
  "commands": [
    {
      "name": "capture-note",
      "title": "Capture Note",
      "description": "Create a new note with optional title and tags",
      "mode": "view"
    },
    {
      "name": "search-notes",
      "title": "Search Notes",
      "description": "Search notes by tags, text, or date",
      "mode": "view"
    },
    {
      "name": "todays-notes",
      "title": "Today's Notes",
      "description": "View notes created today",
      "mode": "view"
    },
    {
      "name": "saved-queries",
      "title": "Saved Queries",
      "description": "Run and manage saved search queries",
      "mode": "view"
    },
    {
      "name": "manage-tags",
      "title": "Manage Tags",
      "description": "View, rename, and delete tags",
      "mode": "view"
    }
  ]
}
```

Note: Change `capture-note` from `no-view` to `view` since it uses a Form.

---

## CLI Compatibility

| Feature | CLI Command | Status |
|---------|-------------|--------|
| Create note | `ruin log --json` | Works |
| Create note with title | `ruin log --title "..." --json` | Works |
| Search | `ruin search "<query>" --json` | Works |
| Today's notes | `ruin today --json` | Works |
| List tags | `ruin tags list --json` | Works |
| Rename tag | `ruin tags rename "#old" "#new" --force` | Works |
| Delete tag | `ruin tags delete "#tag" --force` | Works |
| List queries | `ruin query list --json` | Works |
| Run query | `ruin query run <name> --json` | Works |
| Delete query | `ruin query delete <name> --force` | Works |

If blockers are found during implementation, document in `CLI_CHANGES_NEEDED.md`.

---

## File Structure

```
ruin-note/
├── CLAUDE.md
├── PLAN.md
├── package.json
├── tsconfig.json
├── eslint.config.js
├── assets/
│   └── extension-icon.png
└── src/
    ├── capture-note.tsx
    ├── search-notes.tsx
    ├── todays-notes.tsx
    ├── saved-queries.tsx
    ├── manage-tags.tsx
    └── lib/
        ├── ruin.ts
        └── types.ts
```
