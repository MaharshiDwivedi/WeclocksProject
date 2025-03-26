const connection = require('../Config/Connection');

const User = {
    // Existing method (keep for backward compatibility)
    findByUsername: async (username) => {
        try {
            const [rows] = await connection.query(
                'SELECT * FROM tbl_users WHERE BINARY username = ?', 
                [username]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // New method for explicit case-sensitive search
    findByUsernameExact: async (username) => {
        try {
            const [rows] = await connection.query(
                'SELECT * FROM tbl_users WHERE BINARY username = ?', 
                [username]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = User;