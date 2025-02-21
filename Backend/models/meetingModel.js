const connection = require("../Config/Connection");

// Fetch all meetings
async function getAllMeetings() {
  try {
    const [rows] = await connection.execute(
      "SELECT meeting_id, meeting_record FROM tbl_new_smc WHERE status='Active'"
    );

    return rows.map((row) => {
      const parts = row.meeting_record.split("|");
      return {
        meeting_id: row.meeting_id,
        meeting_number: parts[0] || null,
        school_id: parts[1] || null,
        user_id: parts[2] || null,
        meeting_date: parts[3] || null,
        joined_member_length: parts[4] || "0",
        image_url: parts[5] || "default.jpg",
        latitude: parts[6] || "0.0000",
        longitude: parts[7] || "0.0000",
        address: parts[8] || "Unknown",
        created_at: parts[9] || null,
        updated_at: parts[10] || null,
        member_id: parts[11] || null,
        raw_meeting_record: row.meeting_record,
      };
    });
  } catch (error) {
    throw error;
  }
}

// Add a new meeting
async function addMeeting(meeting) {
  try {
    const {
      meeting_id,
      meeting_number = meeting_id,
      school_id,
      user_id,
      meeting_date = new Date().toISOString().split("T")[0],
      image_url = "default.jpg",
      latitude = "0.0000",
      longitude = "0.0000",
      address = "Unknown",
      created_at = new Date().toISOString().replace("T", " ").split(".")[0],
      updated_at = "0000-00-00 00:00:00",
      member_id = "",
    } = meeting;

    const newMeetingRecord = [
      meeting_number, school_id, user_id, meeting_date, "", image_url,
      latitude, longitude, address, created_at, updated_at, member_id
    ].join("|");

    const [result] = await connection.execute(
      "INSERT INTO tbl_new_smc (meeting_id, meeting_record, status) VALUES (?, ?, 'Active')",
      [meeting_id, newMeetingRecord]
    );

    return result;
  } catch (error) {
    throw error;
  }
}

// Update a meeting
async function updateMeeting(meeting_id, updatedData) {
  try {
    const [rows] = await connection.execute(
      "SELECT meeting_record FROM tbl_new_smc WHERE meeting_id = ? AND status='Active'",
      [meeting_id]
    );

    if (rows.length === 0) return { error: "Meeting not found" };

    let parts = rows[0].meeting_record.split("|");

    parts[3] = updatedData.meeting_date || parts[3];
    parts[5] = updatedData.image_url || parts[5];
    parts[6] = updatedData.latitude || parts[6];
    parts[7] = updatedData.longitude || parts[7];
    parts[8] = updatedData.address || parts[8];
    parts[10] = new Date().toISOString().replace("T", " ").split(".")[0];

    const updatedMeetingRecord = parts.join("|");

    const [result] = await connection.execute(
      "UPDATE tbl_new_smc SET meeting_record = ? WHERE meeting_id = ? AND status='Active'",
      [updatedMeetingRecord, meeting_id]
    );

    return result;
  } catch (error) {
    throw error;
  }
}

// Delete a meeting (Soft Delete)
async function deleteMeeting(meeting_id) {
  try {
    const [result] = await connection.execute(
      "UPDATE tbl_new_smc SET status='Inactive' WHERE meeting_id = ? AND status='Active'",
      [meeting_id]
    );

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = { getAllMeetings, addMeeting, updateMeeting, deleteMeeting };
