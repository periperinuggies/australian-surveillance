// God Mode Modal Management
// API_URL is already defined in app.js

class GodMode {
    constructor() {
        this.token = localStorage.getItem('godToken');
        this.cameras = [];
        this.filteredCameras = [];
        this.currentCamera = null;

        // Active filters
        this.activeFilters = {
            type: '',
            owner: '',
            network: '',
            purpose: ''
        };

        this.initElements();
        this.attachEventListeners();

        // Check if already logged in
        if (this.token) {
            this.verifyToken();
        }
    }

    initElements() {
        this.modal = document.getElementById('god-modal');
        this.closeBtn = document.getElementById('god-modal-close');
        this.loginScreen = document.getElementById('god-login-screen');
        this.dashboard = document.getElementById('god-dashboard');
        this.editForm = document.getElementById('god-edit-form');
        this.errorDiv = document.getElementById('god-error');
        this.cameraListContainer = document.getElementById('god-camera-list-container');
        this.searchInput = document.getElementById('god-search');
    }

    attachEventListeners() {
        // God Mode button in header
        const godModeBtn = document.getElementById('god-mode-btn');
        if (godModeBtn) {
            godModeBtn.addEventListener('click', () => this.openModal());
        }

        // Close modal
        this.closeBtn.addEventListener('click', () => this.closeModal());

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Login form
        document.getElementById('god-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Search
        this.searchInput.addEventListener('input', () => this.filterCameras());

        // Filter dropdowns
        document.getElementById('god-filter-type').addEventListener('change', (e) => {
            this.activeFilters.type = e.target.value;
            this.filterCameras();
        });
        document.getElementById('god-filter-owner').addEventListener('change', (e) => {
            this.activeFilters.owner = e.target.value;
            this.filterCameras();
        });
        document.getElementById('god-filter-network').addEventListener('change', (e) => {
            this.activeFilters.network = e.target.value;
            this.filterCameras();
        });
        document.getElementById('god-filter-purpose').addEventListener('change', (e) => {
            this.activeFilters.purpose = e.target.value;
            this.filterCameras();
        });

        // Add camera button
        document.getElementById('god-add-camera-btn').addEventListener('click', () => {
            this.showAddCameraForm();
        });

        // Bulk operations
        document.getElementById('god-show-bulk-btn').addEventListener('click', () => {
            this.showBulkPanel();
        });
        document.getElementById('god-bulk-cancel-btn').addEventListener('click', () => {
            this.hideBulkPanel();
        });
        document.getElementById('god-bulk-delete-btn').addEventListener('click', () => {
            this.bulkDelete();
        });

        // Camera form
        document.getElementById('god-camera-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCamera();
        });
        document.getElementById('god-form-cancel').addEventListener('click', () => {
            this.showDashboard();
        });
        document.getElementById('god-form-delete').addEventListener('click', () => {
            this.deleteCamera();
        });
    }

    openModal() {
        this.modal.classList.add('active');
        if (this.token) {
            this.loadCameras();
        }
    }

    closeModal() {
        this.modal.classList.remove('active');
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.style.display = 'block';
        setTimeout(() => {
            this.errorDiv.style.display = 'none';
        }, 5000);
    }

