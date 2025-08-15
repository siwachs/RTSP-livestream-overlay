# RTSP Stream Overlay

A livestream management application with real-time overlay management for RTSP video streams.

## Features

- 🎥 RTSP/HTTP/HLS stream support with custom video controls
- 🎨 Drag-and-drop overlay positioning (text, images, logos)
- ⚡ Real-time overlay editing with live preview
- 🔧 REST API for overlay CRUD operations
- 📊 Analytics dashboard and configuration export/import
- 🐳 Docker deployment ready

## Quick Start

### Prerequisites

- Python 3.9+, Node.js 16+, MongoDB 5.0+

### Installation

git clone https://github.com/your-username/streamoverlay-pro.git
cd streamoverlay-pro

Backend:
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py

Frontend (new terminal):
cd frontend
npm install  
cp .env.example .env.local
npm start

### Docker

docker-compose up -d

## Usage

### Stream Setup

1. Enter stream URL (use demo MP4 URLs for instant testing)
2. Click "Start Streaming" to validate and begin
3. Demo URLs load in <2 seconds

### Overlay Management

1. Click "Add Overlay" → Choose type (text/image/logo)
2. Configure position, size, colors
3. Drag overlays to reposition in real-time
4. Use visibility toggle, edit, delete from overlay panel

## Demo Stream URLs (Instant Loading)

Always work - load in under 2 seconds:
"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
"https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"

Live HLS streams:
"https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8"

RTSP example (configure your IP):
"rtsp://admin:password@192.168.1.100:554/stream"

## API Reference

Get overlays:
GET /api/overlays?page=1&limit=10

Create overlay:
POST /api/overlays
{
"type": "text",
"content": "Hello World",
"x": 50, "y": 50,
"width": 200, "height": 50,
"fontSize": 16,
"color": "#ffffff",
"backgroundColor": "rgba(0,0,0,0.5)",
"isVisible": true
}

Update overlay:
PUT /api/overlays/{id}
{"content": "Updated text", "x": 60}

Delete overlay:
DELETE /api/overlays/{id}

Validate stream:
POST /api/streams/validate
{"rtspUrl": "https://example.com/stream.mp4"}

## Tech Stack

- Backend: Flask, MongoDB, OpenCV, Marshmallow
- Frontend: React 18, Tailwind CSS, Lucide Icons
- DevOps: Docker, NGINX, Docker Compose

## Project Structure

streamoverlay-pro/
├── ./ # Flask API (app.py, requirements.txt)
├── client/ # React app (src/, package.json)
└── README.md

## Environment Configuration

Backend (.env):
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
MONGO_URI=mongodb://localhost:27017/livestream_app

## Troubleshooting

Stream Issues:

- Not loading: Use demo MP4 URLs first, check URL format
- RTSP timeout: Try VLC player to verify stream works
- Validation fails: HTTP/HTTPS streams bypass validation automatically

Overlay Issues:

- Not displaying: Check visibility toggle, verify X/Y coordinates (0-100%)
- Drag stuck: Ensure proper mouse release, try refreshing page
- API errors: Verify Flask server running on port 5000, MongoDB connected

Performance:

- Keep active overlays under 15
- Use optimized image sizes
- Close unnecessary browser tabs

## Development Commands

Tests:
cd backend && python -m pytest tests/
cd frontend && npm test

Production build:
cd frontend && npm run build
