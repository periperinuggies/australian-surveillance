#!/usr/bin/env node
/**
 * Australian Surveillance Backend Server
 * Provides API for camera data management with god account authentication
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const CAMERAS_DB_FILE = path.join(__dirname, 'cameras_database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// God account credentials (in production, use a proper database)
const GOD_ACCOUNT = {
    username: process.env.GOD_ACCOUNT_USERNAME || 'admin',
    password: process.env.GOD_ACCOUNT_PASSWORD || 'admin123' // CHANGE THIS!
};

// Load cameras from database
function loadCameras() {
    try {
        if (fs.existsSync(CAMERAS_DB_FILE)) {
            const data = fs.readFileSync(CAMERAS_DB_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error loading cameras:', error);
        return [];
    }
}

// Save cameras to database
function saveCameras(cameras) {
    try {
        fs.writeFileSync(CAMERAS_DB_FILE, JSON.stringify(cameras, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving cameras:', error);
        return false;
    }
}

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint for god account
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    // Check credentials
    if (username === GOD_ACCOUNT.username && password === GOD_ACCOUNT.password) {
        // Generate JWT token
        const token = jwt.sign(
            { username, role: 'god' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                username,
                role: 'god'
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// Get all cameras (public)
app.get('/api/cameras', (req, res) => {
    const cameras = loadCameras();
    res.json({
        total: cameras.length,
        cameras
    });
});

// Get camera by ID (public)
app.get('/api/cameras/:id', (req, res) => {
    const cameras = loadCameras();
    const camera = cameras.find(c => c.id === req.params.id);

    if (camera) {
        res.json(camera);
    } else {
        res.status(404).json({ error: 'Camera not found' });
    }
});

// Add new camera (god account only)
app.post('/api/cameras', authenticateToken, (req, res) => {
    if (req.user.role !== 'god') {
        return res.status(403).json({ error: 'God account required' });
    }

    const cameras = loadCameras();
    const newCamera = {
        id: `USER-${Date.now()}`,
        ...req.body,
        created_by: req.user.username,
        created_at: new Date().toISOString(),
        data_source: 'User Submitted'
    };

    // Validate required fields
    if (!newCamera.lat || !newCamera.lng || !newCamera.type) {
        return res.status(400).json({ error: 'Missing required fields: lat, lng, type' });
    }

    cameras.push(newCamera);

    if (saveCameras(cameras)) {
        res.status(201).json({
            success: true,
            camera: newCamera
        });
    } else {
        res.status(500).json({ error: 'Failed to save camera' });
    }
});

// Update camera (god account only)
app.put('/api/cameras/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'god') {
        return res.status(403).json({ error: 'God account required' });
    }

    const cameras = loadCameras();
    const index = cameras.findIndex(c => c.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Camera not found' });
    }

    cameras[index] = {
        ...cameras[index],
        ...req.body,
        id: req.params.id, // Preserve ID
        updated_by: req.user.username,
        updated_at: new Date().toISOString()
    };

    if (saveCameras(cameras)) {
        res.json({
            success: true,
            camera: cameras[index]
        });
    } else {
        res.status(500).json({ error: 'Failed to update camera' });
    }
});

// Delete camera (god account only)
app.delete('/api/cameras/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'god') {
        return res.status(403).json({ error: 'God account required' });
    }

    const cameras = loadCameras();
    const filteredCameras = cameras.filter(c => c.id !== req.params.id);

    if (cameras.length === filteredCameras.length) {
        return res.status(404).json({ error: 'Camera not found' });
    }

    if (saveCameras(filteredCameras)) {
        res.json({
            success: true,
            message: 'Camera deleted'
        });
    } else {
        res.status(500).json({ error: 'Failed to delete camera' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Australian Surveillance Server Running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🗄️  Database: ${CAMERAS_DB_FILE}`);
    console.log(`📊 Cameras loaded: ${loadCameras().length}`);
    console.log(`\n⚠️  GOD ACCOUNT: ${GOD_ACCOUNT.username}`);
    console.log(`⚠️  Change credentials in .env file!\n`);
});
