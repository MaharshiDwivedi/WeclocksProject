const express = require('express');
const connection = require('../Config/Connection.js');
const crypto = require('crypto');

const router = express.Router();

// Function to decrypt password
function decryptPassword(encryptedPassword) {
    const ciphering = 'aes-128-ctr';
    const decryptionKey = Buffer.from('185185185185185185', 'utf8');
    const decryptionIv = Buffer.from('1234567891011121', 'utf8');

    const decipher = crypto.createDecipheriv(ciphering, decryptionKey, decryptionIv);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Login API
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Query to find the user
    connection.query('SELECT * FROM tbl_users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error('Query Error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = results[0];

        if (user.status === 'yes') {
            // Decrypt the stored password
            const decryptedPassword = decryptPassword(user.password);
            if (decryptedPassword !== password) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            // Directly compare password
            if (user.password !== password) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }

        // Success response
        res.json({ 
            message: 'Login successful',
            user: {
                username: user.username,
                status: user.status
            }
        });
    });
});

module.exports = router;