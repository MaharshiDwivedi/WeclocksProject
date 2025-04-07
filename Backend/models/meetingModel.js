const connection = require("../Config/Connection");
const path = require("path");

// Fetch all meetings
async function getAllMeetings() {
  try {
    const [rows] = await connection.execute("SELECT * FROM tbl_new_smc");

    return rows.map((row) => {
      const parts = row.meeting_record ? row.meeting_record.split("|") : [];

      return {
        meeting_id: row.meeting_id, // Ensure ID consistency
        meeting_number: parts[0] || row.meeting_id, // Use meeting_id if missing
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
        raw_meeting_record: row.meeting_record || "",
      };
    });
  } catch (error) {
    console.error("Error in getAllMeetings:", error.message);
    return { error: "Unable to fetch meetings. Please try again later." };
  }
}

async function getMeetingsBySchoolId(schoolId) {
  try {
    const [rows] = await connection.execute(
      "SELECT meeting_id, meeting_record FROM tbl_new_smc WHERE status='Active' AND meeting_record LIKE ?",
      [`%${schoolId}|%`] // Filter by school_id
    );

    if (rows.length === 0) {
      return { message: "No meetings found for this school" };
    }

    return rows.map((row) => {
      const parts = row.meeting_record.split("|");
      return {
        meeting_id: row.meeting_id,
        meeting_number: parts[0] || row.meeting_id,
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
      };
    });
  } catch (error) {
    console.error("Error in getMeetingsBySchoolId:", error.message);
    return { error: "Unable to fetch meetings. Please try again later." };
  }
}

// Get the next meeting number for a specific school
async function getNextMeetingNumberForSchool(schoolId) {
  try {
    // Find the highest meeting number for this school
    const [rows] = await connection.execute(
      `SELECT meeting_record FROM tbl_new_smc 
       WHERE status='Active' AND meeting_record LIKE ?`,
      [`%${schoolId}|%`] // Look for records with this school_id
    );

    // Default to 1 if no meetings found
    if (rows.length === 0) return 1;

    // Extract meeting numbers for this school and find the maximum
    let maxMeetingNumber = 0;
    
    for (const row of rows) {
      const parts = row.meeting_record.split("|");
      // Check if parts[1] (school_id) matches the requested schoolId
      if (parts[1] == schoolId) {
        const meetingNumber = parseInt(parts[0], 10);
        if (!isNaN(meetingNumber) && meetingNumber > maxMeetingNumber) {
          maxMeetingNumber = meetingNumber;
        }
      }
    }
    
    // Return the next meeting number
    return maxMeetingNumber + 1;
  } catch (error) {
    console.error("Error getting next meeting number:", error.message);
    return 1; // Default to 1 if there's an error
  }
}

// Add a new meeting 
async function addMeeting(meeting) {
  try {
    const {
      school_id = null,
      user_id = null,
      meeting_date = new Date().toISOString().split("T")[0],
      selected_member_length: joined_member_length = "0",
      image_url = "default.jpg", // Default photo name
      latitude = "0.0000",
      longitude = "0.0000",
      address = "Unknown",
      created_at = new Date().toISOString().replace("T", " ").split(".")[0],
      member_id = "",
    } = meeting;

    // Get next meeting number for this school
    const meetingNumber = await getNextMeetingNumberForSchool(school_id);

    // ✅ Extract only filename + extension
    const getFileNameWithExtension = (filePath) => {
      if (!filePath) return "default.jpg"; // Default value
      return path.basename(filePath); // Extract only filename + extension
    };

    const photoName = getFileNameWithExtension(image_url);

    // Insert a blank record to get the correct meeting_id
    const [result] = await connection.execute(
      "INSERT INTO tbl_new_smc (status) VALUES ('Active')"
    );

    // Fetch the generated meeting_id
    const [newMeeting] = await connection.execute("SELECT LAST_INSERT_ID() as meeting_id");
    const meetingId = newMeeting[0].meeting_id;

    // ✅ Ensure `updated_at` is initially "0000-00-00 00:00:00"
    const updated_at = "0000-00-00 00:00:00";

    // Create meeting record with school-specific meeting number first
    const newMeetingRecord = [
      meetingNumber, // ✅ Use school-specific meeting number
      school_id ?? null,
      user_id ?? null,
      meeting_date ?? null,
      joined_member_length ?? "0",
      photoName, // ✅ Store only filename.extension
      latitude ?? "0.0000",
      longitude ?? "0.0000",
      address ?? "Unknown",
      created_at ?? null,
      updated_at, // ✅ Set default updated_at
      member_id ?? "",
    ].join("|");

    // Update the inserted record with correct meeting data
    await connection.execute(
      "UPDATE tbl_new_smc SET meeting_record = ? WHERE meeting_id = ?",
      [newMeetingRecord, meetingId]
    );

    return { 
      meeting_id: meetingId, 
      meeting_number: meetingNumber,
      message: "Meeting added successfully" 
    };
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

    // Update the relevant fields, but don't change the meeting number (parts[0])
    // and don't change the school_id (parts[1]) to maintain ownership
    parts[3] = updatedData.meeting_date || parts[3]; // Update meeting date
    parts[4] = updatedData.selected_member_length || parts[4]; // Update member length
    parts[5] = updatedData.image_url || parts[5]; // Update image URL
    parts[6] = updatedData.latitude || parts[6]; // Update latitude
    parts[7] = updatedData.longitude || parts[7]; // Update longitude
    parts[8] = updatedData.address || parts[8]; // Update address
    parts[11] = updatedData.member_id || parts[11]; // Update member_id (index 11)
    parts[10] = new Date().toISOString().replace("T", " ").split(".")[0]; // Update timestamp

    const updatedMeetingRecord = parts.join("|");

    console.log("Updated meeting record:", updatedMeetingRecord); // Debugging log

    const [result] = await connection.execute(
      "UPDATE tbl_new_smc SET meeting_record = ? WHERE meeting_id = ? AND status='Active'",
      [updatedMeetingRecord, meeting_id]
    );

    console.log("Update result:", result); // Debugging log

    return result;
  } catch (error) {
    console.error("Error in updateMeeting:", error.message);
    return { error: "Failed to update meeting. Please try again later." };
  }
}

