#!/usr/bin/env python3
"""
Add WA Police enforcement cameras (speed and red-light) to the database.
Uses approximate coordinates for Perth intersections.
"""

import json
import time

# Speed and Red-Light Camera locations (from speedcameralocations.com.au)
enforcement_cameras = [
    # Format: (suburb, location, type, lat, lng)
    ("Applecross", "Canning Hwy & Riseley St", "Red-Light Speed", -32.0157, 115.8355),
    ("Ascot", "Great Eastern Hwy & Tonkin Hwy", "Red-Light Speed", -31.9293, 115.9340),
    ("Atwell", "Beeliar Dr & Kwinana Fwy", "Red-Light Speed", -32.1385, 115.8630),
    ("Balcatta", "Reid Hwy & Balcatta Rd", "Red-Light Speed", -31.8746, 115.8283),
    ("Balga", "Beach Rd & Mirrabooka Ave", "Red-Light Speed", -31.8579, 115.8400),
    ("Bateman", "Kwinana Freeway", "Fixed Speed", -32.0562, 115.8597),
    ("Bayswater", "Guildford Rd & Garratt Rd", "Red-Light Speed", -31.9215, 115.9179),
    ("Bayswater", "Guildford Rd & Tonkin Hwy", "Red-Light Speed", -31.9170, 115.9365),
    ("Beckenham", "Roe Highway", "Fixed Speed", -32.0249, 115.9597),
    ("Bedford", "Broun Ave & Coode St", "Red-Light Speed", -31.9157, 115.8933),
    ("Bentley", "Albany Hwy & Leach Hwy", "Red-Light Speed", -32.0062, 115.9219),
    ("Bentley", "Manning Rd & Townsing Dr", "Red-Light Speed", -32.0105, 115.9177),
    ("Bullsbrook", "Great Northern Hwy", "Fixed Speed", -31.6698, 116.0364),
    ("Canning Vale", "Nicholson Rd & Ranford Rd", "Red-Light Speed", -32.0681, 115.9204),
    ("Canning Vale", "Nicholson Rd & Warton Rd", "Red-Light Speed", -32.0572, 115.9190),
    ("Cannington", "Albany Hwy & Cecil Ave", "Red-Light Speed", -32.0166, 115.9384),
    ("Cannington", "Sevenoaks St & Wharf St", "Red-Light Speed", -32.0191, 115.9421),
    ("Como", "Kwinana Freeway", "Fixed Speed", -31.9956, 115.8702),
    ("Cottesloe", "Stirling Hwy & Eric St", "Red-Light Speed", -31.9994, 115.7621),
    ("Forrestfield", "Hale Rd & Maida Vale Rd", "Red-Light Speed", -31.9872, 116.0068),
    ("Fremantle", "Stirling Hwy & Tydeman Rd", "Red-Light Speed", -32.0563, 115.7496),
    ("Gosnells", "Albany Hwy & Corfield St", "Red-Light Speed", -32.0833, 116.0076),
    ("Innaloo", "Mitchell Freeway", "Fixed Speed", -31.8946, 115.8018),
    ("Joondalup", "Joondalup Dr & Shenton Ave", "Red-Light Speed", -31.7429, 115.7672),
    ("Kelmscott", "Albany Hwy & Welshpool Rd East", "Red-Light Speed", -32.1168, 116.0089),
    ("Malaga", "Marshall Rd & Reid Hwy", "Red-Light Speed", -31.8537, 115.8908),
    ("Manning", "Manning Rd & Ley St", "Red-Light Speed", -32.0142, 115.8705),
    ("Mirrabooka", "Reid Hwy & Morley Dr", "Red-Light Speed", -31.8611, 115.8644),
    ("Morley", "Beechboro Rd & Walter Rd West", "Red-Light Speed", -31.8937, 115.9039),
    ("Morley", "Benara Rd & Collier Rd", "Red-Light Speed", -31.8865, 115.9120),
    ("Morley", "Tonkin Hwy & Benara Rd", "Red-Light Speed", -31.8872, 115.9235),
    ("Mount Lawley", "Beaufort St & Walcott St", "Red-Light Speed", -31.9306, 115.8722),
    ("Murdoch", "Kwinana Freeway", "Fixed Speed", -32.0685, 115.8428),
    ("Osborne Park", "Main St & Hutton St", "Red-Light Speed", -31.9003, 115.8111),
    ("Perth", "Riverside Dr & Barrack St", "Red-Light Speed", -31.9580, 115.8589),
    ("South Perth", "Canning Hwy & Douglas Ave", "Red-Light Speed", -31.9788, 115.8590),
    ("Stirling", "Mitchell Freeway", "Fixed Speed", -31.8815, 115.8051),
    ("Subiaco", "Thomas St & Roberts Rd", "Red-Light Speed", -31.9495, 115.8249),
    ("Victoria Park", "Great Eastern Hwy & Mint St", "Red-Light Speed", -31.9765, 115.8984),
    ("Wangara", "Wanneroo Rd & Joondalup Dr", "Red-Light Speed", -31.7966, 115.8346),
    ("Willetton", "Roe Highway", "Fixed Speed", -32.0503, 115.8983),
    # Point-to-Point cameras
    ("Lake Clifton", "Forrest Hwy (Northbound)", "Point-to-Point", -32.7667, 115.6833),
    ("Binningup", "Forrest Hwy (Southbound)", "Point-to-Point", -32.9500, 115.6833),
]

