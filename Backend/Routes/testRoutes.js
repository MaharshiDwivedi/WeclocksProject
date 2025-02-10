const express = require("express");
const connection = require("../Config/Connection.js");
const crypto = require("crypto");
const router = express.Router();

function decryptPassword(encryptedPassword) {
    const ciphering = "aes-128-ctr";
    const decryptionKey = Buffer.from("1851851851851851");
    const decryptionIv = Buffer.from("1234567891011121", "utf8");
    
    try {
        const decipher = crypto.createDecipheriv(ciphering, decryptionKey, decryptionIv);
        let decrypted = decipher.update(encryptedPassword, "base64", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    } catch (error) {
        console.error("Decryption error:", error);
        throw error;
    }
}

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
    }

    connection.query(
        "SELECT * FROM tbl_users WHERE username = ?", 
        [username], 
        (err, results) => {
            if (err) {
                console.error("Query Error:", err.message);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            const user = results[0];
            let storedPassword = user.password;

            try {
                if (user.encrypted === "Yes") {
                    storedPassword = decryptPassword(user.password);
                }

                if (storedPassword !== password) {
                    return res.status(401).json({ error: "Invalid credentials" });
                }

                // Success response
                res.json({
                    message: "Login successful",
                    user: {
                        username: user.username,
                        status: user.status,
                    },
                });
            } catch (error) {
                console.error("Password Verification Error:", error.message);
                return res.status(500).json({ error: "Authentication failed" });
            }
        }
    );
});

module.exports = router;