    async login() {
        const username = document.getElementById('god-username').value;
        const password = document.getElementById('god-password').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.token = data.token;
                localStorage.setItem('godToken', this.token);
                this.showDashboard();
                this.loadCameras();
            } else {
                this.showError(data.error || 'Login failed');
            }
        } catch (error) {
            this.showError('Connection error. Is the server running?');
        }
    }

    async verifyToken() {
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (!response.ok) {
                localStorage.removeItem('godToken');
                this.token = null;
            }
        } catch (error) {
            console.error('Token verification failed:', error);
        }
    }

    async loadCameras() {
        try {
            const response = await fetch(`${API_URL}/cameras`);
            const data = await response.json();
            this.cameras = data.cameras;
            this.filteredCameras = [...this.cameras];
            this.updateStats();
            this.renderCameraList();
            this.populateTypeLists();
        } catch (error) {
            console.error('Failed to load cameras:', error);
            this.showError('Failed to load cameras');
        }
    }

    updateStats() {
        const totalCameras = this.cameras.length;
        const cameraTypes = [...new Set(this.cameras.map(c => c.type).filter(Boolean))].length;
        const networks = [...new Set(this.cameras.map(c => c.network).filter(Boolean))].length;

        document.getElementById('god-stat-total').textContent = totalCameras;
        document.getElementById('god-stat-types').textContent = cameraTypes;
        document.getElementById('god-stat-networks').textContent = networks;
    }

    populateTypeLists() {
        const types = [...new Set(this.cameras.map(c => c.type).filter(Boolean))].sort();
        const owners = [...new Set(this.cameras.map(c => c.owner).filter(Boolean))].sort();
        const networks = [...new Set(this.cameras.map(c => c.network).filter(Boolean))].sort();
        const purposes = [...new Set(this.cameras.map(c => c.purpose).filter(Boolean))].sort();

        // Populate bulk delete dropdown
        const bulkTypeSelect = document.getElementById('god-bulk-type');
        bulkTypeSelect.innerHTML = '<option value="">Select camera type...</option>';
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            bulkTypeSelect.appendChild(option);
        });

        // Populate type datalist for form
        const typeDatalist = document.getElementById('god-type-list');
        typeDatalist.innerHTML = '';
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            typeDatalist.appendChild(option);
        });

        // Populate filter dropdowns
        const filterTypeSelect = document.getElementById('god-filter-type');
        filterTypeSelect.innerHTML = '<option value="">All Types</option>';
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            filterTypeSelect.appendChild(option);
        });

        const filterOwnerSelect = document.getElementById('god-filter-owner');
        filterOwnerSelect.innerHTML = '<option value="">All Owners</option>';
        owners.forEach(owner => {
            const option = document.createElement('option');
            option.value = owner;
            option.textContent = owner;
            filterOwnerSelect.appendChild(option);
        });

        const filterNetworkSelect = document.getElementById('god-filter-network');
        filterNetworkSelect.innerHTML = '<option value="">All Networks</option>';
        networks.forEach(network => {
            const option = document.createElement('option');
            option.value = network;
            option.textContent = network;
            filterNetworkSelect.appendChild(option);
        });

        const filterPurposeSelect = document.getElementById('god-filter-purpose');
        filterPurposeSelect.innerHTML = '<option value="">All Purposes</option>';
        purposes.forEach(purpose => {
            const option = document.createElement('option');
            option.value = purpose;
            option.textContent = purpose;
            filterPurposeSelect.appendChild(option);
        });
    }

    filterCameras() {
        const query = this.searchInput.value.toLowerCase();

        this.filteredCameras = this.cameras.filter(camera => {
            // Text search filter
            const matchesSearch = !query || (
                camera.id?.toLowerCase().includes(query) ||
                camera.type?.toLowerCase().includes(query) ||
                camera.owner?.toLowerCase().includes(query) ||
                camera.location?.toLowerCase().includes(query) ||
                camera.suburb?.toLowerCase().includes(query) ||
                camera.network?.toLowerCase().includes(query) ||
                camera.purpose?.toLowerCase().includes(query)
            );

            // Dropdown filters
            const matchesType = !this.activeFilters.type || camera.type === this.activeFilters.type;
            const matchesOwner = !this.activeFilters.owner || camera.owner === this.activeFilters.owner;
            const matchesNetwork = !this.activeFilters.network || camera.network === this.activeFilters.network;
            const matchesPurpose = !this.activeFilters.purpose || camera.purpose === this.activeFilters.purpose;

            return matchesSearch && matchesType && matchesOwner && matchesNetwork && matchesPurpose;
        });

        this.renderCameraList();
    }

    renderCameraList() {
        this.cameraListContainer.innerHTML = '';

        if (this.filteredCameras.length === 0) {
            this.cameraListContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: #7f8c8d;">No cameras found</div>';
            return;
        }

        this.filteredCameras.forEach(camera => {
            const item = document.createElement('div');
            item.className = 'god-camera-item';

            const color = this.getCameraColor(camera.type);

            item.innerHTML = `
                <div class="god-camera-color" style="background: ${color};"></div>
                <div class="god-camera-info">
                    <div class="god-camera-id">${camera.id || 'Unknown ID'}</div>
                    <div class="god-camera-details">
                        ${camera.type || 'Unknown Type'} • ${camera.owner || 'Unknown Owner'} • ${camera.suburb || camera.location || 'Unknown Location'}
                    </div>
                </div>
                <div class="god-camera-actions">
                    <button class="god-btn god-btn-primary god-btn-small" data-id="${camera.id}">Edit</button>
                </div>
            `;

            // Attach edit button listener
            const editBtn = item.querySelector('.god-btn-primary');
            editBtn.addEventListener('click', () => this.editCamera(camera));

            this.cameraListContainer.appendChild(item);
        });
    }

    getCameraColor(type) {
        const colors = {
            'Public Safety': '#ff0000',        // Pure Red
            'Traffic': '#0066ff',              // True Blue
            'Transit': '#00cc00',              // Green
            'Retail': '#ff9900',               // Orange
            'Parks': '#9933ff',                // Purple
            'LPR': '#ffcc00',                  // Gold/Yellow
            'Red-Light Speed': '#ff0066',      // Pink-Red
            'Fixed Speed': '#ff6633',          // Orange-Red
            'Point-to-Point': '#00ffff',       // Cyan
            'AI Camera': '#00ff99'             // Turquoise
        };
        return colors[type] || '#808080';
    }

    showDashboard() {
        this.loginScreen.style.display = 'none';
        this.editForm.classList.remove('active');
        this.dashboard.classList.add('active');
    }

    showAddCameraForm() {
        this.currentCamera = null;
        this.dashboard.classList.remove('active');
        this.editForm.classList.add('active');

        document.getElementById('god-form-title').textContent = 'Add New Camera';
        document.getElementById('god-form-delete').style.display = 'none';

        // Clear form
        document.getElementById('god-edit-id').value = '';
        document.getElementById('god-edit-lat').value = '';
        document.getElementById('god-edit-lng').value = '';
        document.getElementById('god-edit-type').value = '';
        document.getElementById('god-edit-owner').value = '';
        document.getElementById('god-edit-coverage').value = '360';
        document.getElementById('god-edit-direction').value = '';
        document.getElementById('god-edit-purpose').value = '';
        document.getElementById('god-edit-network').value = '';
        document.getElementById('god-edit-suburb').value = '';
        document.getElementById('god-edit-location').value = '';
    }

    editCamera(camera) {
        this.currentCamera = camera;
        this.dashboard.classList.remove('active');
        this.editForm.classList.add('active');

        document.getElementById('god-form-title').textContent = 'Edit Camera';
        document.getElementById('god-form-delete').style.display = 'block';

        // Populate form
        document.getElementById('god-edit-id').value = camera.id || '';
        document.getElementById('god-edit-lat').value = camera.lat || '';
        document.getElementById('god-edit-lng').value = camera.lng || '';
        document.getElementById('god-edit-type').value = camera.type || '';
        document.getElementById('god-edit-owner').value = camera.owner || '';
        document.getElementById('god-edit-coverage').value = camera.coverage || '360';
        document.getElementById('god-edit-direction').value = camera.direction || '';
        document.getElementById('god-edit-purpose').value = camera.purpose || '';
        document.getElementById('god-edit-network').value = camera.network || '';
        document.getElementById('god-edit-suburb').value = camera.suburb || '';
        document.getElementById('god-edit-location').value = camera.location || '';
    }

    async saveCamera() {
        const cameraData = {
            lat: parseFloat(document.getElementById('god-edit-lat').value),
            lng: parseFloat(document.getElementById('god-edit-lng').value),
            type: document.getElementById('god-edit-type').value,
            owner: document.getElementById('god-edit-owner').value,
            coverage: document.getElementById('god-edit-coverage').value,
            direction: document.getElementById('god-edit-direction').value ?
                parseInt(document.getElementById('god-edit-direction').value) : null,
            purpose: document.getElementById('god-edit-purpose').value,
            network: document.getElementById('god-edit-network').value,
            suburb: document.getElementById('god-edit-suburb').value,
            location: document.getElementById('god-edit-location').value
        };

        try {
            let response;

            if (this.currentCamera) {
                // Update existing camera
                response = await fetch(`${API_URL}/cameras/${this.currentCamera.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(cameraData)
                });
            } else {
                // Create new camera
                response = await fetch(`${API_URL}/cameras`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    },
                    body: JSON.stringify(cameraData)
                });
            }

            const data = await response.json();

            if (response.ok) {
                alert(this.currentCamera ? 'Camera updated successfully!' : 'Camera added successfully!');
                this.showDashboard();
                this.loadCameras();

                // Reload the main map
                if (typeof loadCameras === 'function') {
                    loadCameras();
                }
            } else {
                alert('Error: ' + (data.error || 'Failed to save camera'));
            }
        } catch (error) {
            alert('Connection error: ' + error.message);
        }
    }

    async deleteCamera() {
        if (!this.currentCamera) return;

        const confirmed = confirm(`Are you sure you want to delete camera ${this.currentCamera.id}?\n\nThis action cannot be undone.`);
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_URL}/cameras/${this.currentCamera.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                alert('Camera deleted successfully!');
                this.showDashboard();
                this.loadCameras();

                // Reload the main map
                if (typeof loadCameras === 'function') {
                    loadCameras();
                }
            } else {
                alert('Error: ' + (data.error || 'Failed to delete camera'));
            }
        } catch (error) {
            alert('Connection error: ' + error.message);
        }
    }

    showBulkPanel() {
        document.getElementById('god-bulk-panel').style.display = 'block';
    }

    hideBulkPanel() {
        document.getElementById('god-bulk-panel').style.display = 'none';
        document.getElementById('god-bulk-type').value = '';
    }

    async bulkDelete() {
        const selectedType = document.getElementById('god-bulk-type').value;

        if (!selectedType) {
            alert('Please select a camera type to delete');
            return;
        }

        const camerasToDelete = this.cameras.filter(c => c.type === selectedType);
        const count = camerasToDelete.length;

        const confirmed = confirm(`Are you sure you want to delete ALL ${count} cameras of type "${selectedType}"?\n\nThis action cannot be undone.`);
        if (!confirmed) return;

        try {
            // Delete cameras one by one (could be optimized with a bulk endpoint)
            let deletedCount = 0;

            for (const camera of camerasToDelete) {
                const response = await fetch(`${API_URL}/cameras/${camera.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (response.ok) {
                    deletedCount++;
                }
            }

            alert(`Successfully deleted ${deletedCount} out of ${count} cameras`);
            this.hideBulkPanel();
            this.loadCameras();

            // Reload the main map
            if (typeof loadCameras === 'function') {
                loadCameras();
            }
        } catch (error) {
            alert('Error during bulk delete: ' + error.message);
        }
    }
}

// Initialize God Mode when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.godMode = new GodMode();
});
