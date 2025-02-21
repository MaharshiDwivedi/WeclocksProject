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
    console.error("Error in getAllMeetings:", error.message);
    return { error: "Unable to fetch meetings. Please try again later." };
  }
}
// Add a new meeting
async function addMeeting(meeting) {
  try {

    const {
      meeting_number = 1, // Default to meeting_id if not provided
      school_id = null,
      user_id = null,
      meeting_date = new Date().toISOString().split("T")[0],
      selected_member_length: joined_member_length = "0",
      image_url = "default.jpg",
      latitude = "0.0000",
      longitude = "0.0000",
      address = "Unknown",
      created_at = new Date().toISOString().replace("T", " ").split(".")[0],
      updated_at = "0000-00-00 00:00:00",
      member_id = "",
    } = meeting;

    // Ensure all values are either valid or explicitly set to null
    const newMeetingRecord = [
      meeting_number ?? null,
      school_id ?? null,
      user_id ?? null,
      meeting_date ?? null,
      joined_member_length ?? "0",
      image_url ?? "default.jpg",
      latitude ?? "0.0000",
      longitude ?? "0.0000",
      address ?? "Unknown",
      created_at ?? null,
      updated_at ?? null, // Use null instead of undefined
      member_id ?? "",
    ].join("|");
    
    console.log("New meeting record:", newMeetingRecord);

    const [result] = await connection.execute(
      "INSERT INTO tbl_new_smc (meeting_record, status) VALUES (?, 'Active')",
      [newMeetingRecord]
    );
    

    return result;
  } catch (error) {
    console.error("Error in addMeeting:", error.message);
    return { error: "Failed to add meeting. Please check your input and try again." };
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
    parts[10] = new Date().toISOString().replace("T", " ").split(".")[0]; // Corrected update time

    const updatedMeetingRecord = parts.join("|");

    const [result] = await connection.execute(
      "UPDATE tbl_new_smc SET meeting_record = ? WHERE meeting_id = ? AND status='Active'",
      [updatedMeetingRecord, meeting_id]
    );

    return result;
  } catch (error) {
    console.error("Error in updateMeeting:", error.message);
    return { error: "Failed to update meeting. Please try again later." };
  }
}

// Delete a meeting (Soft Delete)
async function deleteMeeting(meeting_id) {
  try {
    console.log("Deleting meeting with ID:", meeting_id); // Debugging log

    // Check if meeting exists
    const [rows] = await connection.execute(
      "SELECT meeting_id FROM tbl_new_smc WHERE meeting_id = ? AND status='Active'",
      [meeting_id]
    );

    if (rows.length === 0) {
      console.log("Meeting not found or already deleted"); // Debugging log
      return { error: "Meeting not found or already deleted" };
    }

    // Soft delete (set status to 'Inactive')
    const [result] = await connection.execute(
      "UPDATE tbl_new_smc SET status='Inactive' WHERE meeting_id = ? AND status='Active'",
      [meeting_id]
    );

    console.log("SQL query result:", result); // Debugging log
    console.log("Affected rows:", result.affectedRows); // Debugging log

    if (result.affectedRows === 0) {
      return { error: "Meeting not found or already deleted" };
    }

    return result;
  } catch (error) {
    console.error("Error in deleteMeeting:", error.message);
    return { error: "Failed to delete meeting. Please try again later." };
  }
}

module.exports = { getAllMeetings, addMeeting, updateMeeting, deleteMeeting };