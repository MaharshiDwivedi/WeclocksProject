const express = require('express');
const jwt = require('jsonwebtoken');
const connection = require('../Config/Connection.js');
const crypto = require('crypto');

const router = express.Router();
const SECRET_KEY = 'your_secret_key'; // Change this to a secure key

// Function to decrypt password (from your teammate's version)
function decryptPassword(encryptedPassword) {
    const ciphering = 'aes-128-ctr';
    const decryptionKey = Buffer.from('1851851851851851'); // Fixed key length issue
    const decryptionIv = Buffer.from('1234567891011121', 'utf8');

    try {
        const decipher = crypto.createDecipheriv(ciphering, decryptionKey, decryptionIv);
        let decrypted = decipher.update(encryptedPassword, 'base64', 'utf8'); // Used base64 encoding as in his version
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

// Login API (merged JWT + decryption)
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    connection.query('SELECT * FROM tbl_users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Query Error:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        let storedPassword = user.password;

        try {
            if (user.encrypted === 'Yes') {
                storedPassword = decryptPassword(user.password);
            }

            if (storedPassword !== password) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            // Generate JWT token (from your version)
            const token = jwt.sign({ username: user.username, status: user.status }, SECRET_KEY, {
                expiresIn: '1h',
            });

            res.json({
                message: 'Login successful',
                token, // Send token to the frontend
                user: {
                    username: user.username,
                    status: user.status
                }
            });
        } catch (error) {
            console.error('Password Verification Error:', error.message);
            return res.status(500).json({ error: 'Authentication failed' });
        }
    });
});

// Middleware to verify JWT (from your version)
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Access denied, token missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Protected route example (from your version)
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'You have access to this protected route', user: req.user });
});

module.exports = router;
