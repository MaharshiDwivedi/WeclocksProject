// models/FundModel.js
const connection = require('../Config/Connection');

class FundModel {
  static async getFundDistribution() {
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
    `;
    const [rows] = await connection.query(query);
    return rows;
  }

  static async getAllSchools() {
    const query = `SELECT school_id, school_name FROM tbl_schools`;
    const [rows] = await connection.query(query);
    return rows;
  }

  static async deleteFund(id) {
    const query = `UPDATE tbl_demand_master SET status = 'Inactive' WHERE demand_master_id = ?`;
    await connection.query(query, [id]);
  }
  
  
  static async updateFund(id, school_id, year, amount) {
    const record = `${school_id}|${year}|${amount}|Credit|403`;
    const query = `UPDATE tbl_demand_master SET demand_master_record = ?, demanded = ? WHERE demand_master_id = ?`;
    await connection.query(query, [record, amount, id]);
  }

  static async addFundDistribution(school_id, year, amount) {
    const record = `${school_id}|${year}|${amount}|Credit|403`;
    const query = `INSERT INTO tbl_demand_master 
                   (demand_master_record, demand_status, demanded, active_reject_record, status, ins_date_time) 
                   VALUES (?, 'Pending', ?, '', 'Active', NOW())`;
    await connection.query(query, [record, amount]);
  }
}

module.exports = FundModel;