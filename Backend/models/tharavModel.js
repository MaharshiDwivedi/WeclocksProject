const connection = require('../Config/Connection');

// // Fetch all tharavs
// const getAllTharav = async () => {
//     const sql = "SELECT * FROM tbl_new_smc_nirnay WHERE status = 'Active'";
//     const [rows] = await connection.query(sql);
//     return rows;
// };

const getTharav = async (meetingNumber, schoolId) => {
    const sql = `
        SELECT * FROM tbl_new_smc_nirnay 
        WHERE status = 'Active'
        AND SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 1), '|', -1) = ?
        AND SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 6), '|', -1) = ?;
    `;

    const [rows] = await connection.query(sql, [meetingNumber, schoolId]); 
    return rows;
};


// Get a single tharav by ID
const getTharavById = async (id) => {
    const sql = "SELECT * FROM tbl_new_smc_nirnay WHERE nirnay_id = ?";
    const [rows] = await connection.query(sql, [id]);
    return rows;
};

// Insert a new tharav
const insertTharav = async (nirnayreord) => {
    const sql = "INSERT INTO tbl_new_smc_nirnay (nirnay_reord) VALUES (?)";
    const [result] = await connection.query(sql, [nirnayreord]);
    return result;
};

// Update a tharav
const updateTharav = async (id, nirnayreord) => {
    const sql = "UPDATE tbl_new_smc_nirnay SET nirnay_reord = ? WHERE nirnay_id = ?";
    const [result] = await connection.query(sql, [nirnayreord, id]);
    return result;
};

// Delete a tharav
const deleteTharav = async (id) => {
    const sql = "UPDATE tbl_new_smc_nirnay SET status = 'Inactive' WHERE nirnay_id = ?";
    const [result] = await connection.query(sql, [id]);
    return result;
};

module.exports = {
    // getAllTharav,
    getTharavById,
    insertTharav,
    updateTharav,
    deleteTharav,
    getTharav,
};