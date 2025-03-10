
import { useEffect, useState, useRef } from "react";
import { Plus, X, Image, FileDown, AlertCircle, Search, Upload } from "lucide-react";
import axios from "axios";
import DataTable from "react-data-table-component";
import WebcamCapture from "./WebcamCapture";
import Swal from "sweetalert2"; // Import SweetAlert2

export default function Tharavopration() {
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
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  


  
  

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
        const recordData = item.nirnay_reord ? item.nirnay_reord.split("|") : [];
        return (
          (recordData[1] && recordData[1].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[2] && recordData[2].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[12] && recordData[12].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[14] && recordData[14].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[13] && recordData[13].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[15] && recordData[15].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[16] && recordData[16].toLowerCase().includes(lowercasedSearch))
        );
      });
      setFilteredNirnay(filtered);
    }
  }, [searchTerm, nirnay]);

  //   try {
  //     const res = await fetch(API_URL);
  //     if (!res.ok) throw new Error("Failed to fetch data");
  //     const data = await res.json();
  //     const sortedData = Array.isArray(data)
  //       ? data.sort((a, b) => {
  //           const recordA = a.nirnay_reord?.split("|");
  //           const recordB = b.nirnay_reord?.split("|");
  //           return recordB[8]?.localeCompare(recordA[8]);
  //         })
  //       : [];
  //     setNirnay(sortedData);
  //     setFilteredNirnay(sortedData);
  //   } catch (error) {
  //     console.error("Error fetching Tharavs:", error);
  //     setNirnay([]);
  //     setFilteredNirnay([]);
  //   }
  // };
  const fetchTharavs = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      const sortedData = Array.isArray(data)
        ? data.sort((a, b) => {
            const recordA = a.nirnay_reord?.split("|");
            const recordB = b.nirnay_reord?.split("|");
            // Sort by tharavNo in ascending order
            return recordA[1]?.localeCompare(recordB[1]);
          })
        : [];
      setNirnay(sortedData);
      setFilteredNirnay(sortedData);
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

 


const handleDelete = async (id) => {
  // Show confirmation popup
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (!result.isConfirmed) return; // Stop if user cancels

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

    if (!res.ok) {
      throw new Error("Failed to delete nirnay");
    }

    Swal.fire({
      title: "Deleted!",
      text: "Nirnay has been deleted successfully.",
      icon: "success",
      timer: 2000, // Auto-close after 2 seconds
    });

    fetchTharavs(); // Refresh the list after deletion
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete nirnay. Please try again.",
      icon: "error",
    });

    console.error("Error deleting nirnay:", error);
  }
};

const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Tharav Data Before Submit:", tharav);

    // ✅ 1. Check if all required fields are filled
    for (let key in tharav) {
        if (typeof tharav[key] === "string" && !tharav[key].trim()) {
            Swal.fire({
                icon: "error",
                title: "Missing Field!",
                text: `${key.replace(/([A-Z])/g, " $1")} is required.`,
            });
            return;
        }

        if (tharav[key] === null || tharav[key] === undefined) {
            Swal.fire({
                icon: "error",
                title: "Missing Field!",
                text: `${key.replace(/([A-Z])/g, " $1")} is required.`,
            });
            return;
        }
    }

    // ✅ 2. Validate that 'tharavNo' is unique (ONLY WHEN ADDING A NEW ONE)
    if (!isEditing) {
        if (nirnay.some(item => item.nirnay_reord?.split("|")[1] === tharav.tharavNo)) {
            Swal.fire({
                icon: "error",
                title: "Duplicate Tharav No!",
                text: "Tharav No must be unique. Please enter a different number.",
            });
            return;
        }
    }

    // ✅ 3. Validate numeric fields (allow infinite digits)
    const numericFields = ["expectedExpenditure", "howMany", "deadStockNumber"];
    for (let field of numericFields) {
        if (!/^\d+$/.test(tharav[field])) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Input!",
                text: `${field.replace(/([A-Z])/g, " $1")} must be a number.`,
            });
            return;
        }
    }

    // ✅ 4. Validate tharavNo (must be a positive number starting from 1, no max limit)
