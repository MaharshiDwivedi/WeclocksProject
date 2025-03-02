const connection = require('../Config/Connection');

// Fetch all members
const getAllPurposeMembers = async () => {
  const sql = "SELECT * FROM tbl_smc_head";
  const [rows] = await connection.query(sql);
  return rows;
};

// Insert a new member
const insertPurposeMembers = async (memberRecord) => {
  const sql = "INSERT INTO tbl_smc_head (member_record) VALUES (?)";
  const [result] = await connection.query(sql, [memberRecord]);
  return result;
};

// Update a member
const updatePurposeMembers = async (id, memberRecord) => {
  const sql = "UPDATE tbl_smc_head SET member_record = ? WHERE member_id = ?";
  const [result] = await connection.query(sql, [memberRecord, id]);
  return result;
};

// Delete a member
const deletePurposeMembers = async (id) => {
  const sql = "DELETE FROM tbl_smc_head WHERE member_id = ?";
  const [result] = await connection.query(sql, [id]);
  return result;
};

module.exports = {
    getAllPurposeMembers,
  insertPurposeMembers,
  updatePurposeMembers,
  deletePurposeMembers,
};
