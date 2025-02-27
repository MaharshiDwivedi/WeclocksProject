const connection = require("../Config/Connection");

// Add a new document
async function addDocument(documentData) {
  try {
    console.log("Adding document:", documentData); // Debugging log

    const { document_title, year, image_url, status = "Active" } = documentData;

    // Create the document_record string
    const document_record = [document_title, year, image_url].join("|");

    const [result] = await connection.execute(
      "INSERT INTO tbl_documents (document_record, status, ins_date_time, update_date_time) VALUES (?, ?, NOW(), NOW())",
      [document_record, status]
    );

    return result;
  } catch (error) {
    console.error("Error in addDocument:", error.message); // Debugging log
    return { error: "Failed to add document. Please check your input and try again." };
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
        status: row.status,
      };
    });
  } catch (error) {
    console.error("Error in getAllDocuments:", error.message); // Debugging log
    return { error: "Unable to fetch documents. Please try again later." };
  }
}

module.exports = { addDocument, getAllDocuments };