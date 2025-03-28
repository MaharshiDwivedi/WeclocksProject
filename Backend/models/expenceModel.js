// models/expenceModel.js
const connection = require('../Config/Connection');

const expenceModel = {
  async getActiveHeads() {
    try {
      const [rows] = await connection.query("SELECT * FROM tbl_smc_head WHERE status='Active'");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      throw new Error(`Database Error in getActiveHeads: ${error.message}`);
    }
  },

  async getActiveNiryan() {
    try {
      const [rows] = await connection.query("SELECT * FROM tbl_new_smc_nirnay WHERE status='Active'");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      throw new Error(`Database Error in getActiveNiryan: ${error.message}`);
    }
  },

  async getActiveNiryanRemarks() {
    try {
      const [rows] = await connection.query("SELECT * FROM tbl_new_smc_nirnay_remarks WHERE status='Active'");
      return Array.isArray(rows) ? rows : [];
    } catch (error) {
      throw new Error(`Database Error in getActiveNiryanRemarks: ${error.message}`);
    }
  },
};

module.exports = expenceModel;