def load_cameras():
    try:
        with open('cameras_database.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_cameras(cameras):
    with open('cameras_database.json', 'w') as f:
        json.dump(cameras, f, indent=2)

def main():
    print("Loading existing cameras...")
    cameras = load_cameras()
    print(f"Current camera count: {len(cameras)}")

    # Filter out any existing enforcement cameras to avoid duplicates
    cameras = [c for c in cameras if 'Speed' not in c.get('type', '') and 'Red-Light' not in c.get('type', '')]

    print(f"\nAdding {len(enforcement_cameras)} enforcement cameras...")

    # Just start with a simple counter
    camera_id = 1000

    for i, (suburb, location, cam_type, lat, lng) in enumerate(enforcement_cameras, 1):
        camera_id += 1

        # Determine owner and network
        if "Red-Light" in cam_type:
            owner = "WA Police"
            network = "WA Police Traffic Enforcement"
            purpose = "Red-light and speed enforcement"
        elif "Point-to-Point" in cam_type:
            owner = "WA Police"
            network = "WA Police Average Speed"
            purpose = "Average speed enforcement"
        else:
            owner = "WA Police"
            network = "WA Police Speed Enforcement"
            purpose = "Speed enforcement"

        camera = {
            "id": f"WAPOL-{camera_id}",
            "camera_number": f"WAPOL-{camera_id}",
            "lat": lat,
            "lng": lng,
            "type": cam_type,
            "owner": owner,
            "direction": None,  # Enforcement cameras typically cover all directions
            "coverage": "360",
            "purpose": purpose,
            "network": network,
            "suburb": suburb,
            "location": location,
            "data_source": "WA Police Traffic Cameras",
            "last_updated": "2025-10-28"
        }

        cameras.append(camera)
        print(f"  {i}. Added {cam_type} camera at {suburb} - {location}")

    print(f"\nSaving {len(cameras)} total cameras...")
    save_cameras(cameras)
    print("✓ Complete!")
    print(f"\nFinal count:")
    print(f"  - City of Perth cameras: {len([c for c in cameras if 'COP' in c['id']])}")
    print(f"  - WA Police enforcement: {len([c for c in cameras if 'WAPOL' in c['id']])}")
    print(f"  - Total: {len(cameras)}")

if __name__ == '__main__':
    main()