// Delete a meeting
// Soft Delete a meeting by setting its status to 'Inactive'
const deleteMeeting = async (meeting_id) => {
  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    // Get the meeting record to extract meeting_number and school_id
    const [meeting] = await conn.execute(
      "SELECT meeting_record FROM tbl_new_smc WHERE meeting_id = ? AND status = 'Active'",
      [meeting_id]
    );

    if (meeting.length === 0) {
      await conn.rollback();
      return { error: "Meeting not found or already inactive" };
    }

    const meetingRecord = meeting[0].meeting_record.split('|');
    const meetingNumber = meetingRecord[0];
    const schoolId = meetingRecord[1];

    // Soft delete: Update status to 'Inactive'
    const [updateResult] = await conn.execute(
      "UPDATE tbl_new_smc SET status = 'Inactive' WHERE meeting_id = ?",
      [meeting_id]
    );

    if (updateResult.affectedRows === 0) {
      await conn.rollback();
      return { error: "Failed to mark meeting as inactive" };
    }

    // Set related tharav records to inactive
    await conn.execute(
      `UPDATE tbl_new_smc_nirnay 
       SET status = 'Inactive' 
       WHERE SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 1), '|', -1) = ?
       AND SUBSTRING_INDEX(SUBSTRING_INDEX(nirnay_reord, '|', 6), '|', -1) = ?`,
      [meetingNumber, schoolId]
    );

    // Set related remarks to inactive
    await conn.execute(
      `UPDATE tbl_new_smc_nirnay_remarks r
       JOIN tbl_new_smc_nirnay t ON r.nirnay_remarks_record LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(t.nirnay_reord, '|', 2), '|', -1), '%')
       SET r.status = 'Inactive'
       WHERE SUBSTRING_INDEX(SUBSTRING_INDEX(t.nirnay_reord, '|', 1), '|', -1) = ?
       AND SUBSTRING_INDEX(SUBSTRING_INDEX(t.nirnay_reord, '|', 6), '|', -1) = ?`,
      [meetingNumber, schoolId]
    );

    // Set related demands to inactive
    await conn.execute(
      `UPDATE tbl_demand_master d
       JOIN tbl_new_smc_nirnay_remarks r ON d.demand_master_record LIKE CONCAT('%', r.nirnay_remarks_id, '%')
       JOIN tbl_new_smc_nirnay t ON r.nirnay_remarks_record LIKE CONCAT('%', SUBSTRING_INDEX(SUBSTRING_INDEX(t.nirnay_reord, '|', 2), '|', -1), '%')
       SET d.status = 'Inactive'
       WHERE SUBSTRING_INDEX(SUBSTRING_INDEX(t.nirnay_reord, '|', 1), '|', -1) = ?
       AND SUBSTRING_INDEX(SUBSTRING_INDEX(t.nirnay_reord, '|', 6), '|', -1) = ?`,
      [meetingNumber, schoolId]
    );

    await conn.commit();
    return { success: true, message: "Meeting and related records marked as inactive" };
  } catch (error) {
    await conn.rollback();
    console.error("Error in deleteMeeting:", error.message);
    return { error: "Failed to mark meeting as inactive" };
  } finally {
    conn.release();
  }
};


const getMeetingById = async (meeting_id) => { 
  const [rows] = await connection.query("SELECT * FROM tbl_new_smc WHERE meeting_id = ?", [meeting_id]);
  return rows.length > 0 ? rows[0] : null;
};


module.exports = { getMeetingsBySchoolId, addMeeting, updateMeeting, deleteMeeting, getMeetingById,getAllMeetings };