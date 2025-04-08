const connection = require("../Config/Connection");

// Fetch all members
const getAllMembers = async () => {
  try {
    const sql = "SELECT * FROM tbl_smc_member WHERE status = 'Active'";
    const [rows] = await connection.query(sql);
    return rows;
  } catch (error) {
    console.error("Error fetching All members:", error);
    throw error;
  }
};

// Insert a new member
const insertMember = async (memberRecord) => {
  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  const sql =
    "INSERT INTO tbl_smc_member (member_record, sync_date_time) VALUES (? , ?)";
  const [result] = await connection.query(sql, [memberRecord, currentDateTime]);
  return result;
};

// Update a member
const updateMember = async (id, memberRecord) => {
  const sql = "UPDATE tbl_smc_member SET member_record = ? WHERE member_id = ?";
  const [result] = await connection.query(sql, [memberRecord, id]);
  return result;
};

// Soft delete a member
const deleteMember = async (id) => {
  const sql =
    "UPDATE tbl_smc_member SET status = 'Inactive'  WHERE member_id = ?";
  const [result] = await connection.query(sql, [id]);
  return result;
};

module.exports = {
  getAllMembers,
  insertMember,
  updateMember,
  deleteMember,
};