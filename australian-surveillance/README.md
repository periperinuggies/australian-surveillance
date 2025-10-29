# Australian Surveillance

Interactive map of surveillance cameras across Perth, Western Australia. This project visualizes CCTV cameras, speed cameras, red-light cameras, and AI detection systems throughout the Perth metropolitan area.

![Australian Surveillance Map](https://img.shields.io/badge/Cameras-762-blue) ![Status](https://img.shields.io/badge/Status-Active-green)

## Features

### Interactive Map
- 🗺️ **Interactive Leaflet Map** centered on Perth CBD
- 📍 **762 Camera Locations** across Greater Perth
- 🎨 **Color-coded markers** by camera type with glowing beacon icons
- 🔄 **Directional indicators** showing camera coverage angle
- 🌓 **Greyscale mode** (map goes grey, cameras stay colored)

### Camera Types
- **Public Safety**: 711 cameras (City of Perth CCTV Network)
- **Red-Light Speed**: 33 intersection cameras
- **Fixed Speed**: 8 freeway cameras
- **AI Detection**: 8 cameras (mobile phone, seatbelt, speed)
- **Point-to-Point**: 2 average speed cameras

### Filtering System
- Filter by **Camera Type** (Traffic, Public Safety, Transit, etc.)
- Filter by **Owner** (City of Perth, WA Police, etc.)
- Filter by **Network** (enforcement networks, CCTV networks)
- Filter by **Purpose** (monitoring, enforcement, AI detection)
- 🔍 **Location Search** - Search by suburb name or postcode

### God Mode (Admin Panel)
Secure authentication system for camera management:
- ✏️ **Edit ANY camera** including imported datasets
- ➕ **Add new cameras** with custom networks/types
- 🗑️ **Delete cameras** individually or in bulk
- 📊 **Statistics dashboard** with camera counts
- 🔎 **Search and filter** all cameras

## Technology Stack

### Frontend
- **Leaflet.js** - Interactive mapping library
- **Vanilla JavaScript** - No framework dependencies
- **SVG Icons** - Custom camera beacon icons with glow effects

### Backend
- **Node.js + Express** - API server
- **JWT Authentication** - Secure admin access
- **JSON Database** - File-based camera storage

## Installation

### Prerequisites
- Node.js 14+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/periperinuggies/australian-surveillance.git
cd australian-surveillance
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
GOD_ACCOUNT_USERNAME=god
GOD_ACCOUNT_PASSWORD=your-secure-password
```

4. Start the server:
```bash
npm start
```

5. Open your browser:
```
http://localhost:3000/index.html
```

## God Mode Access

To access the admin panel:
1. Click the purple "God Mode" button in the top-right header
2. Login with your configured credentials
3. Manage all 762 cameras, create networks, or bulk delete

**Security Note**: Change the default credentials in your `.env` file before deploying!

## License

MIT License

## Acknowledgments

- **City of Perth** - Open Data Portal
- **WA Police** - Traffic enforcement camera data
- **OpenStreetMap** - Base map tiles
- **Leaflet.js** - Mapping library

---

**Disclaimer**: This project is for informational and educational purposes only. Camera locations are based on publicly available data and may not be 100% accurate or current. Always obey traffic laws and regulations.