if (!/^[1-9]\d*$/.test(tharav.tharavNo)) {
  Swal.fire({
      icon: "warning",
      title: "Invalid Tharav No!",
      text: "Tharav No must be a positive number starting from 1, with no upper limit.",
  });
  return;
}


    // ✅ 5. Validate character string fields
    const stringFields = ["problemFounded", "where", "what", "decisionTaken"];
    for (let field of stringFields) {
        if (!/^[a-zA-Z\s]+$/.test(tharav[field])) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Input!",
                text: `${field.replace(/([A-Z])/g, " $1")} must contain only letters and spaces.`,
            });
            return;
        }
    }

    // ✅ 6. Ask for confirmation before proceeding
    const confirmation = await Swal.fire({
        title: isEditing ? "Are you sure?" : "Confirm Adding",
        text: isEditing ? "Do you want to update this Tharav?" : "Do you want to add this Tharav?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: isEditing ? "Yes, Update Tharav" : "Yes, Add Tharav",
        cancelButtonText: "Cancel",
    });

    if (!confirmation.isConfirmed) {
        return; // Stop submission if the user cancels
    }

    // ✅ 7. Prepare Data for Submission
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")} ${String(
        currentDate.getHours()
    ).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(2, "0")}:${String(
        currentDate.getSeconds()
    ).padStart(2, "0")}`;

    const photoValue = tharav.photo instanceof File ? tharav.photo.name : tharav.photo;

    const memberData = `1|${tharav.tharavNo}|${tharav.decisionTaken}|${
        tharav.expectedExpenditure
    }|${photoValue}|14|34|Pending|${
        !isEditing ? formattedDate : insertdate
    }|${formattedDate}|0000-00-00 00:00:00|${tharav.purpose}|${
        tharav.problemFounded
    }|${tharav.where}|${tharav.what}|${tharav.howMany}|${tharav.deadStockNumber}|${tharav.fixedDate}`;
   

    const formData = new FormData();
    formData.append("nirnay_reord", memberData);

    if (tharav.photo instanceof File) {
        formData.append("photo", tharav.photo);
    }

    // ✅ 8. Send Data to API
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentNirnayId}` : API_URL;

    try {
        const res = await fetch(url, {
            method,
            body: formData,
        });

        if (!res.ok) throw new Error("Failed to save nirnay");

        // ✅ 9. Show Success Alert
        await Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Tharav has been ${isEditing ? "updated" : "created"} successfully.`,
            confirmButtonColor: "#4CAF50",
        });

        closeModal();
        fetchTharavs();
    } catch (error) {
        console.error("Fetch error:", error);
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: `Something went wrong: ${error.message}`,
        });
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
      name: "Tharav No.",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[1] || "N/A";
      },
      sortable: true,
      width: "120px", // Fixed width for Tharav No.
    },
    {
      name: "Problem Founded",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[12] || "N/A";
      },
      sortable: true,
      width: "200px", // Fixed width for Problem Founded
    },
    {
      name: "Purpose",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return purpose.find((data) => data.head_id == recordData[11])?.head_name || "N/A";
      },
      sortable: true,
      width: "150px", // Fixed width for Purpose
    },
    {
      name: "How Many",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[15] || "N/A";
      },
      sortable: true,
      width: "100px", // Fixed width for How Many
    },
    {
      name: "What",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[14] || "N/A";
      },
      sortable: true,
      width: "150px", // Fixed width for What
    },
    {
      name: "Where",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[13] || "N/A";
      },
      sortable: true,
      width: "150px", // Fixed width for Where
    },
    {
      name: "Expense",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return `₹${recordData[3] || "0"}`;
      },
      sortable: true,
      width: "120px", // Fixed width for Expense
    },
    {
      name: "Decision",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[2] || "N/A";
      },
      sortable: true,
      width: "200px", // Fixed width for Decision
    },
    {
      name: "Photo",
      cell: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : [];
        return recordData[4] ? (
          <img
            src={`${SERVER_URL}${recordData[4]}`}
            alt="Tharav Photo"
            className="w-12 h-12 object-cover rounded-md border shadow hover:scale-150 transition-transform cursor-zoom-in"
          />
        ) : (
          <div className="text-sm text-gray-500">No image</div>
        );
      },
      width: "120px", // Fixed width for Photo
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
        </div>
      ),
      width: "150px", // Fixed width for Actions
    },
  ];




  return (
    <div className="container mx-auto px-0 py-8  ">
      <div className="bg-white shadow-md  w-[1200px] mx-auto ">
        {/* Header */}
        <div className="bg-blue-950 text-white px-6 py-2 flex justify-between items-center realfont2 ">
          <h2 className="text-2xl font-bold">Tharav Management</h2>
          <button
            onClick={handleOpenModal}
            className="bg-white text-blue-950 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center"
          >
            <Plus className="mr-2" /> Add Tharav
          </button>
        </div>

        {/* Filters */}
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

        {/* Table Container with Scroll */}
        <div className=" overflow-x-auto w-[1200px]">
          <div className="min-w-[160px]"> {/* Added minimum width to force scrolling */}
            <DataTable
              columns={columns}
              data={filteredNirnay}
              pagination
              highlightOnHover
              customStyles={{
                table: {
                  style: {
                    width: '100%',
                    minWidth: '800px', // Match the wrapper's min-width
                    
                  },
                },
                headCells: {
                  style: {
                    backgroundColor: "#f3f4f6",
                    fontSize: "18px",
                    fontFamily: "Poppins",
                    fontWeight: 400,
                    justifyContent: "center",
                    whiteSpace: 'nowrap',
                    padding: '0 8px', // Add padding for better spacing
                  },
                },
                cells: {
                  style: {
                    fontSize: "16px",
                    fontFamily: "Poppins",
                    color: "#333",
                    justifyContent: "center",
                    whiteSpace: 'nowrap',
                    padding: '0 8px', // Add padding for better spacing
                  },
                },
              }}
              responsive={false}
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 300px)"
            />
          </div>
        </div>

        {/* Empty State */}
        {filteredNirnay.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No tharavs found
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
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
                <label className="block mb-2 text-sm font-medium">Purpose</label>
                <select
                  name="purpose"
                  value={tharav.purpose}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Purpose</option>
                  {purpose.map((item) => (
                    <option key={item.head_id} value={item.head_id}>
                      {item.head_name}
                    </option>
                  ))}
                </select>
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
                  className="w-[500px] px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Describe the problem"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Where</label>
                  <input
                    type="text"
                    name="where"
                    value={tharav.where}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Location"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">What</label>
                  <input
                    type="text"
                    name="what"
                    value={tharav.what}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Item/Issue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">How Many</label>
                  <input
                    type="text"
                    name="howMany"
                    value={tharav.howMany}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Quantity"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Stock number if applicable"
                  />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Decision details"
                ></textarea>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Amount in ₹"
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              
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

              {/* Webcam Component (Hidden by default) */}
              {/* Include WebcamCapture component here */}


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





















