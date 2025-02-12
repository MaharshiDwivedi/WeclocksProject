const mysql = require('mysql2/promise'); // Import mysql2 with promise support

const connection = mysql.createPool({  // Use createPool() for better connection handling
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'itdp_ndb_smc',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

console.log("Connected to MySQL database!");

module.exports = connection;
