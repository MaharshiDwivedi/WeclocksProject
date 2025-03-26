const crypto = require('crypto');
const User = require('../models/usermodel');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; 

// Function to decrypt password
function decryptPassword(encryptedPassword) {
    const ciphering = 'aes-128-ctr';
    const decryptionKey = Buffer.from('1851851851851851');
    const decryptionIv = Buffer.from('1234567891011121', 'utf8');

    try {
        const decipher = crypto.createDecipheriv(ciphering, decryptionKey, decryptionIv);
        let decrypted = decipher.update(encryptedPassword, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw error;
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Use the new exact matching method
        const results = await User.findByUsernameExact(username);
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        let storedPassword = user.password;

        // Rest of your existing password verification logic...
        if (user.encrypted === 'Yes') {
            storedPassword = decryptPassword(user.password);
        }

        if (storedPassword !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token and respond...
        const token = jwt.sign(
            { username: user.username, user_id: user.user_id, school_id: user.school_id }, 
            SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user_id: user.user_id,
            school_id: user.school_id,
            category_id: user.category_id,
            user: { username: user.username }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
};