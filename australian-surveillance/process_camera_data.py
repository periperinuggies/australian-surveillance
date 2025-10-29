#!/usr/bin/env python3
"""
Process camera data from various sources and convert to standardized format.
Converts Web Mercator (EPSG:3857) to WGS84 (EPSG:4326) coordinates.
"""

import csv
import json
import math

def webmercator_to_latlng(x, y):
    """Convert Web Mercator coordinates to WGS84 lat/lng"""
    lng = (x / 20037508.34) * 180
    lat = (y / 20037508.34) * 180
    lat = 180 / math.pi * (2 * math.atan(math.exp(lat * math.pi / 180)) - math.pi / 2)
    return lat, lng

def process_city_of_perth_cameras(csv_file):
    """Process City of Perth camera CSV data"""
    cameras = []

    with open(csv_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                x = float(row['x'])
                y = float(row['y'])
                lat, lng = webmercator_to_latlng(x, y)

                camera = {
                    'id': f"COP-{row['Camera Number']}",
                    'camera_number': row['Camera Number'],
                    'lat': round(lat, 6),
                    'lng': round(lng, 6),
                    'type': 'Public Safety',  # Most City of Perth cameras are for public safety
                    'owner': 'City of Perth',
                    'direction': None,  # Not provided in dataset
                    'coverage': '360',  # Assume 360 unless specified
                    'purpose': 'Public safety monitoring',
                    'network': 'City of Perth CityWatch',
                    'suburb': 'Perth CBD',  # Most are in CBD, would need geocoding for exact suburb
                    'data_source': 'City of Perth Open Data',
                    'last_updated': '2025-10-28'
                }
                cameras.append(camera)
            except (ValueError, KeyError) as e:
                print(f"Error processing row: {e}")
                continue

    return cameras

def save_cameras_json(cameras, output_file):
    """Save cameras to JSON file"""
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(cameras, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(cameras)} cameras to {output_file}")

def main():
    print("Processing camera data...")

    # Process City of Perth cameras
    perth_cameras = process_city_of_perth_cameras('perth_cameras_raw.csv')
    print(f"Processed {len(perth_cameras)} City of Perth cameras")

    # Save to JSON
    save_cameras_json(perth_cameras, 'cameras_database.json')

    # Print sample
    if perth_cameras:
        print("\nSample camera:")
        print(json.dumps(perth_cameras[0], indent=2))

if __name__ == '__main__':
    main()
