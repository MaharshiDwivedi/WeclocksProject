const connection = require('../Config/Connection');

// Fetch all members
const getAllMembers = async () => {
  const sql = "SELECT * FROM tbl_smc_member";
  const [rows] = await connection.query(sql);
  return rows;
};

// Insert a new member
const insertMember = async (memberRecord) => {
  const sql = "INSERT INTO tbl_smc_member (member_record) VALUES (?)";
  const [result] = await connection.query(sql, [memberRecord]);
  return result;
};

// Update a member
const updateMember = async (id, memberRecord) => {
  const sql = "UPDATE tbl_smc_member SET member_record = ? WHERE member_id = ?";
  const [result] = await connection.query(sql, [memberRecord, id]);
  return result;
};

// Delete a member
const deleteMember = async (id) => {
  const sql = "DELETE FROM tbl_smc_member WHERE member_id = ?";
  const [result] = await connection.query(sql, [id]);
  return result;
};

module.exports = {
  getAllMembers,
  insertMember,
  updateMember,
  deleteMember,
};
