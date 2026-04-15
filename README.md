# Discogs Collection

A web app to browse your [Discogs](https://www.discogs.com) record collection and wantlist.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Backend | Python + FastAPI |
| Data | Discogs REST API |

## Features

- Browse your full Discogs record collection as a card grid
- Browse your Discogs wantlist
- Search/filter by title or artist (client-side, no extra requests)


## Prerequisites

- Node.js 18+
- Python 3.11+
- A Discogs account and [personal access token](https://www.discogs.com/settings/developers)

## Setup

### 1. Backend

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `server/.env` file:

```
DISCOGS_TOKEN=your_token_here
DISCOGS_USERNAME=your_discogs_username
```

Start the server:

```bash
python3 main.py
# Runs on http://localhost:8000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
# Runs on http://localhost:5173
```

## API endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/collection` | Full record collection (all pages) |
| `GET` | `/wantlist` | Full wantlist (all pages) |

Both data endpoints read the Discogs username and token from the server environment — no credentials are ever sent from the browser.
