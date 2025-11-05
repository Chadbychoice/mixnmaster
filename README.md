# MatchMaster - Professional Audio Mastering Platform

A modern web application for automatic audio mastering using the powerful Matchering engine. Upload your tracks, choose reference songs, and get professional-quality masters instantly.

## Features

### 🎵 Core Mastering
- **Reference-based mastering** - Match your track to any reference song
- **Multiple output formats** - 16-bit, 24-bit WAV, MP3
- **Batch processing** - Master multiple tracks at once
- **High-quality limiting** - Built-in Hyrax brickwall limiter

### 👤 User Experience
- **Drag & drop interface** - Easy file uploads
- **Real-time preview** - Listen before downloading
- **User accounts** - Save projects and history
- **Progress tracking** - Monitor processing status

### 🚀 Technical
- **Fast processing** - Optimized for speed
- **Scalable architecture** - Docker-based deployment
- **RESTful API** - Easy integration
- **Modern UI** - React-based frontend

## Quick Start

### Prerequisites
- Docker and Docker Compose
- 4GB+ RAM recommended

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Chadbychoice/mixnmaster.git
cd mixnmaster
```

2. Start the services:
```bash
docker-compose up -d
```

3. Open your browser to `http://localhost:3000`

## Architecture

```
Frontend (React) → Backend (FastAPI) → Matchering Engine → File Storage
     ↓                    ↓                    ↓
  User Interface    Audio Processing    Reference Matching
```

## API Endpoints

- `POST /api/upload` - Upload audio files
- `POST /api/master` - Process mastering job
- `GET /api/jobs/{id}` - Get job status
- `GET /api/download/{id}` - Download processed files

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## License

GPL-3.0 (inherited from Matchering)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Acknowledgments

Built on top of the excellent [Matchering](https://github.com/sergree/matchering) library by sergree.

