# Ruin Note - Raycast Extension

Raycast extension for the `ruin` CLI note-taking tool.

## Build & Run

```bash
cd ruin-note
npm install
npm run dev    # Start dev mode with hot reload
npm run build  # Production build
npm run lint   # ESLint check
```

## Project Structure

```
ruin-note/
├── package.json
├── tsconfig.json
├── assets/
│   └── extension-icon.png
└── src/
    ├── capture-note.tsx      # Quick note capture form
    ├── search-notes.tsx      # Search notes with live results
    ├── todays-notes.tsx      # Notes created today
    ├── saved-queries.tsx     # Manage and run saved queries
    ├── manage-tags.tsx       # View, rename, delete tags
    └── lib/
        ├── ruin.ts           # CLI wrapper functions
        └── types.ts          # TypeScript interfaces
```

## CLI Integration

All functionality uses the `ruin` CLI directly via `useExec` and `execAsync`:

- **Capture**: `ruin log --json [--title "..."] "content #tags"`
- **Search**: `ruin search "<query>" --json`
- **Today**: `ruin today --json`
- **Tags**: `ruin tags list --json`
- **Queries**: `ruin query list --json`, `ruin query run <name> --json`

Always use `--json` flag for parsing. The CLI handles vault path via config.

## JSON Output Formats

### Search Results / Today
```json
[{ "path": "/path/to/note.md", "uuid": "...", "title": "Note Title", "tags": ["#tag1"] }]
```

### Tags List
```json
[{ "Name": "#tagname", "Count": 5 }]
```

### Query List
```json
[{ "name": "query-name", "query": "#tag && text" }]
```

## Key Patterns

- Use `useExec` for read operations (search, list tags, list queries)
- Use `execAsync` + `revalidate` for mutations (create note, rename tag)
- Form validation via `useForm` from `@raycast/utils`
- Tag picker populated from `ruin tags list --json`
- Commands with UI use `.tsx` extension and `mode: "view"`

## CLI Limitations

Document any CLI changes needed in `CLI_CHANGES_NEEDED.md`.
