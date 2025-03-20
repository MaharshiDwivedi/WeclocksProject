import { useEffect, useState, useRef } from "react"
import { Plus, X, AlertCircle, Search, Upload, Trash2, Edit, MessageSquare } from "lucide-react"
import DataTable from "react-data-table-component"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function TharavOperation({ meetingNumber, meetingId }) {
  const navigate = useNavigate()
  const API_URL = "http://localhost:5000/api/tharav"
  const API_URL_Purpose = "http://localhost:5000/api/purpose"
  const SERVER_URL = "http://localhost:5000"
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentNirnayId, setCurrentNirnayId] = useState(null)
  const [insertdate, setInsertdate] = useState("")
  const [nirnay, setNirnay] = useState([])
  const [filteredNirnay, setFilteredNirnay] = useState([])
  const [purpose, setPurpose] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState("")
  const fileInputRef = useRef(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteNirnayId, setDeleteNirnayId] = useState(null)

  const schoolId = localStorage.getItem("school_id")
  const userId = localStorage.getItem("user_id")

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
  })

  // Add responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    fetchTharavs()
    fetchMembers()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNirnay(nirnay)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = nirnay.filter((item) => {
        const recordData = item.nirnay_reord ? item.nirnay_reord.split("|") : []
        return (
          (recordData[1] && recordData[1].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[2] && recordData[2].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[12] && recordData[12].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[14] && recordData[14].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[13] && recordData[13].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[15] && recordData[15].toLowerCase().includes(lowercasedSearch)) ||
          (recordData[16] && recordData[16].toLowerCase().includes(lowercasedSearch))
        )
      })
      setFilteredNirnay(filtered)
    }
  }, [searchTerm, nirnay])

  const fetchTharavs = async () => {
    try {
      const res = await fetch(`${API_URL}/filter?meeting_number=${meetingNumber}&school_id=${schoolId}`)
      if (!res.ok) throw new Error("Failed to fetch data")
      const data = await res.json()
      setNirnay(data)
      setFilteredNirnay(data)
    } catch (error) {
      console.error("Error fetching Tharavs:", error)
      setNirnay([])
      setFilteredNirnay([])
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch(API_URL_Purpose)
      if (!res.ok) throw new Error("Failed to fetch data")
      const data = await res.json()
      setPurpose(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching members:", error)
      setPurpose([])
    }
  }

  const handleEdit = (nirnay) => {
    const recordData = nirnay.nirnay_reord.split("|")
    setInsertdate(recordData[8])

    if (recordData[4]) {
      setPreviewImage(`${SERVER_URL}${recordData[4]}`)
    } else {
      setPreviewImage(null)
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
    })
    setCurrentNirnayId(nirnay.nirnay_id)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setDeleteNirnayId(id)
    setIsDeleteModalOpen(true)
  }

  const handleRemarks = (row) => {
    const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
    navigate(`/home/meetings/tharav/${row.nirnay_id}/remarks`, {
      state: {
        tharavNo: recordData[1] || "N/A",
        date: recordData[8] || "N/A",
        purpose: purpose.find((data) => data.head_id == recordData[11])?.head_name || "N/A",
        expectedAmount: recordData[3] || "N/A",
        decisionTaken: recordData[2] || "N/A",
        photo: recordData[4] ? `${SERVER_URL}${recordData[4]}` : null,
      },
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!tharav.tharavNo || !/^[1-9]\d*$/.test(tharav.tharavNo)) {
      newErrors.tharavNo = "Tharav No must be a positive number starting from 1."
    }

    if (!tharav.purpose) {
      newErrors.purpose = "Purpose is required."
    }

    if (!tharav.problemFounded) {
      newErrors.problemFounded = "Problem Founded is required."
    }

    if (!tharav.where) {
      newErrors.where = "This field is required."
    }

    if (!tharav.what) {
      newErrors.what = "This field is required."
    }

    if (!tharav.howMany || !/^\d+$/.test(tharav.howMany)) {
      newErrors.howMany = "How Many must be a number."
    }

    if (!tharav.deadStockNumber || !/^\d+$/.test(tharav.deadStockNumber)) {
      newErrors.deadStockNumber = "Dead Stock Number must be a number."
    }

    if (!tharav.decisionTaken) {
      newErrors.decisionTaken = "Decision Taken is required."
    }

    if (!tharav.expectedExpenditure || !/^\d+$/.test(tharav.expectedExpenditure)) {
      newErrors.expectedExpenditure = "Expected Expenditure must be a number."
    }

    if (!tharav.fixedDate) {
      newErrors.fixedDate = "Fixed Date is required."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setFormError("")

    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(
      currentDate.getDate(),
    ).padStart(2, "0")} ${String(currentDate.getHours()).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(
      2,
      "0",
    )}:${String(currentDate.getSeconds()).padStart(2, "0")}`

    const photoValue = tharav.photo instanceof File ? tharav.photo.name : tharav.photo

    const memberData = `${meetingNumber}|${tharav.tharavNo}|${tharav.decisionTaken}|${
      tharav.expectedExpenditure
    }|${photoValue}|${schoolId}|${userId}|Pending|${
      !isEditing ? formattedDate : insertdate
    }|${formattedDate}|0000-00-00 00:00:00|${tharav.purpose}|${
      tharav.problemFounded
    }|${tharav.where}|${tharav.what}|${tharav.howMany}|${tharav.deadStockNumber}|${tharav.fixedDate}`

    const formData = new FormData()
    formData.append("nirnay_reord", memberData)

    if (tharav.photo instanceof File) {
      formData.append("photo", tharav.photo)
    }

    const method = isEditing ? "PUT" : "POST"
    const url = isEditing ? `${API_URL}/${currentNirnayId}` : API_URL

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      })

      if (!res.ok) throw new Error("Failed to save nirnay")

      closeModal()
      fetchTharavs()
    } catch (error) {
      console.error("Fetch error:", error)
      setFormError("Failed to save Tharav. Please try again.")
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
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
    })
    setPreviewImage(null)
    setCurrentNirnayId(null)
    setErrors({})
    setFormError("")
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setIsEditing(false)
    setPreviewImage(null)
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
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTharav((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)

      setTharav((prev) => ({
        ...prev,
        photo: file,
      }))
    }
  }

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${deleteNirnayId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete tharav")

      setNirnay((prev) => prev.filter((item) => item.nirnay_id !== deleteNirnayId))
      setFilteredNirnay((prev) => prev.filter((item) => item.nirnay_id !== deleteNirnayId))
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Error deleting Tharav:", error)
      setFormError("Failed to delete Tharav")
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Responsive columns configuration
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
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[1] || "N/A"
      },
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Problem",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[12] || "N/A"
      },
      sortable: true,
      minWidth: "150px",
      cell: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        const problem = recordData[12] || "N/A"
        return (
          <div className="truncate max-w-[150px] md:max-w-[200px]" title={problem}>
            {problem}
          </div>
        )
      },
    },
    {
      name: "Purpose",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return purpose.find((data) => data.head_id == recordData[11])?.head_name || "N/A"
      },
      sortable: true,
      minWidth: "120px",
      hide: "md",
    },
    {
      name: "How Many",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[15] || "N/A"
      },
      sortable: true,
      width: "100px",
      hide: "md",
    },
    {
      name: "What",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[14] || "N/A"
      },
      sortable: true,
      minWidth: "120px",
      hide: "lg",
    },
    {
      name: "Where",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[13] || "N/A"
      },
      sortable: true,
      minWidth: "120px",
      hide: "lg",
    },
    {
      name: "Expense",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return `₹${recordData[3] || "0"}`
      },
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Decision",
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[2] || "N/A"
      },
      sortable: true,
      minWidth: "150px",
      cell: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        const decision = recordData[2] || "N/A"
        return (
          <div className="truncate max-w-[150px] md:max-w-[200px]" title={decision}>
            {decision}
          </div>
        )
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Edit"
          >
            <Edit size={18} />
            <span className="sr-only">Edit</span>
          </button>
          <button
            onClick={() => handleDelete(row.nirnay_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            title="Delete"
          >
            <Trash2 size={18} />
            <span className="sr-only">Delete</span>
          </button>
          <button
            onClick={() => handleRemarks(row)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Remarks"
          >
            <MessageSquare size={18} />
            <span className="sr-only">Remarks</span>
          </button>
        </div>
      ),
      minWidth: "150px",
      allowOverflow: true,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold">{t("tharavManagement")}</h2>
          <button
            onClick={handleOpenModal}
            className="bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50 flex items-center gap-2 font-medium shadow-sm transition-all duration-200 w-full sm:w-auto justify-center"
          >
            <Plus size={18} />
            <span>{t("addTharav")}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search tharavs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredNirnay}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 300px)"
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#f8fafc",
                  fontSize: "14px",
                  fontWeight: "600",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  borderBottom: "1px solid #e2e8f0",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  borderBottom: "1px solid #f1f5f9",
                },
              },
              pagination: {
                style: {
                  fontSize: "13px",
                  minHeight: "56px",
                  borderTopStyle: "solid",
                  borderTopWidth: "1px",
                  borderTopColor: "#e2e8f0",
                },
              },
            }}
            noDataComponent={<div className="p-10 text-center text-gray-500">No tharavs found</div>}
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Tharav" : "Add New Tharav"}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle size={20} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Tharav No.</label>
                  <input
                    type="text"
                    name="tharavNo"
                    value={tharav.tharavNo}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.tharavNo ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Enter tharav no"
                  />
                  {errors.tharavNo && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.tharavNo}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Purpose</label>
                  <select
                    name="purpose"
                    value={tharav.purpose}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.purpose ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                  >
                    <option value="">Select Purpose</option>
                    {purpose.map((item) => (
                      <option key={item.head_id} value={item.head_id}>
                        {item.head_name}
                      </option>
                    ))}
                  </select>
                  {errors.purpose && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.purpose}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Problem Found</label>
                <textarea
                  name="problemFounded"
                  value={tharav.problemFounded}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.problemFounded ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 transition-all`}
                  rows="3"
                  placeholder="Describe the problem"
                ></textarea>
                {errors.problemFounded && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                    {errors.problemFounded}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Where</label>
                  <input
                    type="text"
                    name="where"
                    value={tharav.where}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.where ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Location"
                  />
                  {errors.where && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.where}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">What</label>
                  <input
                    type="text"
                    name="what"
                    value={tharav.what}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.what ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Item/Issue"
                  />
                  {errors.what && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.what}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">How Many</label>
                  <input
                    type="text"
                    name="howMany"
                    value={tharav.howMany}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.howMany ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Quantity"
                  />
                  {errors.howMany && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.howMany}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Dead Stock Number</label>
                  <input
                    type="text"
                    name="deadStockNumber"
                    value={tharav.deadStockNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.deadStockNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Stock number if applicable"
                  />
                  {errors.deadStockNumber && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.deadStockNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Decision Taken</label>
                <textarea
                  name="decisionTaken"
                  value={tharav.decisionTaken}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-lg border ${
                    errors.decisionTaken ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  } focus:outline-none focus:ring-2 transition-all`}
                  rows="3"
                  placeholder="Decision details"
                ></textarea>
                {errors.decisionTaken && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                    {errors.decisionTaken}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Expected Expenditure</label>
                  <input
                    type="text"
                    name="expectedExpenditure"
                    value={tharav.expectedExpenditure}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.expectedExpenditure
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Amount in ₹"
                  />
                  {errors.expectedExpenditure && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.expectedExpenditure}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Fixed Date</label>
                  <input
                    type="date"
                    name="fixedDate"
                    value={tharav.fixedDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      errors.fixedDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                    } focus:outline-none focus:ring-2 transition-all`}
                  />
                  {errors.fixedDate && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-1 flex-shrink-0" size={14} />
                      {errors.fixedDate}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Photo</label>
                <div className="flex flex-wrap items-center gap-3">
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
                    className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
                  >
                    <Upload className="mr-2" size={18} />
                    Upload Photo
                  </button>
                </div>

                {previewImage && (
                  <div className="mt-4 relative">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null)
                        setTharav((prev) => ({ ...prev, photo: "" }))
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  {isEditing ? "Update Tharav" : "Save Tharav"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Confirm Delete</h2>
            </div>

            <div className="p-6">
              <p className="text-gray-700">
                Are you sure you want to delete this Tharav? This action cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

