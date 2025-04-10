"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Image,
  FileDown,
  AlertCircle,
  Search,
  Upload,
} from "lucide-react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

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
  const [year, setYear] = useState("2024-25");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const { t } = useTranslation();
  const modalRef = useRef(null);

  // Add responsive detection
  useEffect(() => {
    const handleResize = () => {
      // Removed unused isMobile state
    }; 

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setIsModalOpen(false);
        resetForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

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
      if (selectedDocument.file_url) {
        setFileName(selectedDocument.file_url);
      }
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
    if (file && validateFile(file)) {
      setFile(file);
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, file: undefined }));

      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else if (!file) {
      if (!selectedDocument) {
        setFileName("");
        setFilePreview(null);
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!documentTitle.trim())
      newErrors.documentTitle = "Document title is required";
    if (!file && !selectedDocument) newErrors.file = "File is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
const handleSubmit = async () => {
  if (validateForm()) {
    const result = await Swal.fire({
      title: selectedDocument ? t('Update Document?') : t('Add Document?'),
      text: selectedDocument 
        ? t('Are you sure you want to update this document?') 
        : t('Are you sure you want to add this document?'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('Yes, proceed'),
      cancelButtonText: t('Cancel')
    });

    if (result.isConfirmed) {
      const formData = new FormData();
      formData.append("document_title", documentTitle);
      formData.append("year", year);
      if (file) {
        formData.append("file", file);
      }

      try {
        if (selectedDocument) {
          await axios.put(
            `http://localhost:5000/api/documents/${selectedDocument.document_id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
          Swal.fire({
            icon: "success",
            title: t("Success"),
            text: t("Document updated successfully"),
            confirmButtonText: t("OK"),
          });
        } else {
          await axios.post("http://localhost:5000/api/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          Swal.fire({
            icon: "success",
            title: t("Success"),
            text: t("Document added successfully"),
            confirmButtonText: t("OK"),
          });
        }
        fetchDocuments();
        resetForm();
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error saving document:", error);
        Swal.fire({
          icon: "error",
          title: t("Error"),
          text: t("Failed to save document"),
          confirmButtonText: t("OK"),
        });
      }
    }
  }
};
  // Delete document
  const handleDelete = (documentId) => {
    Swal.fire({
      title: t("Confirm Delete"),
      text: t("Are you sure you want to delete this document?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("Delete"),
      cancelButtonText: t("Cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:5000/api/documents/${documentId}`
          );
          fetchDocuments();
          Swal.fire({
            icon: "success",
            title: t("Deleted"),
            text: t("Document deleted successfully"),
            confirmButtonText: t("OK"),
          });
        } catch (error) {
          console.error("Error deleting document:", error);
          Swal.fire({
            icon: "error",
            title: t("Error"),
            text: t("Failed to delete document"),
            confirmButtonText: t("OK"),
          });
        }
      }
    });
  };

  // Reset form
  const resetForm = () => {
    setDocumentTitle("");
    setYear("2023-24");
    setFile(null);
    setFilePreview(null);
    setFileName("");
    setErrors({});
    setSelectedDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filter documents
  const filterDocuments = (term, year) => {
    const filtered = documents.filter((doc) => {
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

  // Updated columns with responsive design
  const columns = [
    {
      name: t("Sr. No."),
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
      hide: "sm",
    },
    {
      name: t("Document Title"),
      selector: (row) => row.document_title,
      sortable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: t("Year"),
      selector: (row) => row.year,
      sortable: true,
      hide: "md",
      minWidth: "120px",
    },
    {
      name: t("File"),
      cell: (row) => (
        <button 
          onClick={() => {
            const fileUrl = `http://localhost:5000/uploads/${row.file_url}`;
            row.file_url.endsWith(".pdf")
              ? window.open(fileUrl, "_blank")
              : setSelectedFile(fileUrl);
          }}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 cursor-pointer"
          title={
            row.file_url.endsWith(".pdf") ? t("View PDF") : t("View Image")
          }
        >
          {row.file_url.endsWith(".pdf") ? (
            <FileDown size={26} className="text-red-600" />
          ) : (
            <Image size={26} className="text-blue-600" />
          )}
        </button>
      ),
      width: "100px",
    },
    {
      name: t("Actions"),
      cell: (row) => (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2 ">
          <button
            className="cursor-pointer"
            onClick={() => {
              setSelectedDocument(row);
              setIsModalOpen(true);
            }}
            title={t("Edit")}
          >
            <span className="  text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg min-w-[60px] text-center">
              {t("EDIT")}
            </span>
          </button>
          <button className="cursor-pointer" onClick={() => handleDelete(row.document_id)} title="Delete">
            <span className="flex items-center text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[75px] text-center">
              {t("DELETE")}
            </span>
          </button>
        </div>
      ),
      minWidth: "150px",
    },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10 realfont">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2">
            {t("Document Management")}
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-950 px-4 py-2 rounded-md realfont2 hover:bg-blue-100 flex items-center w-full sm:w-auto justify-center cursor-pointer"
          >
            <Plus className="mr-2" size={18} /> {t("Add Document")}
          </button>
        </div>

        {/* Filters - make responsive */}
        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="relative w-full sm:w-[300px]">
            <input
              type="text"
              placeholder={t("Search")}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all duration-200"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <select
            value={selectedYear}
            onChange={handleYearFilter}
            className="px-3 py-2 border mr-2 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 realfont2 w-full sm:w-auto"
          >
            <option value="">{t("All Years")}</option>
            <option value="2023-24">2023-24</option>
            <option value="2024-25">2024-25</option>
          </select>
        </div>

        {/* Table - make responsive */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredDocuments}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            defaultSortFieldId={1}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#f3f4f6",
                  fontSize: "14px",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                  justifyContent: "center",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  borderRight: "1px solid rgba(229, 231, 235, 0.5)",
                  borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  color: "#333",
                  justifyContent: "center",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                  borderRight: "1px solid rgba(229, 231, 235, 0.5)",
                  borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
                },
              },
              rows: {
                style: {
                  fontSize: "14px",
                  fontFamily: "Poppins",
                },
                stripedStyle: {
                  backgroundColor: "rgba(249, 250, 251, 0.5)",
                },
              },
              pagination: {
                style: {
                  fontSize: "14px",
                  minHeight: "56px",
                  borderTopStyle: "solid",
                  borderTopWidth: "1px",
                  borderTopColor: "#f3f4f6",
                },
              },
            }}
          />
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="text-center p-4 md:p-8 text-gray-500">
            {t("No documents found")}
          </div>
        )}
      </div>

      {/* Add/Edit Modal - make responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out"
          >
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center">
                {selectedDocument ? t("Edit Document") : t("Add Document")}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                  {t("Document Title")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className={`w-full p-2 sm:p-2.5 border ${
                    errors.documentTitle ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm sm:text-base`}
                  placeholder={t("Enter document title")}
                />
                {errors.documentTitle && (
                  <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                    <AlertCircle className="mr-1" size={12} /> {errors.documentTitle}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                  {t("Year")} <span className="text-red-500">*</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-2 sm:p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm sm:text-base"
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                  {t("Upload File (Image or PDF)")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className={`inline-flex items-center px-4 py-2 ${
                      errors.file
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-blue-950 hover:bg-blue-900"
                    } text-white text-sm font-medium rounded-md cursor-pointer transition duration-200`}
                  >
                    <Upload className="mr-2" size={16} />
                    {t("Choose File")}
                  </label>
                  <div className="mt-2 text-sm">
                    {fileName ? (
                      <span className="font-medium text-blue-950 break-all">
                        {fileName.length > 30
                          ? fileName.substring(0, 30) + "..."
                          : fileName}
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        {t("No file chosen")}
                      </span>
                    )}
                  </div>
                </div>
                {errors.file && (
                  <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                    <AlertCircle className="mr-1" size={12} /> {errors.file}
                  </p>
                )}

                {filePreview && (
                  <div className="mt-4 flex justify-center">
                    {filePreview.endsWith(".pdf") ||
                    (filePreview.startsWith("http") &&
                      filePreview.endsWith(".pdf")) ? (
                      <div className="flex items-center text-blue-600 bg-blue-50 p-3 rounded-md w-full justify-center">
                        <FileDown className="mr-2" /> {t("PDF File Selected")}
                      </div>
                    ) : (
                      <img
                        src={filePreview || "/placeholder.svg"}
                        alt="File Preview"
                        className="max-w-full h-40 object-cover rounded-md border border-gray-200"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 md:p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-blue-950 rounded-lg hover:bg-blue-900 transition-colors"
              >
                {selectedDocument ? t("Update Document") : t("Add Document")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal - make responsive */}
      {selectedFile && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-lg shadow-2xl transform transition-all duration-300 ease-in-out">
            <button
              onClick={() => setSelectedFile(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 z-10 shadow-md hover:bg-gray-100 transition-colors"
            >
              <X className="text-black" size={20} />
            </button>
            {selectedFile.endsWith(".pdf") ? (
              <iframe
                src={selectedFile}
                className="w-full h-[80vh] md:h-[90vh] rounded-lg"
                title={t("PDF Preview")}
              />
            ) : (
              <div className="p-2">
                <img
                  src={selectedFile || "/placeholder.svg"}
                  alt={t("Document")}
                  className="max-w-full max-h-[80vh] md:max-h-[90vh] object-contain mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
