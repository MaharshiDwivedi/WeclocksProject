import { useState, useEffect } from "react";
import { Plus, X, Upload, Image, FilePlus, FileDown, Pencil, Trash2 } from "lucide-react"; // Added Pencil icon
import axios from "axios";

const Documents = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false); // New state for edit modal
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedYear, setSelectedYear] = useState("2023-24");
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editDocumentId, setEditDocumentId] = useState(null); // Track document being edited

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const toggleEditModal = (document = null) => {
    setIsEditOpen(!isEditOpen);
    if (document) {
      setEditDocumentId(document.document_id);
      setDocumentTitle(document.document_title);
      setSelectedYear(document.year);
      setImageFile(null); // Reset file inputs
      setPdfFile(null);
    } else {
      resetForm();
      setEditDocumentId(null);
    }
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageFile(selectedFile);
    }
  };

  const handlePdfChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setPdfFile(selectedFile);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleSubmit = async () => {
    if (!documentTitle || !imageFile || !pdfFile) {
      alert("Please enter document title, upload an image, and upload a PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("document_title", documentTitle);
    formData.append("year", selectedYear);
    formData.append("image", imageFile);
    formData.append("pdf", pdfFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/documents",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Document added successfully:", response.data);
      resetForm();
      toggleModal();
      fetchDocuments();
    } catch (error) {
      console.error("Error submitting document:", error);
      alert("Failed to submit document");
    }
  };

  const handleEditSubmit = async () => {
    if (!documentTitle) {
      alert("Please enter document title");
      return;
    }

    const formData = new FormData();
    formData.append("document_title", documentTitle);
    formData.append("year", selectedYear);
    if (imageFile) formData.append("image", imageFile);
    if (pdfFile) formData.append("pdf", pdfFile);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/documents/${editDocumentId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Document updated successfully:", response.data);
      resetForm();
      toggleEditModal();
      fetchDocuments();
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update document");
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/documents/${documentId}`
        );

        console.log("Document deleted successfully:", response.data);
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc.document_id !== documentId)
        );
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document");
      }
    }
  };

  const resetForm = () => {
    setDocumentTitle("");
    setSelectedYear("2023-24");
    setImageFile(null);
    setPdfFile(null);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  console.log("Documents:", documents);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-4xl font-bold text-center text-blue-950 realfont2">
        Documents
      </h2>

      <div className="flex justify-start">
        <button
          onClick={toggleModal}
          className="flex items-center gap-2 bg-blue-950 text-white px-2 py-2 rounded-md hover:bg-blue-900 transition-colors"
        >
          <FilePlus className="w-8 h-8" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] h-full realfont">
          <div className="bg-white rounded-lg shadow-md shadow-blue-950 w-[500px] max-w-md h-[400px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-950">Add Document</h3>
              <button
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Upload PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="p-4 border-t w-full bg-blue-900 text-white px-4 py-2 rounded-b-md hover:bg-blue-950 cursor-pointer transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] h-full realfont">
          <div className="bg-white rounded-lg shadow-md shadow-blue-950 w-[500px] max-w-md h-[400px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-950">Edit Document</h3>
              <button
                onClick={() => toggleEditModal()}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Upload New Image 
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Upload New PDF 
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleEditSubmit}
              className="p-4 border-t w-full bg-blue-900 text-white px-4 py-2 rounded-b-md hover:bg-blue-950 cursor-pointer transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}

      {/* Display Documents */}
      <div className="space-y-6 mt-[30px]">
        {documents.map((document, index) => (
          <div
            key={document.document_id || index}
            className="relative flex items-center justify-between bg-white rounded-[7px] border-[1px] shadow-lg border-blue-950 p-2 cursor-pointer hover:shadow-md transition-shadow mb-9 w-2xl"
          >
            <div className="flex items-center space-x-[90px]">
              <div className="text-lg font-semibold text-white bg-blue-950 rounded-[4px] pl-3 pr-3 absolute mb-[80px]">
                {document.year}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600"></div>
                <div className="text-xl font-bold text-gray-800">
                  {document.document_title}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600"></div>
                <div className="text-xl font-bold text-blue-950 flex items-center space-x-4">
                  {document.image_url && (
                    <div
                      className="w-15 h-15 cursor-pointer"
                      onClick={() =>
                        openImageModal(
                          `http://localhost:5000/uploads/${document.image_url}`
                        )
                      }
                    >
                      <Image size={20} className="object-cover w-full h-full hover:text-blue-500" />
                    </div>
                  )}
                  {document.pdf_url && (
                    <a
                      target="_blank"
                      href={`http://localhost:5000/uploads/${document.pdf_url}`}
                      download
                      className="text-blue-950 hover:text-blue-500"
                    >
                      <FileDown size={55} />
                    </a>
                  )}
                </div>
              </div>
              {/* Added Edit Button */}
              <button
                onClick={() => toggleEditModal(document)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition-colors mr-2"
              >
                <Pencil />
              </button>
              <button
                onClick={() => handleDeleteDocument(document.document_id)}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Size Image Modal */}
      {selectedImage && (
        <div className="fixed z-20 inset-0 flex items-center justify-center bg-transparent backdrop-blur-[10px]">
          <div className="rounded-md p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={closeImageModal}
                className="text-red-600 "
              >
                <X className="w-10 h-10 hover:text-red-900" />
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Full-Size Document"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;