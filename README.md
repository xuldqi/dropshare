# DropShare - Local File Sharing

Fast and secure local file sharing application that allows instant file transfer between devices on the same network without uploads, downloads, or accounts.

## Features

- **Instant File Transfer**: Share files directly between devices on your local network
- **Multi-user Rooms**: Create private rooms for group file sharing
- **No Account Required**: Start sharing immediately without registration
- **Secure Local Network**: Files never leave your network
- **Cross-Platform**: Works on any device with a web browser
- **Real-time Communication**: Instant peer discovery and file transfer notifications

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   node index.js
   ```

3. **Access DropShare**
   - Open `http://localhost:8080` in your browser
   - Share the URL with other devices on the same network
   - Start sharing files instantly!

## Usage

### File Transfer
- Open DropShare on multiple devices connected to the same network
- Click on a discovered device to send files
- Drag & drop files or click to select
- Files are transferred directly between devices

### Multi-user Rooms
- Click "Rooms" in the navigation
- Create a new room or join an existing one
- Share the room code with others
- All room members can share files with each other

### Additional Tools
- **Image Tools**: Basic image processing utilities
- **Audio Tools**: Simple audio file operations  
- **Video Tools**: Video file conversion helpers
- **Document Tools**: Document processing tools

## Technical Details

- **Backend**: Node.js with Express and Socket.io
- **Frontend**: Pure HTML/CSS/JavaScript
- **File Transfer**: WebRTC peer-to-peer connections
- **Real-time**: Socket.io for instant communication
- **Port**: 8080 (default)

## Network Requirements

- All devices must be on the same local network (WiFi/LAN)
- No internet connection required for basic file sharing
- Firewall may need to allow port 8080

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**DropShare** - Simple, fast, and secure local file sharing for everyone.