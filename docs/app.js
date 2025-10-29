// API Configuration
const API_URL = 'https://australian-surveillance-api.onrender.com/api';

// Camera data - will be loaded from API
let cameraData = [];

// Color scheme for camera types (Distinct, easily distinguishable colors)
const cameraColors = {
    'Public Safety': '#ff0000',        // Pure Red (largest group - 711 cameras)
    'Traffic': '#0066ff',              // True Blue
    'Transit': '#00cc00',              // Green
    'Retail': '#ff9900',               // Orange
    'Parks': '#9933ff',                // Purple
    'LPR': '#ffcc00',                  // Gold/Yellow - License Plate Recognition
    'Red-Light Speed': '#ff0066',      // Pink-Red - Red-light + speed combo
    'Fixed Speed': '#ff6633',          // Orange-Red - Freeway speed cameras
    'Point-to-Point': '#00ffff',       // Cyan - Average speed cameras
    'AI Camera': '#00ff99'             // Turquoise - AI detection cameras
};

// Initialize map centered on Perth CBD
const map = L.map('map').setView([-31.9505, 115.8605], 14);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Store camera markers
let cameraMarkers = [];
let activeFilters = {
    types: new Set(Object.keys(cameraColors)),
    owners: new Set([...new Set(cameraData.map(c => c.owner))]),
    networks: new Set([...new Set(cameraData.map(c => c.network))]),
    purposes: new Set([...new Set(cameraData.map(c => c.purpose))])
};

// Create SVG icon for directional camera (cone shape)
function createDirectionalIcon(color, direction) {
    const shadowId = color.replace('#', '');
    const svgIcon = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="glow-${shadowId}">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${color};stop-opacity:0.8" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                </radialGradient>
                <filter id="beacon-glow-${shadowId}">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <g transform="rotate(${direction}, 30, 30)">
                <!-- Directional shadow cone (very prominent) -->
                <path d="M 30 30 L 15 5 A 20 20 0 0 1 45 5 Z"
                      fill="url(#glow-${shadowId})"
                      opacity="0.6"/>

                <!-- Outer glow ring -->
                <circle cx="30" cy="30" r="12"
                        fill="${color}"
                        opacity="0.3"
                        filter="url(#beacon-glow-${shadowId})"/>

                <!-- Middle glow -->
                <circle cx="30" cy="30" r="9"
                        fill="${color}"
                        opacity="0.6"
                        filter="url(#beacon-glow-${shadowId})"/>

                <!-- Bright beacon core -->
                <circle cx="30" cy="30" r="6"
                        fill="${color}"
                        stroke="#fff"
                        stroke-width="2.5"
                        filter="url(#beacon-glow-${shadowId})"/>

                <!-- Colored center -->
                <circle cx="30" cy="30" r="3.5"
                        fill="${color}"
                        opacity="1"/>

                <!-- Direction indicator arrow -->
                <path d="M 30 18 L 27 24 L 33 24 Z"
                      fill="#fff"
                      opacity="0.95"/>
            </g>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: 'camera-icon',
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        popupAnchor: [0, -30]
    });
}

