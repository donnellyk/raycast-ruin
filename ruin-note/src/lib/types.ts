// Search result from `ruin search --json` or `ruin today --json`
export interface Note {
  path: string;
  uuid: string;
  title?: string;
  tags: string[];
}

// Tag from `ruin tags list --json`
export interface Tag {
  Name: string;
  Count: number;
}

// Saved query from `ruin query list --json`
export interface SavedQuery {
  name: string;
  query: string;
}

// Log result from `ruin log --json`
export interface LogResult {
  path: string;
  uuid: string;
}
