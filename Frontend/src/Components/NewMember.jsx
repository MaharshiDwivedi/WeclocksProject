"use client"

import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import { FaTrash, FaEdit } from "react-icons/fa"
import Swal from "sweetalert2"
import { Plus, Search, X, AlertCircle } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom" // Added for consistency with Home.jsx

export default function NewMember() {
  const { t } = useTranslation()
  const location = useLocation() // Added to track route changes like Home.jsx
  const API_URL = "http://localhost:5000/api/member"
  const [members, setMembers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMemberId, setCurrentMemberId] = useState(null)
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

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
    { label: "2023-24", value: "2023-2024" },
    { label: "2024-25", value: "2024-2025" },
  ]

  // Responsive detection aligned with Home.jsx
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Fetch members
  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(t("fetchMembersError"))
      const data = await res.json()
      const mySchoolID = localStorage.getItem("school_id")
      const formattedMembers = data
        .filter((request) => {
          const recordData = request.member_record.split("|")
          return recordData[4] == mySchoolID
        })
        .map((member) => {
          const recordData = member.member_record.split("|")
          const dbYear = recordData[10] || "N/A"
          const yearOption = yearoption.find((option) => option.value === dbYear)
          const displayYear = yearOption ? yearOption.label : dbYear
          return {
            member_id: member.member_id,
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
      setMembers(formattedMembers)
      setFilteredMembers(formattedMembers)
    } catch (error) {
      console.error("Error fetching members:", error)
    }
  }

  const handleEdit = (member) => {
    setNewMember(member)
    setCurrentMemberId(member.member_id)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      Swal.fire({
        title: t("delete"),
        text: t("deleteMemberSuccess"),
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })
      fetchMembers()
      setIsDeleteModalOpen(false)
    } catch (error) {
      Swal.fire({
        title: t("error"),
        text: t("deleteMemberError"),
        icon: "error",
      })
      console.error("Error deleting member:", error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true
    if (!newMember.name.trim()) {
      newErrors.name = t("enterFullName")
      isValid = false
    }
    if (!newMember.mobile.trim()) {
      newErrors.mobile = t("enterMobileNumber")
      isValid = false
    } else if (!/^[0-9]{10}$/.test(newMember.mobile.trim())) {
      newErrors.mobile = t("mobileError")
      isValid = false
    }
    if (!newMember.representative) {
      newErrors.representative = t("selectRepresentative")
      isValid = false
    }
    if (!newMember.designation) {
      newErrors.designation = t("selectDesignation")
      isValid = false
    }
    if (!newMember.gender) {
      newErrors.gender = t("selectGender")
      isValid = false
    }
    if (!newMember.year) {
      newErrors.year = t("selectYear")
      isValid = false
    }
    if (!newMember.cast) {
      newErrors.cast = t("selectCast")
      isValid = false
    }
    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    const result = await Swal.fire({
      title: isEditing ? t("update") : t("submit"),
      text: isEditing ? t("confirmUpdateMember") : t("confirmAddMember"),
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
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}:${String(date.getSeconds()).padStart(2, "0")} ${date.getHours() < 12 ? "AM" : "PM"}`
    const memberData = `${newMember.name}|${newMember.mobile}|${newMember.representative}|${newMember.cast}|${schoolId}|${userId}|${formattedDate}|0000-00-00|${newMember.designation}|${newMember.gender}|${newMember.year}`
    const method = isEditing ? "PUT" : "POST"
    const url = isEditing ? `${API_URL}/${currentMemberId}` : API_URL
    try {
      Swal.fire({
        title: isEditing ? t("updating") : t("adding"),
        text: t("pleaseWait"),
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_record: memberData }),
      })
      if (!res.ok) throw new Error(t("saveMemberError"))
      await Swal.fire({
        icon: "success",
        title: isEditing ? t("updateSuccess") : t("addSuccess"),
        text: isEditing ? t("updateMemberSuccess") : t("addMemberSuccess"),
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
    const filterMembers = () => {
      if (!searchTerm) {
        setFilteredMembers(members)
        return
      }
      const lowercasedSearchTerm = searchTerm.toLowerCase()
      const filtered = members.filter((member) =>
        Object.values(member).some(
          (value) => value.toString().toLowerCase().includes(lowercasedSearchTerm)
        )
      )
      setFilteredMembers(filtered)
    }
    filterMembers()
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

  const columns = [
    { name: t("name"), selector: (row) => row.name, sortable: true, minWidth: "150px" },
    { name: t("mobile"), selector: (row) => row.mobile, sortable: true, minWidth: "120px" },
    {
      name: t("representative"),
      selector: (row) => row.representative,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: t("designation"),
      selector: (row) => row.designation,
      sortable: true,
      minWidth: "120px",
    },
    { name: t("gender"), selector: (row) => row.gender, sortable: true, minWidth: "100px" },
    { name: t("year"), selector: (row) => row.year, sortable: true, minWidth: "100px" },
    { name: t("cast"), selector: (row) => row.cast, sortable: true, minWidth: "100px" },
    {
      name: t("actions"),
      cell: (row) => (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2">
          <button
            onClick={() => handleEdit(row)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center whitespace-nowrap"
          >
            <FaEdit className="mr-2" /> {t("edit")}
          </button>
          <button
            onClick={() => confirmDelete(row.member_id)}
            className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors text-sm font-medium min-w-[60px] flex items-center justify-center whitespace-nowrap"
          >
            <FaTrash className="mr-2" /> {t("delete")}
          </button>
        </div>
      ),
      minWidth: "150px",
      allowOverflow: true,
    },
  ]

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Header aligned with Home.jsx */}
      <header className="bg-blue-950 rounded-md p-3 md:p-4 flex justify-between items-center h-[60px] shadow-lg sticky top-0 ">
        <div className="text-[16px] md:text-[20px] lg:text-[22px] text-white font-medium realfont2">
          {t("committeeMembers")}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-blue-950 px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:text-white hover:bg-blue-800 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="mr-1 md:mr-2" size={isMobile ? 16 : 20} />
          <span className="text-sm md:text-base">{t("addMember")}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 md:px-8 py-5 bg-[#E5EAF5] w-full md:max-w-[1000px]">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 md:p-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="relative flex-grow max-w-full sm:max-w-[300px]">
              <input
                type="text"
                placeholder={t("search")}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
          </div>

          {/* DataTable */}
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={filteredMembers}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              highlightOnHover
              responsive
              fixedHeader
              fixedHeaderScrollHeight="calc(100vh - 250px)" // Adjusted for header and padding
              customStyles={{
                headCells: {
                  style: {
                    backgroundColor: "#f3f4f6",
                    fontSize: "15px",
                    fontWeight: "600",
                    justifyContent: "center",
                    padding: "8px",
                    whiteSpace: "normal", // Allow wrapping for smaller screens
                  },
                },
                cells: {
                  style: {
                    fontSize: "14px",
                    fontFamily: "Poppins",
                    color: "#333",
                    justifyContent: "center",
                    padding: "8px",
                    whiteSpace: "normal",
                  },
                },
                table: {
                  style: {
                    minWidth: "100%", // Full width instead of fixed minWidth
                  },
                },
                pagination: {
                  style: {
                    fontSize: "13px",
                    minHeight: "56px",
                    borderTop: "1px solid #f3f4f6",
                  },
                },
              }}
            />
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center p-4 md:p-8 text-gray-500">{t("noMembersFound")}</div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-[90vw] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950 realfont2">
                {isEditing ? t("editMember") : t("addMember")}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className={`w-full p-3 border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                    placeholder={t("enterFullName")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.name}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("mobile")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMember.mobile}
                    onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                    className={`w-full p-3 border ${
                      errors.mobile ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                    placeholder={t("enterMobileNumber")}
                    maxLength={10}
                  />
                  {errors.mobile && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.mobile}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("representative")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.representative}
                    onChange={(e) =>
                      setNewMember({ ...newMember, representative: e.target.value })
                    }
                    className={`w-full p-3 border ${
                      errors.representative ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                  >
                    <option value="">{t("selectRepresentative")}</option>
                    <option value="Principal EX (प्राचार्य माजी)">{t("principalEx")}</option>
                    <option value="board representative (मंडळ प्रतिनिधी)">
                      {t("boardRepresentative")}
                    </option>
                    <option value="parent representative (पालक प्रतिनिधी)">
                      {t("parentRepresentative")}
                    </option>
                    <option value="teacher representative (शिक्षक प्रतिनिधी)">
                      {t("teacherRepresentative")}
                    </option>
                    <option value="student representative (विद्यार्थी प्रतिनिधी)">
                      {t("studentRepresentative")}
                    </option>
                  </select>
                  {errors.representative && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.representative}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("gender")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.gender}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                    className={`w-full p-3 border ${
                      errors.gender ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                  >
                    <option value="">{t("selectGender")}</option>
                    <option value="Male">{t("male")}</option>
                    <option value="Female">{t("female")}</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.gender}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("designation")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.designation}
                    onChange={(e) => setNewMember({ ...newMember, designation: e.target.value })}
                    className={`w-full p-3 border ${
                      errors.designation ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                  >
                    <option value="">{t("selectDesignation")}</option>
                    <option value="अध्यक्">{t("president")}</option>
                    <option value="उपाध्यक्">{t("vicePresident")}</option>
                    <option value="सदस्य">{t("member")}</option>
                    <option value="सदस्य सचिव">{t("memberSecretary")}</option>
                    <option value="सह सचिव">{t("coSecretary")}</option>
                  </select>
                  {errors.designation && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.designation}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("year")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.year}
                    onChange={(e) => setNewMember({ ...newMember, year: e.target.value })}
                    className={`w-full p-3 border ${
                      errors.year ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                  >
                    <option value="">{t("selectYear")}</option>
                    {yearoption.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.year}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    {t("cast")} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newMember.cast}
                    onChange={(e) => setNewMember({ ...newMember, cast: e.target.value })}
                    className={`w-full p-3 border ${
                      errors.cast ? "border-red-500" : "border-gray-300"
                    } rounded focus:outline-none focus:ring focus:ring-blue-500`}
                  >
                    <option value="">{t("selectCast")}</option>
                    <option value="GEN">{t("gen")}</option>
                    <option value="OBC">{t("obc")}</option>
                    <option value="ST">{t("st")}</option>
                    <option value="SC">{t("sc")}</option>
                  </select>
                  {errors.cast && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="mr-2" size={16} /> {errors.cast}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors w-full sm:w-auto"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                {isEditing ? t("update") : t("submit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[90vw] md:max-w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950 realfont2">
                {t("confirmDeleteMember")}
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-700 font-bold">{t("confirmDeleteMember")}</p>
            </div>
            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
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