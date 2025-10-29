# Quick Start Guide

## Australian Surveillance - Perth Camera Mapping

---

## 🚀 System is Running!

Your server is currently running with **711 real cameras** from the City of Perth.

### Access the Applications

1. **Main Public Map**
   - URL: http://localhost:3000/index.html
   - View all 711 cameras across Perth
   - Use greyscale mode toggle
   - Search by suburb
   - Filter by type and owner

2. **Admin Panel** (God Account)
   - URL: http://localhost:3000/admin.html
   - Login credentials:
     - Username: `godadmin`
     - Password: `AusSurveillance2025!`
   - Click map to add cameras
   - Fill in camera details
   - Save to database

---

## Key Features Implemented

### ✅ Greyscale Map Mode
- Toggle switch in sidebar
- Grays out map while keeping camera colors vibrant
- Makes cameras easy to spot

### ✅ Bright Camera Colors
- Traffic: Bright Blue (#00bfff)
- Public Safety: Bright Red (#ff3333)
- Transit: Bright Green (#00ff00)
- Retail: Bright Orange (#ffa500)
- Parks: Bright Purple (#da70d6)
- LPR: Yellow (#ffff00)

### ✅ Location Search
- Search any of 70+ suburbs
- Covers all of Greater Perth:
  - North: Yanchep to Joondalup
  - South: Fremantle to Mandurah
  - East: Midland to Kalamunda
  - Central: Perth CBD

### ✅ Real Data Integration
- 711 cameras from City of Perth Open Data
- Official CityWatch network
- Updated October 2025

### ✅ God Account System
- Secure JWT authentication
- Add cameras by dropping pins
- Full CRUD operations
- Session management

---

## How to Add Cameras (God Account)

1. Open `http://localhost:3000/admin.html`
2. Login with god account credentials
3. Click anywhere on the map
4. A red pin appears
5. Fill in the form:
   - Type (Traffic, Public Safety, etc.)
   - Owner (e.g., City of Perth)
   - Coverage (360° or Directional)
   - Direction (if directional)
   - Purpose
   - Network
   - Suburb
6. Click "Save Camera"
7. Camera is immediately added to database
8. Refresh main app to see new camera

---

## Data Sources

### Currently Integrated ✅
- **City of Perth** (711 cameras)
  - Source: City of Perth Open Data Initiative
  - License: CC BY 4.0
  - Last Updated: Oct 9, 2025

### Identified But Not Yet Integrated
- **Main Roads WA** - Traffic cameras across Perth metro
- **Transperth** - All 83 train stations (estimated locations)
- **City of Wanneroo** - Wangara network map
- **City of Stirling** - 600+ cameras at 39 locations
- **City of Joondalup** - CBD and suburbs
- **City of Cockburn** - 700+ cameras

See `DATA_SOURCES.md` for comprehensive research findings.

---

## File Structure

```
australian-surveillance/
├── index.html              # Main public map
├── app.js                  # Frontend logic
├── admin.html              # God account admin panel
├── admin.js                # Admin panel logic
├── server.js               # Node.js backend API
├── cameras_database.json   # Camera data (711 cameras)
├── process_camera_data.py  # Data processing script
├── package.json            # Dependencies
├── .env                    # Configuration (change password!)
├── README.md               # Full documentation
├── DATA_SOURCES.md         # Research findings
└── QUICK_START.md          # This file
```

---

## API Endpoints

### Public
- `GET /api/cameras` - Get all cameras
- `GET /api/cameras/:id` - Get specific camera

### God Account Only (Requires Auth Token)
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/cameras` - Add camera
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera

---

## Next Steps / Future Enhancements

### High Priority
1. **Main Roads WA Integration**
   - Add traffic camera locations
   - Identify correct API endpoint
   - Process and integrate data

2. **Transperth Stations**
   - Create camera entries for all 83 stations
   - Mark as estimated locations
   - Note comprehensive CCTV coverage

3. **Direction Data**
   - Add camera orientation for existing Perth cameras
   - Requires manual research or FOI requests

### Medium Priority
4. **Clustering**
   - Add marker clustering for better performance
   - Important when camera count exceeds 2000+

5. **Export Functionality**
   - Export filtered results to CSV/GeoJSON
   - Share specific areas via URL

6. **Mobile Optimization**
   - Improve responsive design
   - Touch-friendly controls

### Future Expansion
7. **Other Australian Cities**
   - Sydney, Melbourne, Brisbane, Adelaide
   - Use similar approach with open data

8. **Community Submissions**
   - Open submission system with verification
   - Upvote/downvote mechanism
   - Moderation queue

9. **Historical Data**
   - Track camera installation dates
   - Show timeline of surveillance growth
   - Before/after comparisons

---

## Troubleshooting

### Server Won't Start
- Check if port 3000 is already in use
- Try changing PORT in .env file
- Ensure Node.js is installed (`node --version`)

### No Cameras Showing
- Ensure server is running (`npm start`)
- Check browser console for errors
- Verify `cameras_database.json` exists and has data

### Can't Login to Admin Panel
- Check credentials in `.env` file
- Verify JWT_SECRET is set
- Clear browser localStorage and try again

### API Connection Error
- Confirm server is running at http://localhost:3000
- Check CORS settings in server.js
- Ensure API_URL in app.js and admin.js points to correct server

---

## Security Notes

### Change Default Credentials!
The default god account credentials are:
- Username: `godadmin`
- Password: `AusSurveillance2025!`

**⚠️ Change these immediately in production!**

Edit `.env` file:
```
GOD_ACCOUNT_USERNAME=your_secure_username
GOD_ACCOUNT_PASSWORD=your_very_secure_password_here
```

### JWT Secret
Change the JWT_SECRET in `.env` to a long random string:
```
JWT_SECRET=your_super_secret_random_key_here_make_it_long
```

---

## Support

For questions or issues:
1. Check `README.md` for full documentation
2. Review `DATA_SOURCES.md` for research details
3. Inspect browser console for error messages
4. Check server logs for API errors

---

## License & Data Usage

- **Code:** MIT License (or your choice)
- **City of Perth Data:** CC BY 4.0
- **Purpose:** Public awareness and transparency
- **Privacy:** Only publicly visible cameras, no footage access

---

**Built with:** Leaflet.js, Node.js, Express, JWT, OpenStreetMap

**Last Updated:** October 28, 2025

🎉 **Enjoy exploring Perth's surveillance infrastructure!**
