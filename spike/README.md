# Pocketbase + Web Components Spike: Notes App

A technical spike demonstrating a notes application with Logseq-style indenting, built using:
- **Pocketbase** for data persistence
- **Web Components** (Lit) for UI
- **TipTap** for rich text editing

## Features

- Hierarchical note structure with unlimited nesting
- Logseq-style keyboard shortcuts:
  - **Enter**: New line within the current note
  - **Double Enter**: Create a new sibling note at the same level
  - **Tab**: Create an indented child note
- Real-time persistence to Pocketbase
- Minimal styling (intentionally left unstyled)

## Prerequisites

1. **Pocketbase**: Download from https://pocketbase.io/docs/
2. **Node.js**: v18 or higher

## Setup Instructions

### 1. Install Dependencies

```bash
cd spike
npm install
```

### 2. Set Up Pocketbase

Download Pocketbase for your platform:

```bash
# Example for Linux
cd spike
wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.0/pocketbase_0.22.0_linux_amd64.zip
unzip pocketbase_0.22.0_linux_amd64.zip
chmod +x pocketbase
```

Or download manually from: https://github.com/pocketbase/pocketbase/releases

### 3. Initialize Pocketbase

```bash
# Start Pocketbase (this will create pb_data directory)
./pocketbase serve
```

Visit http://127.0.0.1:8090/_/ to create an admin account (you can skip this for the spike).

Stop Pocketbase (Ctrl+C).

### 4. Apply Migrations

Copy the migration file:

```bash
cp pb_migrations/* pb_data/migrations/
```

Start Pocketbase again:

```bash
./pocketbase serve
```

The migration will automatically create the `notes` collection with the proper schema.

### 5. Run the Development Server

In a new terminal:

```bash
npm run dev
```

Visit http://localhost:3000 to see the app.

## Usage

1. Click "Add Note" to create your first note
2. Type some content
3. Press **Tab** to create an indented child note
4. Press **Enter** once to add a new line within the same note
5. Press **Enter** twice quickly to create a new sibling note at the same level

## Architecture

### Data Model

The `notes` collection has:
- `content`: Text content (can be HTML from TipTap)
- `parent`: Relation to parent note (empty for root notes)
- `order`: Integer for ordering siblings

### Components

- **`notes-app`**: Main application component
  - Manages Pocketbase connection
  - Handles CRUD operations
  - Renders note tree

- **`note-item`**: Individual note component
  - Embeds TipTap editor
  - Handles keyboard shortcuts
  - Emits events for creating child/sibling notes

### Tech Stack

- **Lit 3.x**: Web components framework
- **TipTap 2.x**: Headless editor (using core extensions only)
- **Pocketbase JS SDK**: For database operations
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety

## Limitations & Notes

- No styling (intentionally minimal)
- No delete functionality (keep it simple)
- No authentication (all notes are public)
- Double-enter detection uses a 500ms window
- No undo/redo beyond browser default
- No drag-and-drop reordering

## Next Steps

If this spike proves successful, consider:
- Adding note deletion
- Implementing drag-and-drop reordering
- Adding markdown support
- Implementing search/filter
- Adding proper styling
- User authentication
- Offline support with sync
