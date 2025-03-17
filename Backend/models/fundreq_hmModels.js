const connection = require('../Config/Connection');

// Fetch all Request
const getAllReq = async () => {
  const sql = "SELECT * FROM tbl_demand_master where demanded= 'Yes' and status = 'Active'";
  
  const [rows] = await connection.query(sql);
  return rows;
};

// Insert a new Request
const insertReq = async (fundReq,demand_status,demanded) => {
 
  const sql = "INSERT INTO tbl_demand_master (demand_master_record,demand_status,demanded) VALUES (?,? ,?)";
  const [result] = await connection.query(sql, [fundReq, demand_status, demanded]);
  return result;
};

// Update a Request
const updateReq = async (id, fundReq) => {
  const sql = "UPDATE tbl_demand_master SET demand_master_record = ? WHERE 	demand_master_id = ?";
  const [result] = await connection.query(sql, [fundReq, id]);
  return result;
};

// Delete a Request
const deleteReq = async (id) => {
  const sql = "DELETE FROM tbl_demand_master WHERE 	demand_master_id = ?";
  const [result] = await connection.query(sql, [id]);
  return result;
};

module.exports = {
  getAllReq,
  insertReq,
  updateReq,
  deleteReq,
};
