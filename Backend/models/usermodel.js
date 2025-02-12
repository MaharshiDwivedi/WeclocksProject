const connection = require('../Config/Connection');

const User = {
    findByUsername: async (username) => {
        try {
            const [rows] = await connection.query('SELECT * FROM tbl_users WHERE username = ?', [username]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = User;