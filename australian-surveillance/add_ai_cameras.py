#!/usr/bin/env python3
"""
Add WA's new AI detection cameras to the database.
These cameras detect mobile phone use, seatbelt violations, and speeding.
Launched January 2025.
"""

import json

# AI Camera locations
ai_cameras = [
    # Fixed locations on Kwinana Freeway
    ("Kwinana Freeway", "Kwinana Freeway (North)", "AI Camera", -32.0200, 115.8550),
    ("Kwinana Freeway", "Kwinana Freeway (South)", "AI Camera", -32.0800, 115.8450),

    # Mobile AI camera trailer locations (rotate around Perth)
    ("Perth North", "Mitchell Freeway Area", "AI Camera", -31.8500, 115.7900),
    ("Perth South", "Tonkin Highway Area", "AI Camera", -32.0500, 115.9500),
    ("Perth East", "Great Eastern Highway Area", "AI Camera", -31.9500, 116.0200),
    ("Perth West", "Stirling Highway Area", "AI Camera", -31.9800, 115.7800),
    ("Mandurah", "Mandurah Region", "AI Camera", -32.5300, 115.7200),
    ("Joondalup", "Joondalup Region", "AI Camera", -31.7500, 115.7700),
]

def main():
    print("Loading existing cameras...")
    with open('cameras_database.json', 'r') as f:
        cameras = json.load(f)

    print(f"Current camera count: {len(cameras)}")

    # Remove any existing AI cameras
    cameras = [c for c in cameras if c.get('type') != 'AI Camera']

    print(f"\nAdding {len(ai_cameras)} AI detection cameras...")

    camera_id = 2000  # Start AI cameras at 2000

    for i, (area, location, cam_type, lat, lng) in enumerate(ai_cameras, 1):
        camera = {
            "id": f"WAPOL-AI-{camera_id}",
            "camera_number": f"AI-{camera_id}",
            "lat": lat,
            "lng": lng,
            "type": "AI Camera",
            "owner": "WA Police",
            "direction": None,
            "coverage": "360",
            "purpose": "AI detection: mobile phone use, seatbelt violations, speeding",
            "network": "WA Police AI Enforcement",
            "suburb": area,
            "location": location,
            "data_source": "WA Police - Active from January 2025",
            "last_updated": "2025-10-28",
            "detection_types": ["mobile_phone", "seatbelt", "speed"]
        }

        cameras.append(camera)
        camera_id += 1
        print(f"  {i}. Added AI Camera at {area} - {location}")

    print(f"\nSaving {len(cameras)} total cameras...")
    with open('cameras_database.json', 'w') as f:
        json.dump(cameras, f, indent=2)

    print("✓ Complete!")
    print(f"\nFinal count: {len(cameras)} cameras")

    # Count by type
    types = {}
    for c in cameras:
        t = c.get('type', 'Unknown')
        types[t] = types.get(t, 0) + 1

    print("\nCameras by type:")
    for t, count in sorted(types.items()):
        print(f"  - {t}: {count}")

if __name__ == '__main__':
    main()
