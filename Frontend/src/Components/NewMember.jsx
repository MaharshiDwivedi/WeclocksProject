"use client"

import { useEffect, useState, useRef } from "react"
import DataTable from "react-data-table-component"
import { Plus, Search, X, AlertCircle, Users } from "lucide-react"
import Swal from "sweetalert2"
import { useTranslation } from "react-i18next"

export default function NewMember() {
  const { t } = useTranslation()
  const API_URL = "http://localhost:5000/api/member"
  const [members, setMembers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMemberId, setCurrentMemberId] = useState(null)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [loading, setLoading] = useState(true)
  const modalRef = useRef(null)

  const [newMember, setNewMember] = useState({
    name: "",
    representative: "",
    mobile: "",
    gender: "",
    cast: "",
    year: "",
    designation: "",
  })

  const yearoption = [
    { label: "2023-2024", value: "2023-2024" },
    { label: "2024-2025", value: "2024-2025" },
  ]

  // Enhanced responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    handleResize() // Set initial value
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(t("fetchMembersError"))
      const data = await res.json()
      console.log("Raw backend data:", data)

      const mySchoolID = localStorage.getItem("school_id")
      console.log("School ID from localStorage:", mySchoolID)

      const formattedMembers = data
        .filter((request) => {
          const parts = request.member_record.split("|")
          const schoolIdFromRecord = parts[4]
          console.log("School ID from record:", schoolIdFromRecord)
          return schoolIdFromRecord === mySchoolID
        })
        .map((member) => {
          const recordData = member.member_record.split("|")
          console.log("Split recordData:", recordData)

          const dbYear = recordData[10] || "N/A"
          const yearOption = yearoption.find((option) => option.value === dbYear)
          const displayYear = yearOption ? yearOption.label : dbYear

          return {
            member_id: member.member_id || "N/A",
            name: recordData[0] || "N/A",
            mobile: recordData[1] || "N/A",
            representative: recordData[2] || "N/A",
            cast: recordData[3] || "N/A",
            year: displayYear,
            rawYear: dbYear,
            designation: recordData[8] || "N/A",
            gender: recordData[9] || "N/A",
          }
        })

      console.log("Formatted members:", formattedMembers)
      setMembers(formattedMembers)
      setFilteredMembers(formattedMembers)

      if (formattedMembers.length === 0) {
        console.warn("No members found after filtering. Check school_id or backend data.")
      }
    } catch (error) {
      console.error("Error fetching members:", error)
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("fetchMembersError"),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (member) => {
    setNewMember(member)
    setCurrentMemberId(member.member_id)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // const confirmDelete = (id) => {
  //   setDeleteId(id)
  //   setIsDeleteModalOpen(true)
  // }

  // const handleDelete = async (id) => {
  //   try {
  //     await fetch(`${API_URL}/${id}`, { method: "DELETE" })
  //     Swal.fire({
  //       title: t("delete"),
  //       text: t("deleteMemberSuccess"),
  //       icon: "success",
  //       timer: 2000,
  //       showConfirmButton: false,
  //     })
  //     fetchMembers()
  //     setIsDeleteModalOpen(false)
  //   } catch (error) {
  //     Swal.fire({
  //       title: t("error"),
  //       text: t("deleteMemberError"),
  //       icon: "error",
  //     })
  //     console.error("Error deleting member:", error)
  //   }
  // }


  const confirmDelete = async (id) => {
    const result = await Swal.fire({
      title: t("Confirm Delete"),
      text: t("Are You Sure You Want To Delete?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("yes"),
      cancelButtonText: t("no"),
    });
  
    if (result.isConfirmed) {
      handleDelete(id); // Proceed with deletion if confirmed
    }
  };
  
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Failed to delete member");
      }
  
      // Show success message using SweetAlert
      Swal.fire({
        title: t("delete"),
        text: t("Deleted Successfully"),
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
  
      fetchMembers(); // Refresh the members list
    } catch (error) {
      // Show error message using SweetAlert
      Swal.fire({
        title: t("error"),
        text: t("Delete Member Error"),
        icon: "error",
      });
  
      console.error("Error deleting member:", error);
    }
  };
  

  const validateForm = () => {
    const newErrors = {}
    let isValid = true
    if (!newMember.name.trim()) (newErrors.name = t("enterFullName")), (isValid = false)
    if (!newMember.mobile.trim()) {
      ;(newErrors.mobile = t("enterMobileNumber")), (isValid = false)
    } else if (!/^[0-9]{10}$/.test(newMember.mobile.trim())) {
      ;(newErrors.mobile = t("mobileError")), (isValid = false)
    }
    if (!newMember.representative) (newErrors.representative = t("selectRepresentative")), (isValid = false)
    if (!newMember.designation) (newErrors.designation = t("selectDesignation")), (isValid = false)
    if (!newMember.gender) (newErrors.gender = t("selectGender")), (isValid = false)
    if (!newMember.year) (newErrors.year = t("selectYear")), (isValid = false)
    if (!newMember.cast) (newErrors.cast = t("selectCast")), (isValid = false)
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    const result = await Swal.fire({
      title: isEditing ? t("update") : t("submit"),
      text: isEditing ? t("Confirm Update Member") : t("Confirm Add Member"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEditing ? t("update") : t("submit"),
      cancelButtonText: t("cancel"),
    })
    if (!result.isConfirmed) return
    const schoolId = localStorage.getItem("school_id")
    const userId = localStorage.getItem("user_id")
    const date = new Date()
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(
      2,
      "0",
    )}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(
      2,
      "0",
    )} ${date.getHours() < 12 ? "AM" : "PM"}`
    const memberData = `${newMember.name}|${newMember.mobile}|${newMember.representative}|${newMember.cast}|${schoolId}|${userId}|${formattedDate}|0000-00-00|${newMember.designation}|${newMember.gender}|${newMember.year}`
    const method = isEditing ? "PUT" : "POST"
    const url = isEditing ? `${API_URL}/${currentMemberId}` : API_URL
    try {
      Swal.fire({
        title: isEditing ? t("updating") : t("adding"),
        text: t("pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_record: memberData }),
      })
      if (!res.ok) throw new Error(t("saveMemberError"))
      await Swal.fire({
        icon: "success",
        title: isEditing ? t("Update Success") : t("Add Success"),
        text: isEditing ? t("Update Member Success") : t("Add Member Success"),
      })
      fetchMembers()
      closeModal()
    } catch (error) {
      console.error("Error saving member:", error)
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: error.message || t("saveMemberError"),
      })
    }
  }

  useEffect(() => {
    const filtered = searchTerm
      ? members.filter((member) =>
          Object.values(member).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
        )
      : members
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const handleSearchChange = (e) => setSearchTerm(e.target.value)

  const closeModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
    setNewMember({
      name: "",
      representative: "",
      mobile: "",
      gender: "",
      cast: "",
      year: "",
      designation: "",
    })
    setErrors({})
  }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal()
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isModalOpen])

  // Optimized columns configuration for better mobile display
  const columns = [
    {
      name: t("Sr. No."),
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
      compact: true,
    },
    {
      name: t("name"),
      selector: (row) => row.name,
      sortable: true,
      minWidth: "120px",
      wrap: true,
      cell: (row) => (
        <div className="py-2 truncate max-w-[100px] sm:max-w-[150px] md:max-w-full" title={row.name}>
          {row.name}
        </div>
      ),
    },
    {
      name: t("mobile"),
      selector: (row) => row.mobile,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: t("representative"),
      selector: (row) => row.representative,
      sortable: true,
      minWidth: "150px",
      cell: (row) => (
        <div
          className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-full"
          title={row.representative}
        >
          {row.representative}
        </div>
      ),
    },
    {
      name: t("designation"),
      selector: (row) => row.designation,
      sortable: true,
      minWidth: "100px",
      cell: (row) => (
        <div className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-full" title={row.designation}>
          {row.designation}
        </div>
      ),
    },
    {
      name: t("gender"),
      selector: (row) => row.gender,
      sortable: true,
      minWidth: "60px",
    },
    {
      name: t("year"),
      selector: (row) => row.year,
      sortable: true,
      minWidth: "80px",
    },
    {
      name: t("cast"),
      selector: (row) => row.cast,
      sortable: true,
      minWidth: "70px",
    },
    {
      name: t("actions"),
      cell: (row) => (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer whitespace-nowrap"
            title={t("edit")}
          >
            {t("EDIT")}
          </button>
          <button
            onClick={() => confirmDelete(row.member_id)}
            className="text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer whitespace-nowrap"
            title={t("delete")}
          >
            {t("DELETE")}
          </button>
          </div>
      ),
      minWidth: "150px",
      allowOverflow: true,
      },
  ]

  return (
    <div className="px-2 sm:px-4 py-3 md:py-6 realfont">
     <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">
     <div className="bg-white shadow-lg rounded-[14px] overflow-hidden">
      
        {/* Header */}
        <div className="bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
        
          <h2 className="flex items-center gap-1 sm:gap-2 text-xl md:text-2xl realfont2">
  <Users size={isMobile ? 20 : 24} />
  {t("committeeMembers")}
</h2>


          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-blue-100 flex items-center shadow-md hover:shadow-lg transition-all duration-200 realfont2"
          >
            <Plus className="mr-1 sm:mr-1 " size={isMobile ? 14 : 16} /> {t("addMember")}
          </button>
        </div>

        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        
           <div className="relative flex-grow max-w-full sm:max-w-[300px]">
                      <input
                        type="text"
                        placeholder={t("Search")}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all duration-200"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                 </div>
          <div className="text-base sm:text-md md:text-md text-gray-600 font-medium">
            {t("totalMembers")} :<span className="text-blue-950 font-bold px-2">{filteredMembers.length}</span>
          </div>
        </div>

        {/* Table container with horizontal scrolling */}
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          <DataTable
            columns={columns}
            data={filteredMembers}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            defaultSortFieldId={1}
            progressPending={loading}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#eceef1",
                  fontWeight: "600",
                  justifyContent: "center",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  borderRight: "1px solid #f0f0f0",
                  fontSize: "16",
                },
              },
              cells: {
                style: {
                  fontFamily: "Poppins",
                  color: "#333",
                  justifyContent: "center",
                  paddingLeft: "2px",
                  paddingRight: "2px",
                  borderRight: "1px solid #f9f9f9",
                  fontSize: "14",
                },
              },
              rows: {
                style: {
                  "&:nth-child(odd)": {
                    backgroundColor: "#f8f9fa",
                  },
                },
                stripedStyle: {
                  backgroundColor: "#f8f9fa",
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
              table: {
                style: {
                  width: "100%",
                },
              },
            }}
          />
        </div>

        {filteredMembers.length === 0 && !loading && (
          <div className="text-center p-4 md:p-8 text-gray-500">{t("noMembersFound")}</div>
        )}
      </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0  backdrop-blur-xs flex items-center justify-center z-50 p-3">
          <div
            ref={modalRef}
            className="bg-white rounded-sm shadow-2xl w-full max-w-[95vw] md:max-w-[850px] max-h-[90vh] overflow-y-auto animate-fade-in"
          >
            <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-indigo-900 flex items-center">
                {isEditing ? (
                  <>
                    <Plus className="mr-1 sm:mr-2 text-indigo-600" size={isMobile ? 16 : 18} /> {t("editMember")}
                  </>
                ) : (
                  <>
                    <Plus className="mr-1 sm:mr-2 text-indigo-600" size={isMobile ? 16 : 18} /> {t("addMember")}
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
            <div className="p-3 sm:p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("enterFullName")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.name}
                    </p>
                  )}
                </div>
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("mobile")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMember.mobile}
                    onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.mobile ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-10 sm:h-12 text-sm sm:text-base`}
                    placeholder={t("enterMobileNumber")}
                    maxLength={10}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.mobile}
                    </p>
                  )}
                </div>
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("representative")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.representative}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        representative: e.target.value,
                      })
                    }
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.representative ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white h-10 sm:h-12 text-sm sm:text-base`}
                  >
                    <option value="">{t("selectRepresentative")}</option>
                    <option value="Principal EX (प्राचार्य माजी)">{t("principalEx")}</option>
                    <option value="board representative (मंडळ प्रतिनिधी)">{t("boardRepresentative")}</option>
                    <option value="parent representative (पालक प्रतिनिधी)">{t("parentRepresentative")}</option>
                    <option value="teacher representative (शिक्षक प्रतिनिधी)">{t("teacherRepresentative")}</option>
                    <option value="student representative (विद्यार्थी प्रतिनिधी)">{t("studentRepresentative")}</option>
                  </select>
                  {errors.representative && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.representative}
                    </p>
                  )}
                </div>
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("gender")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white h-10 sm:h-12 text-sm sm:text-base`}
                  >
                    <option value="">{t("selectGender")}</option>
                    <option value="Male">{t("male")}</option>
                    <option value="Female">{t("female")}</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.gender}
                    </p>
                  )}
                </div>
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("designation")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.designation}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        designation: e.target.value,
                      })
                    }
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.designation ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white h-10 sm:h-12 text-sm sm:text-base`}
                  >
                    <option value="">{t("selectDesignation")}</option>
                    <option value="अध्यक्">{t("president")}</option>
                    <option value="उपाध्यक्">{t("vicePresident")}</option>
                    <option value="सदस्य">{t("member")}</option>
                    <option value="सदस्य सचिव">{t("memberSecretary")}</option>
                    <option value="सह सचिव">{t("coSecretary")}</option>
                  </select>
                  {errors.designation && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.designation}
                    </p>
                  )}
                </div>
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("year")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.year}
                    onChange={(e) => setNewMember({ ...newMember, year: e.target.value })}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.year ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white h-10 sm:h-12 text-sm sm:text-base`}
                  >
                    <option value="">{t("selectYear")}</option>
                    {yearoption.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.year}
                    </p>
                  )}
                </div>
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                    {t("cast")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.cast}
                    onChange={(e) => setNewMember({ ...newMember, cast: e.target.value })}
                    className={`w-full p-2 sm:p-2.5 border ${
                      errors.cast ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white h-10 sm:h-12 text-sm sm:text-base`}
                  >
                    <option value="">{t("selectCast")}</option>
                    <option value="GEN">{t("gen")}</option>
                    <option value="OBC">{t("obc")}</option>
                    <option value="ST">{t("st")}</option>
                    <option value="SC">{t("sc")}</option>
                  </select>
                  {errors.cast && (
                    <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                      <AlertCircle className="mr-1" size={12} /> {errors.cast}
                    </p>
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
                  onClick={handleSubmit}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {isEditing ? t("update") : t("addMember")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[350px] sm:max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="p-3 sm:p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-950">{t("deleteMember")}</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6 space-y-4">
              <p className="text-gray-700">{t("confirmDeleteMember")}</p>
            </div>
            <div className="p-3 sm:p-4 md:p-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors w-full sm:w-auto"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}