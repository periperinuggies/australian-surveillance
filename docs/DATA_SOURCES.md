# Data Sources and Research Findings

## Australian Surveillance - Perth Camera Data Research

**Research Date:** October 28, 2025

---

## Summary

This document details all research conducted to identify publicly available surveillance camera data sources across Greater Perth, Western Australia. The goal was to create a comprehensive, accurate map of surveillance cameras to increase public awareness and transparency.

---

## Confirmed Data Sources

### 1. City of Perth - **IMPLEMENTED ✓**

**Status:** Successfully integrated - 711 cameras

**Source:** City of Perth Open Data Initiative
- **URL:** https://geohub-perth.opendata.arcgis.com/datasets/perth::security-cameras-2
- **Format:** CSV, GeoJSON, Shapefile
- **License:** Creative Commons Attribution 4.0
- **Coverage:** Perth CBD and City of Perth local government area
- **Last Updated:** October 9, 2025
- **Data Fields:**
  - Camera Number (e.g., CL002, CL003)
  - Coordinates (Web Mercator projection)
  - General location information

**Notes:**
- Coordinates were converted from Web Mercator (EPSG:3857) to WGS84 (EPSG:4326)
- Dataset represents general locations, not exact placements
- No direction/orientation data provided
- Primarily public safety cameras from the CityWatch network

---

## Main Roads Western Australia (Traffic Cameras)

**Status:** API identified but requires further work

**Source:** Main Roads WA Open Data Portal
- **URLs:**
  - https://portal-mainroads.opendata.arcgis.com/datasets/588175fda8ae48dba1dc51b3d9493746_2
  - https://trafficmap.mainroads.wa.gov.au
- **License:** Creative Commons Attribution 4.0
- **Coverage:** State road network across Perth metropolitan area
- **Camera Types:** Traffic monitoring and journey planning
- **Live Feeds:** Available through TraffiCam system

**Implementation Notes:**
- Cameras installed at strategic locations on major roads
- Provides live traffic vision for public journey planning
- Separate from speed/red-light enforcement cameras
- API endpoint needs verification for GeoJSON export

**Next Steps:**
- Verify correct ArcGIS REST API endpoint
- Download and process traffic camera locations
- Map to major intersections and highways

---

## Transperth (Public Transport)

**Status:** Confirmed exists, no public dataset

**Coverage:** All 83 train stations across 8 lines
- Airport Line
- Armadale Line
- Ellenbrook Line
- Fremantle Line
- Mandurah Line
- Midland Line
- Thornlie-Cockburn Line
- Yanchep Line

**Camera Infrastructure:**
- Thousands of CCTV cameras across the entire network
- Every train station has CCTV coverage
- Coverage includes platforms, car parks, and surrounding areas
- 24/7 monitoring from central control room
- Hundreds of trained Transit Officers

**Data Availability:**
- No publicly available dataset with specific locations
- Information withheld for security reasons
- Station lists are public, but camera counts/locations are not

**Recommendation:**
- Create estimated camera locations for all 83 stations
- Mark as "Transit" type with generic coverage areas
- Note in metadata that locations are estimated

---

## Council-by-Council Breakdown

### City of Stirling

**Coverage:** 600+ fixed CCTV cameras at 39 strategic locations
**Additional:** Body-worn cameras, vehicle-mounted cameras, 5 mobile CCTV units
**Features:** ANPR-enabled cameras for vehicle identification
**Registration:** Cam-Map WA state register
**Rebate Program:** 30% off (up to $500) for residents installing public-facing cameras

**Data Availability:** No open dataset found

---

### City of Joondalup

**Coverage:** CBD and suburbs with variety of public spaces
**Mobile Units:** 3 mobile CCTV units deployed (Hepburn Ave, Whitfords Ave, Mullaloo Drive)
**Registration:** Cam-Map WA
**Purpose:** Deter criminal activity, record suspicious activities, assist WA Police

**Data Availability:** No open dataset found
**Access:** Footage restricted to legal proceedings and FOI requests

---

### City of Wanneroo

**Coverage:** Wangara Industrial Estate (Smart City Technology project)
**Mobile Units:** 3 mobile CCTV poles
**Registration:** Cam-Map WA
**Special Feature:** Wangara CCTV network map available

**Data Availability:**
- Wangara CCTV network map (JPG format) at:
  https://www.wanneroo.wa.gov.au/downloads/file/4448/wangara_cctv_network_map

**Next Steps:** Download and digitize map coordinates

---

### City of Cockburn

**Coverage:** 700+ cameras total
- 500 fixed security cameras
- 12 rapid deployment kits
- 30 mobile cameras

**Registration:** Cam-Map WA
**Rebate Program:** Up to 50% ($500 max) for residential CCTV
**Access:** Footage only released to police upon request

**Data Availability:** No open dataset found

---

