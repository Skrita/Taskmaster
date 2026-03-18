# TaskmAIster

A Kanban-style task manager for the Addvery team, built with React + TypeScript + Supabase.

## Features

- **Kanban board** — Todo / In Progress / Done columns with drag-and-drop reorder
- **Task management** — create, edit, delete tasks with title, description, priority, due date, assignees, and tags
- **Subtasks** with progress bar and **AI generation** (✦ Suggest button powered by OpenAI)
- **Comments** with @mention autocomplete and convert-to-subtask
- **Activity log** — real-time feed of all changes (⚡ Activity panel)
- **Feedback** — Bug / Suggestion / Other submissions stored in Supabase
- **Search & filter** — by status, priority, assignee, tag, or free text
- **Microsoft SSO** — Azure AD login (Addvery tenant)
- **Mobile-responsive** — tabbed layout on mobile, side-by-side on desktop
- **Keyboard shortcuts** — `N` new task, `/` search, `Esc` close

## Tech Stack

- React 19 + TypeScript + Vite + Tailwind CSS 4
- Supabase (Postgres + real-time)
- Microsoft MSAL (`@azure/msal-browser`)
- OpenAI SDK for AI subtask generation

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Fill in your OpenAI API key in .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

In dev mode, SSO login is bypassed — you'll be prompted for a display name on first run.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_OPENAI_API_KEY` | OpenAI API key for AI subtask generation |

## Supabase Schema

Three tables: `tasks`, `activity_logs`, `feedback`. RLS is enabled on all — permissive anon policies allow full access via the publishable key.

See SQL setup in [src/lib/supabase.ts](src/lib/supabase.ts).

## Deployment

```bash
npm run deploy   # builds and pushes to gh-pages branch
```

Deployed at: `https://skrita.github.io/Taskmaster/`

Production SSO requires Azure AD admin consent — contact your Azure portal admin.
