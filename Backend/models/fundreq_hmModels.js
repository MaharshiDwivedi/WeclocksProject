const connection = require('../Config/Connection');

const getAllReq = async () => {
  const sql = `
    SELECT 
      dm.demand_master_id, 
      dm.demand_master_record, 
      dm.demand_status, 
      dm.active_reject_record, 
      s.school_name 
    FROM tbl_demand_master dm
    LEFT JOIN tbl_schools s ON SUBSTRING_INDEX(dm.demand_master_record, '|', 1) = s.school_id
    WHERE dm.demanded = 'Yes' AND dm.status = 'Active'
  `;
  const [rows] = await connection.query(sql);
  return rows;
};

const insertReq = async (fundReq, demand_status, demanded) => {
  const sql = "INSERT INTO tbl_demand_master (demand_master_record, demand_status, demanded, ins_date_time) VALUES (?, ?, ?, NOW())";
  const [result] = await connection.query(sql, [fundReq, demand_status, demanded]);
  return result;
};

const updateReq = async (id, fundReq) => {
  const sql = "UPDATE tbl_demand_master SET demand_master_record = ?, update_date_time_record = NOW() WHERE demand_master_id = ?";
  const [result] = await connection.query(sql, [fundReq, id]);
  return result;
};

const deleteReq = async (id) => {
  const sql = "UPDATE tbl_demand_master SET status = 'Inactive' WHERE demand_master_id = ?";
  const [result] = await connection.query(sql, [id]);
  return result;
};

const acceptReq = async (id) => {
  const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const sql = "UPDATE tbl_demand_master SET demand_status = 'Accept', active_reject_record = ? WHERE demand_master_id = ?";
  const [result] = await connection.query(sql, [currentDateTime, id]);
  return result;
};

const rejectReq = async (id, reason) => {
  const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const rejectData = `${reason}|${currentDateTime}`;
  const sql = "UPDATE tbl_demand_master SET demand_status = 'Reject', active_reject_record = ? WHERE demand_master_id = ?";
  const [result] = await connection.query(sql, [rejectData, id]);
  return result;
};

module.exports = {
  getAllReq,
  insertReq,
  updateReq,
  deleteReq,
  acceptReq,
  rejectReq,
};