const connection = require("../Config/Connection");

async function updateDocument(documentId, documentData) {
  try {
    const { document_title, year, image_url, pdf_url } = documentData;

    // Get existing document to preserve unchanged fields
    const [existingRows] = await connection.execute(
      "SELECT document_record FROM tbl_documents WHERE document_id = ?",
      [documentId]
    );
    
    if (existingRows.length === 0) {
      return { error: "Document not found" };
    }

    const existingParts = existingRows[0].document_record.split("|");
    const updatedTitle = document_title || existingParts[0];
    const updatedYear = year || existingParts[1];
    const updatedImage = image_url || existingParts[2];
    const updatedPdf = pdf_url || existingParts[3];

    const document_record = [updatedTitle, updatedYear, updatedImage, updatedPdf].join("|");

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










// Add a new document
async function addDocument(documentData) {
  try {
    console.log("Adding document:", documentData); // Debugging log

    const { document_title, year, image_url, pdf_url, status = "Active" } = documentData;

    // Create the document_record string
    const document_record = [document_title, year, image_url, pdf_url].join("|");

    const [result] = await connection.execute(
      "INSERT INTO tbl_documents (document_record, status, ins_date_time, update_date_time) VALUES (?, ?, NOW(), NOW())",
      [document_record, status]
      
    );

    console.log("Document Data:", documentData);

    return result;
  } catch (error) {
    console.error("Error in addDocument:", error.message); // Debugging log
    return { error: "Failed to add document. Please check your input and try again." };
  }
}


// Delete a document
async function deleteDocument(documentId) {
  try {
    const [result] = await connection.execute(
      "DELETE FROM tbl_documents WHERE document_id = ?",
      [documentId]
    );

    if (result.affectedRows === 0) {
      return { error: "Document not found or already deleted" };
    }

    return { success: true, message: "Document deleted successfully" };
  } catch (error) {
    console.error("Error in deleteDocument:", error.message);
    return { error: "Failed to delete document. Please try again later." };
  }
}




// Fetch all documents
async function getAllDocuments() {
  try {
    console.log("Fetching documents..."); // Debugging log

    const [rows] = await connection.execute(
      "SELECT document_id, document_record, status FROM tbl_documents WHERE status='Active'"
    );

    return rows.map((row) => {
      const parts = row.document_record.split("|");
      return {
        document_id: row.document_id,
        document_title: parts[0] || null,
        year: parts[1] || null,
        image_url: parts[2] || null,
        pdf_url: parts[3] || null, // Include pdf_url in the response
        status: row.status,
      };
    });
  } catch (error) {
    console.error("Error in getAllDocuments:", error.message); // Debugging log
    return { error: "Unable to fetch documents. Please try again later." };
  }
}

module.exports = { addDocument, getAllDocuments, deleteDocument,updateDocument };