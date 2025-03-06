const connection = require("../Config/Connection");

// Helper function to transform year from "2024-25" to "2024-2025"
function transformYear(year) {
  return year.replace(/(\d{2})-(\d{2})/, "$1-20$2");
}

// Add a new document
async function addDocument(documentData) {
  try {
    const { document_title, year, file_url, status = "Active" } = documentData;

    // Transform year from "2024-25" to "2024-2025"
    const formattedYear = transformYear(year);

    // Create the document_record string
    const document_record = [document_title, formattedYear, file_url].join("|");

    const [result] = await connection.execute(
      "INSERT INTO tbl_documents (document_record, status, ins_date_time, update_date_time) VALUES (?, ?, NOW(), NOW())",
      [document_record, status]
    );

    return result;
  } catch (error) {
    console.error("Error in addDocument:", error.message);
    return { error: "Failed to add document. Please check your input and try again." };
  }
}

// Update a document
async function updateDocument(documentId, documentData) {
  try {
    const { document_title, year, file_url } = documentData;

    // Get existing document to preserve unchanged fields
    const [existingRows] = await connection.execute(
      "SELECT document_record FROM tbl_documents WHERE document_id = ?",
      [documentId]
    );

    if (existingRows.length === 0) {
      return { error: "Document not found" };
    }

    const existingParts = existingRows[0].document_record.split("|");

    // Transform year from "2024-25" to "2024-2025" if provided
    const updatedYear = year ? transformYear(year) : existingParts[1];

    const updatedTitle = document_title || existingParts[0];
    const updatedFile = file_url || existingParts[2];

    const document_record = [updatedTitle, updatedYear, updatedFile].join("|");

    const [result] = await connection.execute(
      "UPDATE tbl_documents SET document_record = ?, update_date_time = NOW() WHERE document_id = ?",
      [document_record, documentId]
    );

    if (result.affectedRows === 0) {
      return { error: "Document not found or no changes made" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateDocument:", error.message);
    return { error: "Failed to update document" };
  }
}

// Delete a document (mark as inactive)
async function deleteDocument(documentId) {
  try {
    const [result] = await connection.execute(
      "UPDATE tbl_documents SET status = 'Inactive', update_date_time = NOW() WHERE document_id = ?",
      [documentId]
    );

    if (result.affectedRows === 0) {
      return { error: "Document not found or already inactive" };
    }

    return { success: true, message: "Document marked as inactive successfully" };
  } catch (error) {
    console.error("Error in deleteDocument:", error.message);
    return { error: "Failed to mark document as inactive. Please try again later." };
  }
}

// Fetch all active documents
async function getAllDocuments() {
  try {
    const [rows] = await connection.execute(
      "SELECT document_id, document_record, status FROM tbl_documents WHERE status='Active'"
    );

    return rows.map((row) => {
      const parts = row.document_record.split("|");

      // Transform year from "2024-2025" to "2024-25" for display
      const displayYear = parts[1].replace(/(\d{4})-(\d{4})/, (match, p1, p2) => {
        return `${p1}-${p2.slice(2)}`; // Convert "2024-2025" to "2024-25"
      });

      return {
        document_id: row.document_id,
        document_title: parts[0] || null,
        year: displayYear, // Display as "2024-25"
        file_url: parts[2] || null,
        status: row.status,
      };
    });
  } catch (error) {
    console.error("Error in getAllDocuments:", error.message);
    return { error: "Unable to fetch documents. Please try again later." };
  }
}

module.exports = { addDocument, getAllDocuments, deleteDocument, updateDocument };