// Admin panel JavaScript
const API_URL = 'https://australian-surveillance-api.onrender.com/api';
let token = localStorage.getItem('godToken');
let adminMap = null;
let tempMarker = null;
let pendingLocation = null;

// Check if already logged in
if (token) {
    verifyToken();
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            localStorage.setItem('godToken', token);
            showAdminScreen(data.user);
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        showError('Connection error. Is the server running?');
    }
});

// Verify existing token
async function verifyToken() {
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            showAdminScreen(data.user);
        } else {
            localStorage.removeItem('godToken');
            token = null;
        }
    } catch (error) {
        console.error('Token verification failed:', error);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show admin screen
function showAdminScreen(user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-screen').style.display = 'flex';
    document.getElementById('admin-header').style.display = 'flex';
    document.getElementById('user-name').textContent = `Logged in as: ${user.username}`;

    // Move header to top
    document.body.insertBefore(
        document.getElementById('admin-header'),
        document.body.firstChild
    );

    initAdminMap();
}

// Initialize admin map
function initAdminMap() {
    adminMap = L.map('admin-map').setView([-31.9505, 115.8605], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(adminMap);

    // Load existing cameras
    loadCamerasOnMap();

    // Click handler to add cameras
    adminMap.on('click', (e) => {
        handleMapClick(e.latlng);
    });
}

// Load cameras on admin map
async function loadCamerasOnMap() {
    try {
        const response = await fetch(`${API_URL}/cameras`);
        const data = await response.json();

        data.cameras.forEach(camera => {
            const color = getCameraColor(camera.type);
            const marker = L.circleMarker([camera.lat, camera.lng], {
                radius: 4,
                fillColor: color,
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(adminMap);

            marker.bindPopup(`
                <b>${camera.type}</b><br>
                ID: ${camera.id}<br>
                Owner: ${camera.owner}
            `);
        });
    } catch (error) {
        console.error('Failed to load cameras:', error);
    }
}

// Get camera color
function getCameraColor(type) {
    const colors = {
        'Traffic': '#00bfff',
        'Public Safety': '#ff3333',
        'Transit': '#00ff00',
        'Retail': '#ffa500',
        'Parks': '#da70d6',
        'LPR': '#ffff00'
    };
    return colors[type] || '#808080';
}

// Handle map click
function handleMapClick(latlng) {
    // Remove previous temporary marker
    if (tempMarker) {
        adminMap.removeLayer(tempMarker);
    }

    // Add temporary marker
    tempMarker = L.marker(latlng, {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(adminMap);

    // Store location
    pendingLocation = latlng;

    // Show form
    document.getElementById('camera-form').classList.add('active');
    document.getElementById('form-location').value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
}

// Coverage type change handler
document.getElementById('form-coverage').addEventListener('change', (e) => {
    const directionGroup = document.getElementById('direction-group');
    if (e.target.value === '360') {
        directionGroup.style.display = 'none';
        document.getElementById('form-direction').value = '';
    } else {
        directionGroup.style.display = 'block';
    }
});

// Save camera
document.getElementById('save-camera').addEventListener('click', async () => {
    if (!pendingLocation) return;

    const cameraData = {
        lat: pendingLocation.lat,
        lng: pendingLocation.lng,
        type: document.getElementById('form-type').value,
        owner: document.getElementById('form-owner').value,
        coverage: document.getElementById('form-coverage').value,
        direction: document.getElementById('form-coverage').value === 'directional'
            ? parseInt(document.getElementById('form-direction').value) || 0
            : null,
        purpose: document.getElementById('form-purpose').value,
        network: document.getElementById('form-network').value,
        suburb: document.getElementById('form-suburb').value
    };

    try {
        const response = await fetch(`${API_URL}/cameras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cameraData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Camera added successfully!');
            resetForm();
            loadCamerasOnMap(); // Reload cameras
        } else {
            alert('Error: ' + (data.error || 'Failed to add camera'));
        }
    } catch (error) {
        alert('Connection error: ' + error.message);
    }
});

// Cancel camera
document.getElementById('cancel-camera').addEventListener('click', () => {
    resetForm();
});

// Reset form
function resetForm() {
    document.getElementById('camera-form').classList.remove('active');
    if (tempMarker) {
        adminMap.removeLayer(tempMarker);
        tempMarker = null;
    }
    pendingLocation = null;

    // Clear form fields
    document.getElementById('form-type').selectedIndex = 0;
    document.getElementById('form-owner').value = '';
    document.getElementById('form-coverage').selectedIndex = 0;
    document.getElementById('form-direction').value = '';
    document.getElementById('form-purpose').value = '';
    document.getElementById('form-network').value = '';
    document.getElementById('form-suburb').value = '';
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('godToken');
    location.reload();
});
