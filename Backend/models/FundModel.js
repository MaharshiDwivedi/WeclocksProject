// models/FundModel.js
const connection = require('../Config/Connection');

const FundModel = {
  getFundDistribution: async () => {
    const query = `
      SELECT 
        dm.demand_master_id,
        dm.demand_master_record,
        dm.ins_date_time,
        SUBSTRING_INDEX(dm.demand_master_record, '|', 1) AS school_id,
        SUBSTRING_INDEX(SUBSTRING_INDEX(dm.demand_master_record, '|', 2), '|', -1) AS year,
        SUBSTRING_INDEX(SUBSTRING_INDEX(dm.demand_master_record, '|', 3), '|', -1) AS amount,
        s.school_name
      FROM tbl_demand_master dm
      INNER JOIN tbl_schools s ON SUBSTRING_INDEX(dm.demand_master_record, '|', 1) = s.school_id
      WHERE dm.status = 'Active'
    `;
    const [rows] = await connection.query(query);
    return rows;
  },

  getAllSchools: async () => {
    const query = `SELECT school_id, school_name FROM tbl_schools`;
    const [rows] = await connection.query(query);
    return rows;
  },

  checkExistingFund: async (school_id, year) => {
    const query = `
      SELECT demand_master_id, demand_master_record 
      FROM tbl_demand_master 
      WHERE SUBSTRING_INDEX(demand_master_record, '|', 1) = ?
      AND SUBSTRING_INDEX(SUBSTRING_INDEX(demand_master_record, '|', 2), '|', -1) = ?
      AND status = 'Active'
    `;
    const [rows] = await connection.query(query, [school_id, year]);
    return rows[0];
  },

  deleteFund: async (id) => {
    const query = `UPDATE tbl_demand_master SET status = 'Inactive' WHERE demand_master_id = ?`;
    await connection.query(query, [id]);
  },

  getFundById: async (id) => {
    const query = `
      SELECT demand_master_record 
      FROM tbl_demand_master 
      WHERE demand_master_id = ? AND status = 'Active'
    `;
    const [rows] = await connection.query(query, [id]);
    return rows[0];
  },

  updateFund: async (id, school_id, year, amount) => {
    const record = `${school_id}|${year}|${amount}|Credit|403`;
    const query = `UPDATE tbl_demand_master SET demand_master_record = ?, demanded = ? WHERE demand_master_id = ?`;
    await connection.query(query, [record, amount, id]);
  },

  addFundDistribution: async (school_id, year, amount) => {
    const record = `${school_id}|${year}|${amount}|Credit|403`;
    const query = `INSERT INTO tbl_demand_master 
                   (demand_master_record, demand_status, demanded, active_reject_record, status, ins_date_time) 
                   VALUES (?, 'Pending', ?, '', 'Active', NOW())`;
    await connection.query(query, [record, amount]);
  }
};

module.exports = FundModel;