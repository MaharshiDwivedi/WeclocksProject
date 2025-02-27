import { useState,useEffect } from "react";
import { Plus, X, Upload } from "lucide-react";
import axios from "axios";

const Documents = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedYear, setSelectedYear] = useState("2023-24");
  const [file, setFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // State to track the selected image

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
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
    if (!documentTitle || !file) {
      alert("Please enter document title and upload a file.");
      return;
    }

    




    
    const formData = new FormData();
    formData.append("document_title", documentTitle);
    formData.append("year", selectedYear);
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:5000/api/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Document added successfully:", response.data);
      resetForm();
      toggleModal();
      fetchDocuments();
    } catch (error) {
      console.error("Error submitting document:", error);
      alert("Failed to submit document");
    }
  };

  const resetForm = () => {
    setDocumentTitle("");
    setSelectedYear("2023-24");
    setFile(null);
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl); // Set the selected image URL
  };

  const closeImageModal = () => {
    setSelectedImage(null); // Close the modal
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-4xl font-bold text-center text-blue-950">Documents</h2>

      <div className="flex justify-start">
        <button
          onClick={toggleModal}
          className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Document
        </button>
      </div>

      {isOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] h-full">
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
                <label className="block text-sm font-medium text-blue-950">Document Title</label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">Select Year</label>
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
                <label className="block text-sm font-medium text-blue-950">Upload File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
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

      {/* Display Documents */}
      <div className="space-y-6 mt-[30px]">
        {documents.map((document, index) => (
          <div
            key={document.document_id || index}
            className="relative flex items-center justify-between bg-white rounded-[20px] border-2 border-blue-950 p-2 cursor-pointer hover:shadow-md transition-shadow mb-9 w-2xl"
          >
            <div className="flex items-center space-x-[90px]">
              <div className="text-lg font-semibold text-white bg-blue-950 rounded-[10px] pl-3 pr-3 absolute mb-[80px]">
                {document.year}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600"></div>
                <div className="text-xl font-bold text-gray-800">{document.document_title}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600"></div>
                <div className="text-xl font-bold text-gray-800">
                  {document.image_url && (
                    <img
                      src={`http://localhost:5000/uploads/${document.image_url}`}
                      alt="Document"
                      className="w-20 h-20 object-cover cursor-pointer"
                      onClick={() => openImageModal(`http://localhost:5000/uploads/${document.image_url}`)}
                    />
                  )}
                </div>
              </div>




              
            </div>
          </div>
        ))}
      </div>

      {/* Full-Size Image Modal */}
      {selectedImage && (
        <div className="fixed z-20 inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-950">Full-Size Image</h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
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