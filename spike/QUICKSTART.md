# Quick Start Guide

## Running Locally (Recommended)

Due to network restrictions in the development environment, you'll need to run this on your local machine.

### 1. Download Pocketbase

**macOS / Linux:**
```bash
# macOS (Apple Silicon)
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.3/pocketbase_0.21.3_darwin_arm64.zip -o pocketbase.zip

# macOS (Intel)
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.3/pocketbase_0.21.3_darwin_amd64.zip -o pocketbase.zip

# Linux
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.3/pocketbase_0.21.3_linux_amd64.zip -o pocketbase.zip

# Extract
unzip pocketbase.zip
chmod +x pocketbase
```

**Windows:**
Download from: https://github.com/pocketbase/pocketbase/releases/download/v0.21.3/pocketbase_0.21.3_windows_amd64.zip

Extract the ZIP and you'll have `pocketbase.exe`.

### 2. Setup Pocketbase

```bash
# In the spike directory
cd spike

# Start Pocketbase (creates pb_data directory)
./pocketbase serve
```

On first run, visit http://127.0.0.1:8090/_/ to create an admin account (optional for this spike).

Stop Pocketbase with Ctrl+C.

### 3. Apply Database Migration

```bash
# Copy migration to pb_data
cp pb_migrations/* pb_data/migrations/

# Restart Pocketbase - migration will auto-apply
./pocketbase serve
```

Keep this terminal running with Pocketbase.

### 4. Install and Run the Frontend

In a new terminal:

```bash
cd spike

# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev
```

Visit http://localhost:3000 to use the app!

## Usage

1. Click "Add Note" to create your first note
2. Type some content
3. **Tab** - Create an indented child note
4. **Enter** - New line within the same note
5. **Enter + Enter** (quickly) - Create a sibling note at the same level

## Architecture Overview

```
spike/
├── src/
│   ├── note-item.ts      # Individual note component with TipTap editor
│   ├── notes-app.ts      # Main app, manages Pocketbase & note tree
│   └── main.ts           # Entry point
├── pb_migrations/        # Database schema
├── index.html            # HTML page
├── package.json          # Dependencies
└── README.md            # Full documentation
```

## Troubleshooting

**"Failed to load notes" error:**
- Make sure Pocketbase is running on port 8090
- Check that the migration was applied: visit http://127.0.0.1:8090/_/#/collections

**Port already in use:**
- Frontend: Change port in `vite.config.ts`
- Backend: Run `./pocketbase serve --http=127.0.0.1:8091` and update the URL in `notes-app.ts:67`

**TypeScript errors:**
- Run `npx tsc --noEmit` to check for errors
- All types should compile successfully

## Next Steps

See the main README.md for:
- Feature limitations
- Tech stack details
- Suggested enhancements
- Architecture deep-dive
