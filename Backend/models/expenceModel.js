const connection = require('../Config/Connection');

const expenceModel = {
    async getActiveHeads() {
        try {
            const [rows] = await connection.query("SELECT * FROM tbl_smc_head WHERE status='Active'");
            return Array.isArray(rows) ? rows : []; // Ensure it's an array
        } catch (error) {
            console.error("Database Error in getActiveHeads:", error);
            return [];
        }
    },

    async getActiveNiryan() {
        try {
            const [rows] = await connection.query("SELECT * FROM tbl_new_smc_nirnay WHERE status='Active'");
            return Array.isArray(rows) ? rows : [];
        } catch (error) {
            console.error("Database Error in getActiveNiryan:", error);
            return [];
        }
    },

    async getActiveNiryanRemarks() {
        try {
            const [rows] = await connection.query("SELECT * FROM tbl_new_smc_nirnay_remarks WHERE status='Active'");
            return Array.isArray(rows) ? rows : [];
        } catch (error) {
            console.error("Database Error in getActiveNiryanRemarks:", error);
            return [];
        }
    }
};

module.exports = expenceModel;
