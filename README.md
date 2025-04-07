# Common Coding Room

A real-time collaborative coding environment where multiple users can code together, chat, and communicate via voice.

## Features

- Real-time code collaboration
- Multiple programming language support
- Live chat functionality
- Voice communication
- Code execution with output display
- Room-based collaboration

## Tech Stack

### Frontend
- React
- Socket.IO Client
- Monaco Editor
- WebRTC
- Tailwind CSS

### Backend
- Flask
- Flask-SocketIO
- WebRTC
- Redis (for session management)

## Project Structure

```
common-coding-room/
├── frontend/         # React frontend application
│   ├── public/       # Static files
│   └── src/          # React source code
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── utils/        # Utility functions
│       └── App.js        # Main application component
├── backend/          # Flask backend server
│   ├── app.py        # Main Flask application
│   ├── requirements.txt  # Python dependencies
│   └── venv/         # Virtual environment
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/common-coding-room.git
cd common-coding-room
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Enter your username
2. Create a new room or join an existing one using the room code
3. Share the room code with others to collaborate
4. Start coding, chatting, and using voice communication

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 