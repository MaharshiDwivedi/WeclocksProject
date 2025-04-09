"use client"

import { useEffect, useState, useRef } from "react"
import { Plus, X, AlertCircle, Search, Upload, Camera, Image } from "lucide-react"
import DataTable from "react-data-table-component"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Swal from "sweetalert2"
import SkeletonLoader from "./SkeletonLoader"

export default function TharavOperation({ meetingNumber, meetingId }) {
  const navigate = useNavigate()
  const API_URL = "http://localhost:5000/api/tharav"
  const API_URL_Purpose = "http://localhost:5000/api/purpose"
  const SERVER_URL = "http://localhost:5000"
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const modalRef = useRef(null)

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
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteNirnayId, setDeleteNirnayId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [loading, setLoading] = useState(true);


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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

  useEffect(() => {
    fetchTharavs()
    fetchMembers()
  }, [])

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

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
      setLoading(true); // Ensure loading is set to true at start
      const res = await fetch(`${API_URL}/filter?meeting_number=${meetingNumber}&school_id=${schoolId}`)
      if (!res.ok) throw new Error("Failed to fetch data")
      const data = await res.json()
      setNirnay(data)
      setFilteredNirnay(data)
    } catch (error) {
      console.error("Error fetching Tharavs:", error)
      setNirnay([])
      setFilteredNirnay([])
    } finally {
      setLoading(false); // Ensure loading is set to false when done
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
    setPreviewImage(recordData[4] ? `${SERVER_URL}${recordData[4]}` : null)
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
    Swal.fire({
      title: t("Are you sure?"),
      text: t("You won't be able to revert this!"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("Yes, delete it!"),
      cancelButtonText: t("Cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        setDeleteNirnayId(id)
        confirmDelete()
      }
    })
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
        meetingNumber,
        meetingId,
        schoolId,
        userId,
        headId: recordData[11] || "N/A",
        nirnay_id: row.nirnay_id, // Make sure this is included
      },
    })
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    if (!tharav.tharavNo.trim()) {
      newErrors.tharavNo = "Tharav No is required"
      isValid = false
    } else if (!/^[1-9]\d*$/.test(tharav.tharavNo.trim())) {
      newErrors.tharavNo = "Tharav No must be a positive number starting from 1"
      isValid = false
    } else if (!isEditing && nirnay.some((item) => item.nirnay_reord?.split("|")[1] === tharav.tharavNo)) {
      newErrors.tharavNo = "Tharav No must be unique"
      isValid = false
    }

    if (!tharav.purpose.trim()) {
      newErrors.purpose = "Purpose is required"
      isValid = false
    }

    if (!tharav.problemFounded.trim()) {
      newErrors.problemFounded = "Problem Founded is required"
      isValid = false
    }

    if (!tharav.where.trim()) {
      newErrors.where = "Where is required"
      isValid = false
    }

    if (!tharav.what.trim()) {
      newErrors.what = "What is required"
      isValid = false
    }

    if (!tharav.howMany.trim()) {
      newErrors.howMany = "How Many is required"
      isValid = false
    } else if (!/^\d+$/.test(tharav.howMany.trim())) {
      newErrors.howMany = "How Many must be a number"
      isValid = false
    }

    if (!tharav.deadStockNumber.trim()) {
      newErrors.deadStockNumber = "Dead Stock Number is required"
      isValid = false
    }

    if (!tharav.decisionTaken.trim()) {
      newErrors.decisionTaken = "Decision Taken is required"
      isValid = false
    }

    if (!tharav.expectedExpenditure.trim()) {
      newErrors.expectedExpenditure = "Expected Expenditure is required"
      isValid = false
    } else if (!/^\d+$/.test(tharav.expectedExpenditure.trim())) {
      newErrors.expectedExpenditure = "Expected Expenditure must be a number"
      isValid = false
    }

    if (!tharav.fixedDate.trim()) {
      newErrors.fixedDate = "Fixed Date is required"
      isValid = false
    }

    if (!tharav.photo) {
      newErrors.photo = "Photo is required"
      isValid = false
    } else if (tharav.photo instanceof File && !tharav.photo.type.startsWith("image/")) {
      newErrors.photo = "Please upload a valid image file"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setFormError("")
  
    // Add confirmation dialog
    const confirmResult = await Swal.fire({
      title: isEditing ? t("Update Tharav?") : t("Add Tharav?"),
      text: isEditing 
        ? t("Do you really want to update this tharav?") 
        : t("Do you really want to add this tharav?"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEditing ? t("Yes, update it!") : t("Yes, add it!"),
      cancelButtonText: t("Cancel"),
    })
  
    if (!confirmResult.isConfirmed) {
      return
    }
  
    const currentDate = new Date()
    const formattedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")} ${String(currentDate.getHours()).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`
  
    const photoValue = tharav.photo instanceof File ? tharav.photo.name : tharav.photo
    const memberData = `${meetingNumber}|${tharav.tharavNo}|${tharav.decisionTaken}|${tharav.expectedExpenditure}|${photoValue}|${schoolId}|${userId}|Pending|${!isEditing ? formattedDate : insertdate}|${formattedDate}|0000-00-00 00:00:00|${tharav.purpose}|${tharav.problemFounded}|${tharav.where}|${tharav.what}|${tharav.howMany}|${tharav.deadStockNumber}|${tharav.fixedDate}`
  
    const formData = new FormData()
    formData.append("nirnay_reord", memberData)
    if (tharav.photo instanceof File) formData.append("photo", tharav.photo)
  
    const method = isEditing ? "PUT" : "POST"
    const url = isEditing ? `${API_URL}/${currentNirnayId}` : API_URL
  
    try {
      const res = await fetch(url, { method, body: formData })
      if (!res.ok) throw new Error("Failed to save nirnay")
  
      // Show success message
      Swal.fire({
        title: isEditing ? t("Success!") : t("Success!"),
        text: isEditing ? t("Tharav updated successfully") : t("Tharav added successfully"),
        icon: "success",
        timer: 1000,
      })
  
      closeModal()
      fetchTharavs()
    } catch (error) {
      console.error("Fetch error:", error)
      Swal.fire({
        title: t("Error!"),
        text: t("Failed to save Tharav. Please try again."),
        icon: "error",
        timer: 1000,
      })
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
    setTharav((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)
      setTharav((prev) => ({ ...prev, photo: file }))
    }
  }

  const confirmDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/${deleteNirnayId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete tharav")

      setNirnay((prev) => prev.filter((item) => item.nirnay_id !== deleteNirnayId))
      setFilteredNirnay((prev) => prev.filter((item) => item.nirnay_id !== deleteNirnayId))
      setIsDeleteModalOpen(false)

      // Show success message
      Swal.fire({
        title: t("Deleted!"),
        text: t("Tharav has been deleted successfully."),
        icon: "success",
        timer: 1000,
      })
    } catch (error) {
      console.error("Error deleting Tharav:", error)
      Swal.fire({
        title: t("Error!"),
        text: t("Failed to delete Tharav. Please try again."),
        icon: "error",
        timer: 1000,
      })
    }
  }

  const handleSearchChange = (e) => setSearchTerm(e.target.value)

  const openCamera = async () => {
    try {
      setCameraError(null)
      setShowCamera(true)
      await new Promise((resolve) => setTimeout(resolve, 100))
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setStream(videoStream)
      if (videoRef.current) videoRef.current.srcObject = videoStream
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Could not access camera. Please check permissions.")
      setShowCamera(false)
    }
  }

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCamera(false)
    setCameraError(null)
  }

  const capturePhoto = (e) => {
    e.preventDefault()
    if (!videoRef.current || !stream) return
    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `tharav-photo-${Date.now()}.jpg`, { type: "image/jpeg" })
        setTharav((prev) => ({ ...prev, photo: file }))
        setPreviewImage(URL.createObjectURL(blob))
        closeCamera()
      },
      "image/jpeg",
      0.9,
    )
  }

  const columns = [
    {
      name: t("Sr. No."),
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
      hide: "sm",
    },
    {
      name: t("Tharav No."),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[1] || "N/A"
      },
      sortable: true,
      width: "120px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Problem"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[12] || "N/A"
      },
      sortable: true,
      width: "100px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Purpose"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return purpose.find((data) => data.head_id == recordData[11])?.head_name || "N/A"
      },
      sortable: true,
      width: "90px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("How Many"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[15] || "N/A"
      },
      sortable: true,
      width: "70px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("What"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[14] || "N/A"
      },
      sortable: true,
      width: "80px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Where"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[13] || "N/A"
      },
      sortable: true,
      width: "80px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Dead Stock No."),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[16] || "N/A"
      },
      sortable: true,
      width: "90px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Expense"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return `₹${recordData[3] || "0"}`
      },
      sortable: true,
      width: "110px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Decision"),
      selector: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        return recordData[2] || "N/A"
      },
      sortable: true,
      width: "100px",
      wrap: false,
      style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    },
    {
      name: t("Photo"),
      cell: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        const photoUrl = recordData[4] ? `${SERVER_URL}${recordData[4]}` : null
        return (
          photoUrl && (
            <button
              onClick={() => setSelectedImage(photoUrl)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
              title={t("View Image")}
            >
              <Image size={22} className="text-blue-600" />
            </button>
          )
        )
      },
      width: "80px",
    },
    {
      name: t("Actions"),
      cell: (row) => {
        const recordData = row.nirnay_reord ? row.nirnay_reord.split("|") : []
        const isCompleted = row.work_status === "Completed"

        return (
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2">
            {!isCompleted ? (
              <>
                <button
                  onClick={() => handleEdit(row)}
                  title={t("edit")}
                  className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer whitespace-nowrap"
                >
                  <span>{t("edit")}</span>
                </button>
                <button
                  onClick={() => handleDelete(row.nirnay_id)}
                  title={t("Delete")}
                  className="text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer whitespace-nowrap"
                >
                  {t("Delete")}
                </button>
              </>
            ) : (
              <span className="text-gray-500 text-sm">Completed</span>
            )}
            <button
              onClick={() => handleRemarks(row)}
              title={t("Remarks")}
              className="text-green-600 px-3 py-1 rounded-md hover:bg-green-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer whitespace-nowrap"
            >
              {t("Remarks")}
            </button>
          </div>
        )
      },
      width: "270px",
    },
  ]

  if (loading) {
    return <SkeletonLoader />;
  }


  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8 realfont max-w-[1200px]">
      <div className="bg-white shadow-md rounded-[14px] overflow-hidden w-full">
        <div className="bg-blue-950 text-white px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 realfont2">
          <h2 className="text-xl md:text-2xl font-bold">{t("tharavManagement")}</h2>
          <button
            onClick={handleOpenModal}
            className="bg-white text-blue-950 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center w-full sm:w-auto justify-center"
          >
            <Plus className="mr-2" size={18} /> {t("addTharav")}
          </button>
        </div>

        <div className="p-4 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder={t("Search")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-20% pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="text-base sm:text-md md:text-md text-gray-600 font-medium">
            {t("totalTharav")} :<span className="text-blue-950 font-bold px-2">{filteredNirnay.length}</span>
          </div>{" "}
        </div>

        <div className="relative">
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
              fixedHeaderScrollHeight="400px"
              defaultSortFieldId={1}
              customStyles={{
                table: {
                  style: {
                    width: "100%",
                    minWidth: "109%",
                  },
                },
                tableWrapper: {
                  style: {
                    display: "block",
                    width: "100%",
                    overflowX: "auto",
                  },
                },
                headCells: {
                  style: {
                    backgroundColor: "#f3f4f6",
                    fontSize: "14px",
                    fontWeight: "500",
                    justifyContent: "center",
                    paddingLeft: "4px",
                    paddingRight: "4px",
                    minWidth: "unset",
                  },
                },
                cells: {
                  style: {
                    fontSize: "12px",
                    fontFamily: "Poppins",
                    color: "#333",
                    justifyContent: "center",
                    paddingLeft: "4px",
                    paddingRight: "4px",
                    minWidth: "unset",
                  },
                },
                pagination: {
                  style: {
                    fontSize: "13px",
                    minHeight: "56px",
                    borderTopStyle: "solid",
                    borderTopWidth: "1px",
                    borderTopColor: "#f3f4f6",
                  },
                },
              }}
            />
          </div>
        </div>

        {filteredNirnay.length === 0 && (
          <div className="text-center p-4 md:p-8 text-gray-500">{t("No tharavs found")}</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-3">
          <div
            ref={modalRef}
            className="bg-white rounded-sm shadow-2xl w-full max-w-[95vw] md:max-w-[850px] max-h-[90vh] overflow-y-auto animate-fade-in"
          >
            <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-indigo-900 flex items-center">
                {isEditing ? (
                  <>
                    <Plus className="mr-1 sm:mr-2 text-indigo-600" size={isMobile ? 16 : 18} /> {t("Edit Tharav")}
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 sm:mr-2 text-indigo-600" size={isMobile ? 16 : 18} /> {t("Add Tharav")}
                  </>
                )}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
              >
                <X size={isMobile ? 16 : 18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6">
              {formError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 mb-4">
                  <AlertCircle size={20} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Tharav No */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Tharav No.")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="tharavNo"
                    value={tharav.tharavNo}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.tharavNo ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("Enter tharav no")}
                  />
                  {errors.tharavNo && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.tharavNo}
                    </p>
                  )}
                </div>

                {/* Purpose */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Purpose")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="purpose"
                    value={tharav.purpose}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.purpose ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white h-10 sm:h-12 text-sm sm:text-base`}
                  >
                    <option value="">{t("Select Purpose")}</option>
                    {purpose.map((item) => (
                      <option key={item.head_id} value={item.head_id}>
                        {item.head_name}
                      </option>
                    ))}
                  </select>
                  {errors.purpose && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.purpose}
                    </p>
                  )}
                </div>

                {/* Problem Found */}
                <div className="mb-2 sm:mb-3 sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Problem Found")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="problemFounded"
                    value={tharav.problemFounded}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.problemFounded ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm sm:text-base`}
                    rows="3"
                    placeholder={t("Describe the problem")}
                  ></textarea>
                  {errors.problemFounded && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.problemFounded}
                    </p>
                  )}
                </div>

                {/* Where */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Where")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="where"
                    value={tharav.where}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.where ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("Location")}
                  />
                  {errors.where && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.where}
                    </p>
                  )}
                </div>

                {/* What */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("What")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="what"
                    value={tharav.what}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.what ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("Item/Issue")}
                  />
                  {errors.what && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.what}
                    </p>
                  )}
                </div>

                {/* How Many */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("How Many")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="howMany"
                    value={tharav.howMany}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.howMany ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("Quantity")}
                  />
                  {errors.howMany && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.howMany}
                    </p>
                  )}
                </div>

                {/* Dead Stock Number */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Dead Stock Number")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deadStockNumber"
                    value={tharav.deadStockNumber}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.deadStockNumber ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("Stock number if applicable")}
                  />
                  {errors.deadStockNumber && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.deadStockNumber}
                    </p>
                  )}
                </div>

                {/* Decision Taken */}
                <div className="mb-2 sm:mb-3 sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Decision Taken")} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="decisionTaken"
                    value={tharav.decisionTaken}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.decisionTaken ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm sm:text-base`}
                    rows="3"
                    placeholder={t("Decision details")}
                  ></textarea>
                  {errors.decisionTaken && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.decisionTaken}
                    </p>
                  )}
                </div>

                {/* Expected Expenditure */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Expected Expenditure")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="expectedExpenditure"
                    value={tharav.expectedExpenditure}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.expectedExpenditure ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("Amount in ₹")}
                  />
                  {errors.expectedExpenditure && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.expectedExpenditure}
                    </p>
                  )}
                </div>

                {/* Fixed Date */}
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Fixed Date")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="fixedDate"
                    value={tharav.fixedDate}
                    onChange={handleInputChange}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.fixedDate ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                  />
                  {errors.fixedDate && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.fixedDate}
                    </p>
                  )}
                </div>

                {/* Photo Upload */}
                <div className="mb-2 sm:mb-3 sm:col-span-2">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("Upload Photo")} <span className="text-red-500">*</span>
                  </label>
                  {showCamera && (
                    <div className="mb-4 p-2 border rounded-lg bg-gray-50">
                      {cameraError ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{cameraError}</div>
                      ) : (
                        <>
                          <div className="relative mx-auto w-[280px] h-[210px]">
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-auto bg-black rounded-lg"
                            />
                            <button
                              onClick={closeCamera}
                              className="absolute top-2 right-2 bg-white/80 text-gray-800 rounded-full p-1 hover:bg-white"
                              type="button"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div className="mt-2 flex justify-center">
                            <button
                              onClick={capturePhoto}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                              type="button"
                            >
                              <Camera size={18} /> {t("Capture Photo")}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {!showCamera && (
                    <div className="relative">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                        capture="environment"
                        id="photoInput"
                      />
                      <label
                        htmlFor="photoInput"
                        className={`inline-flex items-center px-4 py-2 ${
                          errors.photo ? "bg-red-500 hover:bg-red-600" : "bg-blue-950 hover:bg-blue-900"
                        } text-white text-sm font-medium rounded-md cursor-pointer transition duration-200`}
                      >
                        <Upload className="mr-2" size={16} />
                        {t("Choose Photo")}
                      </label>
                      <button
                        type="button"
                        onClick={openCamera}
                        className="ml-4 inline-flex items-center px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white text-sm font-medium rounded-md cursor-pointer transition duration-200"
                      >
                        <Camera className="mr-2" size={16} />
                        {t("Take Photo")}
                      </button>
                    </div>
                  )}
                  {errors.photo && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.photo}
                    </p>
                  )}
                  {previewImage && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full h-40 object-cover rounded-md border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 sm:mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isEditing ? t("Update Tharav") : t("Add Tharav")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950">{t("Confirm Delete")}</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-700">{t("Are you sure you want to delete this Tharav?")}</p>
            </div>
            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors w-full sm:w-auto"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 z-10 shadow-md hover:bg-gray-100"
            >
              <X className="text-black" size={20} />
            </button>
            <div className="bg-white p-2 rounded-lg shadow-lg">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={t("Tharav Photo")}
                className="max-w-full max-h-[80vh] md:max-h-[90vh] object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
