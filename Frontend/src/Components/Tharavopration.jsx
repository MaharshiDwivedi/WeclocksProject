import { useEffect, useState, useRef } from "react";
import { Plus, X, Image, AlertCircle, Search, Upload } from "lucide-react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";

export default function Tharavopration({ meetingNumber, meetingId }) {
  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/tharav";
  const API_URL_Purpose = "http://localhost:5000/api/purpose";
  const SERVER_URL = "http://localhost:5000";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNirnayId, setCurrentNirnayId] = useState(null);
  const [insertdate, setInsertdate] = useState("");
  const [nirnay, setNirnay] = useState([]);
  const [filteredNirnay, setFilteredNirnay] = useState([]);
  const [purpose, setPurpose] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteNirnayId, setDeleteNirnayId] = useState(null);

  const schoolId = localStorage.getItem("school_id");
  const userId = localStorage.getItem("user_id");

  const [tharav, setTharav] = useState({
    tharavNo: "",
    purpose: "",
    problemFounded: "",
    where: "",
    what: "",
    howMany: "",
    deadStockNumber: "",
    decisionTaken: "",
    expectedExpenditure: "",
    fixedDate: "",
    photo: "",
  });

  useEffect(() => {
    fetchTharavs();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNirnay(nirnay);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = nirnay.filter((item) => {
        const recordData = item.nirnay_reord
          ? item.nirnay_reord.split("|")
          : [];
        return (
          (recordData[1] &&
            recordData[1].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[2] &&
            recordData[2].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[12] &&
            recordData[12].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[14] &&
            recordData[14].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[13] &&
            recordData[13].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[15] &&
            recordData[15].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[16] &&
            recordData[16].toLowerCase().includes(lowercasedSearch))
        );
      });
      setFilteredNirnay(filtered);
    }
  }, [searchTerm, nirnay]);

  const fetchTharavs = async () => {
    try {
      console.log("Meeting Number in API Call:", meetingNumber);
      console.log("School ID in API Call:", schoolId);
      const res = await fetch(
        `${API_URL}/filter?meeting_number=${meetingNumber}&school_id=${schoolId}`
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setNirnay(data);
      setFilteredNirnay(data);
    } catch (error) {
      console.error("Error fetching Tharavs:", error);
      setNirnay([]);
      setFilteredNirnay([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(API_URL_Purpose);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setPurpose(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setPurpose([]);
    }
  };

  const handleEdit = (nirnay) => {
    const recordData = nirnay.nirnay_reord.split("|");
    setInsertdate(recordData[8]);

    if (recordData[4]) {
      setPreviewImage(`${SERVER_URL}${recordData[4]}`);
    } else {
      setPreviewImage(null);
    }

    setTharav({
      tharavNo: recordData[1] || "",
      decisionTaken: recordData[2] || "",
      expectedExpenditure: recordData[3] || "",
      photo: recordData[4] || "",
      purpose: recordData[11] || "",
      problemFounded: recordData[12] || "",
      where: recordData[13] || "",
      what: recordData[14] || "",
      howMany: recordData[15] || "",
      deadStockNumber: recordData[16] || "",
      fixedDate: recordData[17] || "",
    });
    setCurrentNirnayId(nirnay.nirnay_id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteNirnayId(id);
    setIsDeleteModalOpen(true);
  };

  const handleRemarks = (row) => {
    const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
    navigate(`/home/meetings/tharav/${row.nirnay_id}/remarks`, {
      state: {
        tharavNo: recordData[1] || "N/A",
        date: recordData[8] || "N/A",
        purpose:
          purpose.find((data) => data.head_id == recordData[11])?.head_name ||
          "N/A",
        expectedAmount: recordData[3] || "N/A",
        decisionTaken: recordData[2] || "N/A",
        photo: recordData[4] ? `${SERVER_URL}${recordData[4]}` : null,
      },
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!tharav.tharavNo || !/^[1-9]\d*$/.test(tharav.tharavNo)) {
      newErrors.tharavNo =
        "Tharav No must be a positive number starting from 1.";
    }

    if (!tharav.purpose) {
      newErrors.purpose = "Purpose is required.";
    }

    if (!tharav.problemFounded) {
      newErrors.problemFounded = "Problem Founded is required.";
    }

    if (!tharav.where) {
      newErrors.where = "This field is required.";
    }

    if (!tharav.what) {
      newErrors.what = "This field is required.";
    }

    if (!tharav.howMany || !/^\d+$/.test(tharav.howMany)) {
      newErrors.howMany = "How Many must be a number.";
    }

    if (!tharav.deadStockNumber || !/^\d+$/.test(tharav.deadStockNumber)) {
      newErrors.deadStockNumber = "Dead Stock Number must be a number.";
    }

    if (!tharav.decisionTaken) {
      newErrors.decisionTaken = "Decision Taken is required.";
    }

    if (
      !tharav.expectedExpenditure ||
      !/^\d+$/.test(tharav.expectedExpenditure)
    ) {
      newErrors.expectedExpenditure = "Expected Expenditure must be a number.";
    }

    if (!tharav.fixedDate) {
      newErrors.fixedDate = "Fixed Date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormError("");

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
      2,
      "0"
    )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;

    const photoValue =
      tharav.photo instanceof File ? tharav.photo.name : tharav.photo;

    const memberData = `${meetingNumber}|${tharav.tharavNo}|${
      tharav.decisionTaken
    }|${
      tharav.expectedExpenditure
    }|${photoValue}|${schoolId}|${userId}|Pending|${
      !isEditing ? formattedDate : insertdate
    }|${formattedDate}|0000-00-00 00:00:00|${tharav.purpose}|${
      tharav.problemFounded
    }|${tharav.where}|${tharav.what}|${tharav.howMany}|${
      tharav.deadStockNumber
    }|${tharav.fixedDate}`;

    const formData = new FormData();
    formData.append("nirnay_reord", memberData);

    if (tharav.photo instanceof File) {
      formData.append("photo", tharav.photo);
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentNirnayId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save nirnay");

      closeModal();
      fetchTharavs();
    } catch (error) {
      console.error("Fetch error:", error);
      setFormError("Failed to save Tharav. Please try again.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setTharav({
      tharavNo: "",
      purpose: "",
      problemFounded: "",
      where: "",
      what: "",
      howMany: "",
      deadStockNumber: "",
      decisionTaken: "",
      expectedExpenditure: "",
      fixedDate: "",
      photo: "",
    });
    setPreviewImage(null);
    setCurrentNirnayId(null);
    setErrors({});
    setFormError("");
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setPreviewImage(null);
    setTharav({
      tharavNo: "",
      purpose: "",
      problemFounded: "",
      where: "",
      what: "",
      howMany: "",
      deadStockNumber: "",
      decisionTaken: "",
      expectedExpenditure: "",
      fixedDate: "",
      photo: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTharav((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      setTharav((prev) => ({
        ...prev,
        photo: file,
      }));
    }
  };

  const handleWebcamCapture = (capturedImage) => {
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `webcam_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setTharav((prev) => ({
            ...prev,
            photo: file,
          }));
          setPreviewImage(capturedImage);
        });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const columns = [
    {
      name: "Sr. No.",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
      hide: "sm",
    },
    {
      name: "Tharav No.",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[1] || "N/A";
      },
      width: "120px",
    },
    {
      name: "Problem Founded",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[12] || "N/A";
      },
      sortable: true,
      width: "200px",
    },
    {
      name: "Purpose",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return (
          purpose.find((data) => data.head_id == recordData[11])?.head_name ||
          "N/A"
        );
      },
      sortable: true,
      width: "150px",
    },
    {
      name: "How Many",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[15] || "N/A";
      },
      sortable: true,
      width: "100px",
    },
    {
      name: "What",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[14] || "N/A";
      },
      sortable: true,
      width: "150px",
    },
    {
      name: "Where",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[13] || "N/A";
      },
      sortable: true,
      width: "150px",
    },
    {
      name: "Expense",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return `₹${recordData[3] || "0"}`;
      },
      sortable: true,
      width: "120px",
    },
    {
      name: "Decision",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[2] || "N/A";
      },
      sortable: true,
      width: "200px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 gap-5">
          <button
            onClick={() => handleEdit(row)}
            className="text-yellow-500 hover:text-yellow-600"
          >
            <span className="realfont2 text-teal-500 text-lg">EDIT</span>
          </button>
          <button
            onClick={() => handleDelete(row.nirnay_id)}
            className="text-red-500 hover:text-red-600"
          >
            <span className="realfont2 text-lg">DELETE</span>
          </button>
          <button
            onClick={() => handleRemarks(row)}
            className="text-blue-500 hover:text-blue-600"
          >
            <span className="realfont2 text-lg">REMARKS</span>
          </button>
        </div>
      ),
      width: "200px",
    },
  ];

  return (
    <div className="container mx-auto px-0 py-8">
      <div className="bg-white shadow-md w-[1200px] mx-auto">
        <div className="bg-blue-950 text-white px-6 py-2 flex justify-between items-center realfont2">
          <h2 className="text-2xl font-bold">Tharav Management</h2>
          <button
            onClick={handleOpenModal}
            className="bg-white text-blue-950 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center"
          >
            <Plus className="mr-2" /> Add Tharav
          </button>
        </div>

        <div className="p-4 bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow px-4 text-[20px]">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-[300px] pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-7 top-3 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto w-[1200px]">
          <div className="min-w-[160px]">
            <DataTable
              columns={columns}
              data={filteredNirnay}
              pagination
              highlightOnHover
              customStyles={{
                table: {
                  style: {
                    width: "auto",
                  },
                },
                headCells: {
                  style: {
                    backgroundColor: "#f3f4f6",
                    fontSize: "18px",
                    fontFamily: "Poppins",
                    fontWeight: 400,
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    padding: "0 8px",
                  },
                },
                cells: {
                  style: {
                    fontSize: "16px",
                    fontFamily: "Poppins",
                    color: "#333",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                    padding: "0 8px",
                  },
                },
              }}
              responsive={false}
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 300px)"
            />
          </div>
        </div>

        {filteredNirnay.length === 0 && (
          <div className="text-center p-8 text-gray-500">No tharavs found</div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 realfont p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950">
                Confirm Delete
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-700 font-bold">
                Are you sure you want to delete this Tharav?
              </p>
            </div>

            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.delete(
                      `http://localhost:5000/api/tharav/${deleteNirnayId}`
                    );
                    setNirnay((prev) =>
                      prev.filter((item) => item.nirnay_id !== deleteNirnayId)
                    );
                    setFilteredNirnay((prev) =>
                      prev.filter((item) => item.nirnay_id !== deleteNirnayId)
                    );
                    setIsDeleteModalOpen(false);
                  } catch (error) {
                    console.error("Error deleting Tharav:", error);
                    setFormError("Failed to delete Tharav");
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 realfont">
          <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-900">
                {isEditing ? "Edit Tharav" : "Add Tharav"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="text-red-500 text-sm mb-4 flex items-center p-3 bg-red-50 rounded-md">
                  <AlertCircle className="mr-2 flex-shrink-0" size={20} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Tharav No.
                  </label>
                  <input
                    type="text"
                    name="tharavNo"
                    value={tharav.tharavNo}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.tharavNo
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Enter tharav no"
                  />
                  {errors.tharavNo && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.tharavNo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Purpose
                  </label>
                  <select
                    name="purpose"
                    value={tharav.purpose}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.purpose
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Select Purpose</option>
                    {purpose.map((item) => (
                      <option key={item.head_id} value={item.head_id}>
                        {item.head_name}
                      </option>
                    ))}
                  </select>
                  {errors.purpose && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.purpose}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Problem Found
                </label>
                <textarea
                  name="problemFounded"
                  value={tharav.problemFounded}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.problemFounded
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  rows="3"
                  placeholder="Describe the problem"
                ></textarea>
                {errors.problemFounded && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    {errors.problemFounded}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Where
                  </label>
                  <input
                    type="text"
                    name="where"
                    value={tharav.where}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.where
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Location"
                  />
                  {errors.where && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.where}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">What</label>
                  <input
                    type="text"
                    name="what"
                    value={tharav.what}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.what
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Item/Issue"
                  />
                  {errors.what && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.what}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    How Many
                  </label>
                  <input
                    type="text"
                    name="howMany"
                    value={tharav.howMany}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.howMany
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Quantity"
                  />
                  {errors.howMany && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.howMany}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Dead Stock Number
                  </label>
                  <input
                    type="text"
                    name="deadStockNumber"
                    value={tharav.deadStockNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.deadStockNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Stock number if applicable"
                  />
                  {errors.deadStockNumber && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.deadStockNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Decision Taken
                </label>
                <textarea
                  name="decisionTaken"
                  value={tharav.decisionTaken}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.decisionTaken
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500"
                  }`}
                  rows="3"
                  placeholder="Decision details"
                ></textarea>
                {errors.decisionTaken && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    {errors.decisionTaken}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Expected Expenditure
                  </label>
                  <input
                    type="text"
                    name="expectedExpenditure"
                    value={tharav.expectedExpenditure}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.expectedExpenditure
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                    placeholder="Amount in ₹"
                  />
                  {errors.expectedExpenditure && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.expectedExpenditure}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Fixed Date
                  </label>
                  <input
                    type="date"
                    name="fixedDate"
                    value={tharav.fixedDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      errors.fixedDate
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    }`}
                  />
                  {errors.fixedDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {errors.fixedDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-large">Photo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <Upload className="mr-15" size={18} />
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    className="flex items-center px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    <Image className="mr-15" size={18} />
                    Use Webcam
                  </button>
                </div>

                {previewImage && (
                  <div className="mt-4 relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full max-h-40 object-contain rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setTharav((prev) => ({ ...prev, photo: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditing ? "Update Tharav" : "Save Tharav"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