// Create SVG icon for 360-degree camera (circle)
function create360Icon(color) {
    const shadowId = color.replace('#', '');
    const svgIcon = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="glow360-${shadowId}">
                    <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                    <stop offset="50%" style="stop-color:${color};stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                </radialGradient>
                <filter id="beacon-360-glow-${shadowId}">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>

            <!-- Outer 360 glow ring (very prominent) -->
            <circle cx="30" cy="30" r="22"
                    fill="url(#glow360-${shadowId})"
                    opacity="0.5"/>

            <!-- 360 coverage ring with pulse -->
            <circle cx="30" cy="30" r="18"
                    fill="none"
                    stroke="${color}"
                    stroke-width="3"
                    opacity="0.7"
                    stroke-dasharray="8,4"
                    filter="url(#beacon-360-glow-${shadowId})"/>

            <!-- Middle glow ring -->
            <circle cx="30" cy="30" r="13"
                    fill="${color}"
                    opacity="0.4"
                    filter="url(#beacon-360-glow-${shadowId})"/>

            <!-- Outer beacon ring -->
            <circle cx="30" cy="30" r="10"
                    fill="${color}"
                    opacity="0.6"
                    filter="url(#beacon-360-glow-${shadowId})"/>

            <!-- Bright beacon core -->
            <circle cx="30" cy="30" r="7"
                    fill="${color}"
                    stroke="#fff"
                    stroke-width="2.5"
                    filter="url(#beacon-360-glow-${shadowId})"/>

            <!-- Colored center -->
            <circle cx="30" cy="30" r="4"
                    fill="${color}"
                    opacity="1"/>

            <!-- 360 degree indicator dots -->
            <circle cx="30" cy="20" r="1.5" fill="#fff" opacity="0.9"/>
            <circle cx="40" cy="30" r="1.5" fill="#fff" opacity="0.9"/>
            <circle cx="30" cy="40" r="1.5" fill="#fff" opacity="0.9"/>
            <circle cx="20" cy="30" r="1.5" fill="#fff" opacity="0.9"/>
        </svg>
    `;

    return L.divIcon({
        html: svgIcon,
        className: 'camera-icon-360',
        iconSize: [60, 60],
        iconAnchor: [30, 30],
        popupAnchor: [0, -30]
    });
}

// Get appropriate emoticon for camera purpose
function getPurposeEmoticon(purpose) {
    if (!purpose) return '';

    const purposeLower = purpose.toLowerCase();

    // Traffic related
    if (purposeLower.includes('traffic')) return '🚦';
    if (purposeLower.includes('speed')) return '⚡';
    if (purposeLower.includes('red-light') || purposeLower.includes('red light')) return '🚨';

    // AI detection
    if (purposeLower.includes('mobile phone') || purposeLower.includes('phone')) return '📱';
    if (purposeLower.includes('seatbelt')) return '🔒';
    if (purposeLower.includes('ai detection')) return '🤖';

    // Safety and security
    if (purposeLower.includes('safety') || purposeLower.includes('security')) return '👁️';
    if (purposeLower.includes('surveillance')) return '📹';

    // Transit
    if (purposeLower.includes('transit') || purposeLower.includes('train') || purposeLower.includes('bus')) return '🚇';

    // Retail
    if (purposeLower.includes('retail') || purposeLower.includes('store') || purposeLower.includes('shop')) return '🏪';

    // Parks
    if (purposeLower.includes('park') || purposeLower.includes('recreation')) return '🌳';

    // License plate
    if (purposeLower.includes('license plate') || purposeLower.includes('lpr') || purposeLower.includes('anpr')) return '🔍';

    // Enforcement
    if (purposeLower.includes('enforcement')) return '⚠️';

    // Average speed / point-to-point
    if (purposeLower.includes('average')) return '📊';

    // Default
    return '📷';
}

// Create popup content for camera
function createPopupContent(camera) {
    const purposeEmoji = getPurposeEmoticon(camera.purpose);
    const coverageText = camera.coverage === '360' ? '360° Omnidirectional' : `Directional (${camera.direction}°)`;
    const locationText = camera.location || `${camera.lat.toFixed(4)}, ${camera.lng.toFixed(4)}`;

    return `
        <div class="camera-popup">
            <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem; color: #2c3e50;">
                ${camera.network || 'Unknown Network'}
            </div>
            <div style="margin-bottom: 0.5rem; color: #555;">
                ${purposeEmoji} ${camera.purpose || 'Unknown purpose'}
            </div>
            <div class="info-row">
                <span class="info-label">Owner:</span>
                <span class="info-value">${camera.owner || 'Unknown'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Coverage:</span>
                <span class="info-value">${coverageText}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${locationText}</span>
            </div>
        </div>
    `;
}

// Add camera to map
function addCameraMarker(camera) {
    const color = cameraColors[camera.type];
    const icon = camera.coverage === '360'
        ? create360Icon(color)
        : createDirectionalIcon(color, camera.direction);

    const marker = L.marker([camera.lat, camera.lng], { icon: icon })
        .bindPopup(createPopupContent(camera));

    marker.cameraData = camera;
    cameraMarkers.push(marker);

    return marker;
}

// Load cameras from API
async function loadCamerasFromAPI() {
    try {
        const response = await fetch(`${API_URL}/cameras`);
        const data = await response.json();
        cameraData = data.cameras;
        console.log(`Loaded ${cameraData.length} cameras from API`);
        return true;
    } catch (error) {
        console.error('Failed to load cameras from API:', error);
        console.log('Using offline mode...');
        return false;
    }
}

// Initialize cameras on map
function initializeCameras() {
    // Clear existing markers
    cameraMarkers.forEach(marker => map.removeLayer(marker));
    cameraMarkers = [];

    // Add cameras to map
    cameraData.forEach(camera => {
        const marker = addCameraMarker(camera);
        marker.addTo(map);
    });

    // Update active filters based on available data
    activeFilters.types = new Set(cameraData.map(c => c.type).filter(Boolean));
    activeFilters.owners = new Set(cameraData.map(c => c.owner).filter(Boolean));
    activeFilters.networks = new Set(cameraData.map(c => c.network).filter(Boolean));
    activeFilters.purposes = new Set(cameraData.map(c => c.purpose).filter(Boolean));

    updateStats();
}

// Update statistics
function updateStats() {
    const visibleCameras = cameraMarkers.filter(marker => {
        const camera = marker.cameraData;
        return activeFilters.types.has(camera.type) &&
               activeFilters.owners.has(camera.owner) &&
               activeFilters.networks.has(camera.network) &&
               activeFilters.purposes.has(camera.purpose);
    }).length;

    document.getElementById('total-cameras').textContent = cameraData.length;
    document.getElementById('visible-cameras').textContent = visibleCameras;
}

// Apply filters
function applyFilters() {
    cameraMarkers.forEach(marker => {
        const camera = marker.cameraData;
        const shouldShow = activeFilters.types.has(camera.type) &&
                          activeFilters.owners.has(camera.owner) &&
                          activeFilters.networks.has(camera.network) &&
                          activeFilters.purposes.has(camera.purpose);

        if (shouldShow) {
            if (!map.hasLayer(marker)) {
                marker.addTo(map);
            }
        } else {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });

    updateStats();
}

// Create filter UI
function createFilters() {
    // Type filters - dynamically create from actual camera data
    const typeFiltersContainer = document.getElementById('type-filters');
    typeFiltersContainer.innerHTML = ''; // Clear existing

    // Get unique camera types from actual data
    const uniqueTypes = [...new Set(cameraData.map(c => c.type).filter(Boolean))];

    uniqueTypes.forEach(type => {
        const color = cameraColors[type] || '#808080';
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-type-${type}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters.types.add(type);
            } else {
                activeFilters.types.delete(type);
            }
            applyFilters();
        });

        const colorIndicator = document.createElement('div');
        colorIndicator.className = 'color-indicator';
        colorIndicator.style.backgroundColor = color;

        const label = document.createElement('label');
        label.htmlFor = `filter-type-${type}`;
        label.textContent = type;

        filterItem.appendChild(checkbox);
        filterItem.appendChild(colorIndicator);
        filterItem.appendChild(label);
        typeFiltersContainer.appendChild(filterItem);
    });

    // Owner filters - dynamically create from actual camera data
    const ownerFiltersContainer = document.getElementById('owner-filters');
    ownerFiltersContainer.innerHTML = ''; // Clear existing

    const owners = [...new Set(cameraData.map(c => c.owner).filter(Boolean))].sort();
    owners.forEach(owner => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-owner-${owner.replace(/\s+/g, '-')}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters.owners.add(owner);
            } else {
                activeFilters.owners.delete(owner);
            }
            applyFilters();
        });

        const label = document.createElement('label');
        label.htmlFor = `filter-owner-${owner.replace(/\s+/g, '-')}`;
        label.textContent = owner;

        filterItem.appendChild(checkbox);
        filterItem.appendChild(label);
        ownerFiltersContainer.appendChild(filterItem);
    });

    // Network filters - dynamically create from actual camera data
    const networkFiltersContainer = document.getElementById('network-filters');
    networkFiltersContainer.innerHTML = ''; // Clear existing

    const networks = [...new Set(cameraData.map(c => c.network).filter(Boolean))].sort();
    networks.forEach(network => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-network-${network.replace(/\s+/g, '-')}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters.networks.add(network);
            } else {
                activeFilters.networks.delete(network);
            }
            applyFilters();
        });

        const label = document.createElement('label');
        label.htmlFor = `filter-network-${network.replace(/\s+/g, '-')}`;
        label.textContent = network;

        filterItem.appendChild(checkbox);
        filterItem.appendChild(label);
        networkFiltersContainer.appendChild(filterItem);
    });

    // Purpose filters - dynamically create from actual camera data
    const purposeFiltersContainer = document.getElementById('purpose-filters');
    purposeFiltersContainer.innerHTML = ''; // Clear existing

    const purposes = [...new Set(cameraData.map(c => c.purpose).filter(Boolean))].sort();
    purposes.forEach(purpose => {
        const filterItem = document.createElement('div');
        filterItem.className = 'filter-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `filter-purpose-${purpose.replace(/\s+/g, '-')}`;
        checkbox.checked = true;
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                activeFilters.purposes.add(purpose);
            } else {
                activeFilters.purposes.delete(purpose);
            }
            applyFilters();
        });

        const label = document.createElement('label');
        label.htmlFor = `filter-purpose-${purpose.replace(/\s+/g, '-')}`;
        label.textContent = purpose;

        filterItem.appendChild(checkbox);
        filterItem.appendChild(label);
        purposeFiltersContainer.appendChild(filterItem);
    });
}

// Perth and Western Australia suburbs for search functionality
// Expandable to all of Australia with postcode support
const perthSuburbs = [
    // CBD and Inner Suburbs
    { name: 'Perth', postcode: '6000', lat: -31.9505, lng: 115.8605 },
    { name: 'Northbridge', postcode: '6003', lat: -31.9467, lng: 115.8549 },
    { name: 'West Perth', postcode: '6005', lat: -31.9485, lng: 115.8423 },
    { name: 'East Perth', postcode: '6004', lat: -31.9560, lng: 115.8715 },
    { name: 'North Perth', postcode: '6006', lat: -31.9341, lng: 115.8548 },
    { name: 'Highgate', postcode: '6003', lat: -31.9365, lng: 115.8725 },
    { name: 'Mount Lawley', postcode: '6050', lat: -31.9328, lng: 115.8728 },
    { name: 'Leederville', postcode: '6007', lat: -31.9383, lng: 115.8411 },
    { name: 'Subiaco', postcode: '6008', lat: -31.9482, lng: 115.8254 },
    { name: 'Shenton Park', postcode: '6008', lat: -31.9596, lng: 115.7997 },
    { name: 'Claremont', postcode: '6010', lat: -31.9813, lng: 115.7803 },
    { name: 'Cottesloe', postcode: '6011', lat: -31.9959, lng: 115.7628 },
    { name: 'Nedlands', postcode: '6009', lat: -31.9771, lng: 115.8058 },
    { name: 'Dalkeith', postcode: '6009', lat: -31.9977, lng: 115.7996 },
    { name: 'Crawley', postcode: '6009', lat: -31.9820, lng: 115.8181 },
    { name: 'South Perth', postcode: '6151', lat: -31.9731, lng: 115.8633 },
    { name: 'Como', postcode: '6152', lat: -31.9956, lng: 115.8702 },
    { name: 'Manning', postcode: '6152', lat: -32.0092, lng: 115.8676 },
    { name: 'Waterford', postcode: '6152', lat: -32.0181, lng: 115.8820 },

    // North - City of Stirling
    { name: 'Balcatta', postcode: '6021', lat: -31.8753, lng: 115.8227 },
    { name: 'Balga', postcode: '6061', lat: -31.8616, lng: 115.8375 },
    { name: 'Carine', postcode: '6020', lat: -31.8512, lng: 115.7833 },
    { name: 'Dianella', postcode: '6059', lat: -31.8897, lng: 115.8646 },
    { name: 'Doubleview', postcode: '6018', lat: -31.8981, lng: 115.7857 },
    { name: 'Inglewood', postcode: '6052', lat: -31.9193, lng: 115.8868 },
    { name: 'Innaloo', postcode: '6018', lat: -31.8946, lng: 115.8018 },
    { name: 'Mirrabooka', postcode: '6061', lat: -31.8645, lng: 115.8633 },
    { name: 'Scarborough', postcode: '6019', lat: -31.8944, lng: 115.7619 },
    { name: 'Stirling', postcode: '6021', lat: -31.8815, lng: 115.8051 },
    { name: 'Tuart Hill', postcode: '6060', lat: -31.9005, lng: 115.8361 },
    { name: 'Osborne Park', postcode: '6017', lat: -31.9004, lng: 115.8111 },
    { name: 'Glendalough', postcode: '6016', lat: -31.9193, lng: 115.8213 },
    { name: 'Joondanna', postcode: '6060', lat: -31.9210, lng: 115.8459 },
    { name: 'Nollamara', postcode: '6061', lat: -31.8773, lng: 115.8496 },
    { name: 'Westminster', postcode: '6061', lat: -31.8678, lng: 115.8348 },
    { name: 'Yokine', postcode: '6060', lat: -31.9023, lng: 115.8501 },
    { name: 'Menora', postcode: '6050', lat: -31.9192, lng: 115.8801 },

    // North - City of Joondalup
    { name: 'Joondalup', postcode: '6027', lat: -31.7448, lng: 115.7661 },
    { name: 'Beldon', postcode: '6027', lat: -31.7734, lng: 115.7628 },
    { name: 'Craigie', postcode: '6025', lat: -31.7742, lng: 115.7761 },
    { name: 'Currambine', postcode: '6028', lat: -31.7363, lng: 115.7427 },
    { name: 'Edgewater', postcode: '6027', lat: -31.7607, lng: 115.7837 },
    { name: 'Hillarys', postcode: '6025', lat: -31.8159, lng: 115.7428 },
    { name: 'Kallaroo', postcode: '6025', lat: -31.7896, lng: 115.7529 },
    { name: 'Kingsley', postcode: '6026', lat: -31.8074, lng: 115.7906 },
    { name: 'Mullaloo', postcode: '6027', lat: -31.8276, lng: 115.7417 },
    { name: 'Warwick', postcode: '6024', lat: -31.8393, lng: 115.8011 },
    { name: 'Duncraig', postcode: '6023', lat: -31.8321, lng: 115.7740 },
    { name: 'Greenwood', postcode: '6024', lat: -31.8329, lng: 115.7991 },
    { name: 'Padbury', postcode: '6025', lat: -31.8079, lng: 115.7632 },
    { name: 'Sorrento', postcode: '6020', lat: -31.8275, lng: 115.7524 },
    { name: 'Marmion', postcode: '6020', lat: -31.8460, lng: 115.7577 },
    { name: 'Woodvale', postcode: '6026', lat: -31.7929, lng: 115.7906 },

    // North - City of Wanneroo
    { name: 'Wanneroo', lat: -31.7475, lng: 115.8035 },
    { name: 'Alkimos', lat: -31.6288, lng: 115.6835 },
    { name: 'Butler', lat: -31.6551, lng: 115.7127 },
    { name: 'Clarkson', lat: -31.6757, lng: 115.7234 },
    { name: 'Yanchep', lat: -31.5488, lng: 115.6343 },
    { name: 'Two Rocks', lat: -31.4951, lng: 115.5878 },
    { name: 'Girrawheen', lat: -31.8444, lng: 115.8404 },
    { name: 'Koondoola', lat: -31.8469, lng: 115.8633 },

    // East Suburbs
    { name: 'Belmont', lat: -31.9521, lng: 115.9271 },
    { name: 'Victoria Park', lat: -31.9786, lng: 115.8970 },
    { name: 'Burswood', lat: -31.9612, lng: 115.9040 },
    { name: 'Rivervale', lat: -31.9641, lng: 115.9136 },
    { name: 'Ascot', lat: -31.9293, lng: 115.9287 },
    { name: 'Redcliffe', lat: -31.9374, lng: 115.9454 },
    { name: 'Midland', lat: -31.8914, lng: 116.0135 },
    { name: 'Kalamunda', lat: -31.9754, lng: 116.0574 },

    // South - City of Fremantle
    { name: 'Fremantle', lat: -32.0569, lng: 115.7439 },
    { name: 'South Fremantle', lat: -32.0667, lng: 115.7584 },
    { name: 'North Fremantle', lat: -32.0425, lng: 115.7519 },
    { name: 'Beaconsfield', lat: -32.0595, lng: 115.7659 },

    // South - City of Cockburn
    { name: 'Cockburn', lat: -32.1192, lng: 115.8485 },
    { name: 'Bibra Lake', lat: -32.0980, lng: 115.8281 },
    { name: 'Coolbellup', lat: -32.0843, lng: 115.8233 },
    { name: 'Hamilton Hill', lat: -32.0741, lng: 115.7817 },
    { name: 'Spearwood', lat: -32.1070, lng: 115.7825 },
    { name: 'Coogee', lat: -32.1196, lng: 115.7685 },
    { name: 'Munster', lat: -32.1341, lng: 115.7935 },
    { name: 'Success', lat: -32.1520, lng: 115.8563 },
    { name: 'Hammond Park', lat: -32.1690, lng: 115.8702 },

    // South - City of Rockingham
    { name: 'Rockingham', lat: -32.2771, lng: 115.7303 },
    { name: 'Baldivis', lat: -32.3293, lng: 115.8244 },
    { name: 'Port Kennedy', lat: -32.3679, lng: 115.7525 },
    { name: 'Safety Bay', lat: -32.3039, lng: 115.7185 },
    { name: 'Waikiki', lat: -32.3119, lng: 115.7577 },
    { name: 'Warnbro', lat: -32.3384, lng: 115.7603 },
    { name: 'Secret Harbour', lat: -32.4027, lng: 115.7565 },
    { name: 'Golden Bay', lat: -32.4262, lng: 115.7593 },

    // South - City of Mandurah
    { name: 'Mandurah', lat: -32.5269, lng: 115.7217 },
    { name: 'Halls Head', lat: -32.5498, lng: 115.6999 },
    { name: 'Meadow Springs', lat: -32.4958, lng: 115.7530 },
    { name: 'Falcon', lat: -32.5864, lng: 115.6662 },
    { name: 'Dawesville', lat: -32.6419, lng: 115.6337 },
    { name: 'Greenfields', lat: -32.5239, lng: 115.7619 },
    { name: 'Lakelands', lat: -32.4609, lng: 115.7907 }
];

// Greyscale toggle functionality
function setupGreyscaleToggle() {
    const toggle = document.getElementById('greyscale-toggle');
    const mapElement = document.getElementById('map');

    toggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            mapElement.classList.add('greyscale');
            console.log('Greyscale mode enabled - only map tiles affected, cameras stay colored');
        } else {
            mapElement.classList.remove('greyscale');
            console.log('Greyscale mode disabled');
        }
    });
}

// Expose loadCameras function globally for god-mode.js to call after updates
window.loadCameras = async function() {
    await loadCamerasFromAPI();
    createFilters();
    initializeCameras();
};

// Location search functionality with postcode support
function setupLocationSearch() {
    const searchInput = document.getElementById('location-search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }

        // Filter suburbs matching the query (search both name and postcode)
        const matches = perthSuburbs.filter(suburb =>
            suburb.name.toLowerCase().includes(query) ||
            (suburb.postcode && suburb.postcode.includes(query))
        ).slice(0, 8); // Limit to 8 results

        if (matches.length > 0) {
            searchResults.innerHTML = matches.map(suburb =>
                `<div class="search-result-item" data-lat="${suburb.lat}" data-lng="${suburb.lng}">
                    <strong>${suburb.name}</strong>${suburb.postcode ? ` <span style="color: #999;">(${suburb.postcode})</span>` : ''}
                </div>`
            ).join('');
            searchResults.classList.add('active');

            // Add click handlers to results
            searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const lat = parseFloat(item.dataset.lat);
                    const lng = parseFloat(item.dataset.lng);
                    map.setView([lat, lng], 15);
                    searchResults.classList.remove('active');
                    searchInput.value = item.textContent.trim();
                });
            });
        } else {
            searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
            searchResults.classList.add('active');
        }
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

// Initialize the application
async function init() {
    console.log('Initializing Australian Surveillance...');

    // Load camera data from API first
    await loadCamerasFromAPI();

    console.log(`Loaded ${cameraData.length} cameras from API`);

    // Log camera type breakdown
    const typeCounts = {};
    cameraData.forEach(c => {
        typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    console.log('Camera types:', typeCounts);

    // Initialize map and UI AFTER data is loaded
    createFilters();
    initializeCameras();
    setupGreyscaleToggle();
    setupLocationSearch();

    console.log(`Application ready! ${cameraData.length} cameras displayed.`);
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
