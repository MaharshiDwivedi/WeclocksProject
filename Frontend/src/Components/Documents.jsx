import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Eye,
  FileDown,
  Pencil,
  Trash2,
  AlertCircle,
  Search,
} from "lucide-react";
import axios from "axios";
import DataTable from "react-data-table-component";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [documentTitle, setDocumentTitle] = useState("");
  const [year, setYear] = useState("2023-24");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/documents");
      setDocuments(response.data);
      setFilteredDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Pre-fill form for editing
  useEffect(() => {
    if (selectedDocument) {
      setDocumentTitle(selectedDocument.document_title);
      setYear(selectedDocument.year);
      setFilePreview(
        selectedDocument.file_url
          ? `http://localhost:5000/uploads/${selectedDocument.file_url}`
          : null
      );
    } else {
      resetForm();
    }
  }, [selectedDocument]);

  // Validate file type and size
  const validateFile = (file) => {
    if (!file) {
      setErrors((prev) => ({ ...prev, file: "File is required" }));
      return false;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        file: "Only JPG, PNG, and PDF files are allowed",
      }));
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        file: "File size should be less than 5MB",
      }));
      return false;
    }

    return true;
  };

  // Handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (validateFile(file)) {
      setFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));

      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!documentTitle.trim())
      newErrors.documentTitle = "Document title is required";
    if (!file) newErrors.file = "File is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (validateForm()) {
      const formData = new FormData();
      formData.append("document_title", documentTitle);
      formData.append("year", year);
      formData.append("file", file);

      try {
        if (selectedDocument) {
          await axios.put(
            `http://localhost:5000/api/documents/${selectedDocument.document_id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } else {
          await axios.post("http://localhost:5000/api/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        fetchDocuments();
        resetForm();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error saving document:", error);
      }
    }
  };

  // Delete document
  const handleDelete = async (documentId) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await axios.delete(`http://localhost:5000/api/documents/${documentId}`);
        fetchDocuments();
      } catch (error) {
        console.error("Error deleting document:", error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setDocumentTitle("");
    setYear("2023-24");
    setFile(null);
    setFilePreview(null);
    setErrors({});
    setSelectedDocument(null);
  };

  // Filter documents
  const filterDocuments = (term, year) => {
    let filtered = documents.filter((doc) => {
      const matchesTerm = term
        ? doc.document_title.toLowerCase().includes(term)
        : true;
      const matchesYear = year ? doc.year === year : true;
      return matchesTerm && matchesYear;
    });
    setFilteredDocuments(filtered);
  };

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterDocuments(term, selectedYear);
  };

  // Handle year filter
  const handleYearFilter = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    filterDocuments(searchTerm, year);
  };

  // Table columns
  const columns = [
    {
      name: "Document Title",
      selector: (row) => row.document_title,
      sortable: true,
    },
    { name: "Year", selector: (row) => row.year, sortable: true },
    {
      name: "File",
      cell: (row) => (
        <button
          onClick={() => {
            const fileUrl = `http://localhost:5000/uploads/${row.file_url}`;
            row.file_url.endsWith(".pdf")
              ? window.open(fileUrl, "_blank")
              : setSelectedFile(fileUrl);
          }}
          className="text-blue-600 hover:text-blue-800"
        >
          {row.file_url.endsWith(".pdf") ? <FileDown /> : <Eye />}
        </button>
      ),
      center: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedDocument(row);
              setIsModalOpen(true);
            }}
            className="text-yellow-500 hover:text-yellow-600"
          >
            <Pencil />
          </button>
          <button
            onClick={() => handleDelete(row.document_id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 />
          </button>
        </div>
      ),
      center: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Document Management</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-950 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center"
          >
            <Plus className="mr-2" /> Add Document
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 flex space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            value={selectedYear}
            onChange={handleYearFilter}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="2023-24">2023-24</option>
            <option value="2024-25">2024-25</option>
          </select>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredDocuments}
          pagination
          highlightOnHover
          customStyles={{
            headCells: {
              style: { backgroundColor: "#f3f4f6", fontSize:"16px" },
            },
          }}
        />

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No documents found
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-950">
                {selectedDocument ? "Edit Document" : "Add Document"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.documentTitle
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  placeholder="Enter document title"
                />
                {errors.documentTitle && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="mr-2" size={16} />{" "}
                    {errors.documentTitle}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium ">
                  Upload File (Image or PDF)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.file
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                />
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="mr-2" size={16} /> {errors.file}
                  </p>
                )}

                {filePreview && (
                  <div className="mt-4 flex justify-center">
                    {filePreview.startsWith("data:image") ? (
                      <img
                        src={filePreview}
                        alt="File Preview"
                        className="max-w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex items-center text-blue-600 ">
                        <FileDown className="mr-2" /> PDF File Selected
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-950 text-white py-3 rounded-md hover:bg-blue-900 transition-colors"
              >
                {selectedDocument ? "Update Document" : "Add Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0  bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2"
            >
              <X className="text-black" />
            </button>
            {selectedFile.endsWith(".pdf") ? (
              <iframe
                src={selectedFile}
                className="w-full h-[90vh]"
                title="PDF Preview"
              />
            ) : (
              <img
                src={selectedFile}
                alt="Document"
                className="max-w-full max-h-[90vh] object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