### City of Fremantle

**Status:** Research needed
**Area:** Fremantle, South Fremantle, North Fremantle, Beaconsfield, etc.

---

### City of Rockingham

**Status:** Research needed
**Coverage:** Baldivis, Rockingham, Port Kennedy, Safety Bay, etc.

---

### City of Mandurah

**Status:** Research needed
**Coverage:** Mandurah, Halls Head, Meadow Springs, Falcon, etc.

---

## WA Police Force Cameras

**Status:** Locations not publicly disclosed

**Types:**
1. **Speed Cameras:** Locations published separately
2. **Red-Light Cameras:** Locations published separately
3. **Public Safety CCTV:** Undisclosed locations for security

**Source for Enforcement Cameras:**
- https://www.police.wa.gov.au/Traffic/Cameras/Camera-locations

**Cam-Map WA:**
- Statewide voluntary registration system
- Operated by WA Police Force
- Not a public dataset of police cameras
- Registry for private/commercial cameras that capture public areas

**Implementation:**
- Can add enforcement camera locations (speed/red-light)
- Public safety CCTV locations likely confidential

---

## Data Gaps and Limitations

### Missing Official Datasets

Most councils do not publish camera locations as open data due to:
1. **Security concerns:** Detailed infrastructure data could be exploited
2. **Privacy regulations:** Balance between transparency and safety
3. **Operational security:** Effectiveness may be reduced if locations are widely known

### Cam-Map WA

- **Purpose:** Voluntary registration for private/commercial cameras
- **Access:** Restricted to WA Police and authorized agencies
- **Not Public:** Cannot be used as a data source for this project
- **Scope:** Primarily private sector and residential cameras

### Recommended Approach

1. **Use Official Open Data:** City of Perth dataset (implemented)
2. **Public Infrastructure:** Main Roads traffic cameras (pending)
3. **Estimated Locations:** Transperth stations with generic coverage
4. **User Submissions:** God account can add discovered cameras
5. **Community Verification:** Future feature to allow public submissions with moderation

---

## Future Data Integration Priorities

### High Priority
1. **Main Roads WA Traffic Cameras** - Public data available, needs integration
2. **Transperth Station Cameras** - Create estimated locations for all 83 stations
3. **City of Wanneroo (Wangara)** - Digitize the network map

### Medium Priority
4. **City of Stirling** - FOI request for general locations (39 strategic locations)
5. **City of Joondalup** - Document 3 known mobile unit locations
6. **City of Cockburn** - General area coverage map

### Low Priority (User Submissions)
7. **Retail/Private Cameras** - Shopping centers, businesses
8. **Residential Cameras** - Registered on Cam-Map WA
9. **Other Councils** - Fremantle, Rockingham, Mandurah, etc.

---

## Data Quality and Accuracy

### City of Perth Data (711 cameras)
- **Accuracy:** Official government data
- **Precision:** General locations (±10-50m estimated)
- **Completeness:** Represents City of Perth network as of Oct 2025
- **Limitations:**
  - No direction/orientation data
  - No camera type classification
  - No coverage area specifications

### User-Submitted Data
- **Verification:** God account required for submissions
- **Metadata:** All submissions tagged with source and date
- **Quality Control:** Manual review by administrators

---

## Privacy and Ethical Considerations

This project aims to increase transparency around public surveillance:

1. **Public Information Only:** Only publicly visible cameras
2. **No Footage Access:** Does not access or display camera feeds
3. **Transparency Goal:** Help public understand surveillance extent
4. **Privacy Rights:** Supports informed consent for public space usage
5. **Security Balance:** Does not compromise legitimate security operations

---

## Technical Notes

### Coordinate Systems
- **Source Data:** Web Mercator (EPSG:3857)
- **Application:** WGS84 (EPSG:4326) - standard lat/lng
- **Conversion:** Python script with math library

### Data Processing
- CSV to JSON conversion
- Coordinate transformation
- Standardized schema across all sources
- Metadata enrichment (source, date, confidence)

---

## Update Schedule

**Recommended Frequency:**
- **City of Perth:** Quarterly (check for dataset updates)
- **Main Roads WA:** Bi-annually (traffic cameras change infrequently)
- **Transperth:** Annually (station infrastructure changes rarely)
- **User Submissions:** Real-time (god account additions)

---

## Contact and Resources

### Data Providers
- **City of Perth Open Data:** https://geohub-perth.opendata.arcgis.com
- **Main Roads WA:** https://portal-mainroads.opendata.arcgis.com
- **WA Data Catalogue:** https://catalogue.data.wa.gov.au

### Research Tools
- ArcGIS REST API documentation
- OpenStreetMap (base mapping)
- Leaflet.js (interactive maps)

---

**Last Updated:** October 28, 2025
**Researcher:** AI-assisted data compilation
**Status:** Ongoing research and integration
