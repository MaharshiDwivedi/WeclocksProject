"use client"

import { useEffect, useState } from "react"
import DataTable from "react-data-table-component"
import Swal from "sweetalert2"
import axios from "axios"
import { Plus, Search, AlertCircle, X } from "lucide-react"

export default function FundReq() {
  const API_URL = "http://localhost:5000/api/fundreqhm"
  const [demands, setDemands] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentDemandId, setCurrentDemandId] = useState("")
  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDemands, setFilteredDemands] = useState([])
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const [newDemand, setNewDemand] = useState({
    year: "",
    amount: "",
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
    fetchDemands()
  }, [])

  const fetchDemands = async () => {
    try {
      const res = await axios.get(API_URL)

      // Parse the pipe-separated data
      const formattedDemands = res.data.map((request) => {
        const recordData = request.demand_master_record.split("|")
        return {
          id: request.demand_master_id, // Assuming there is a unique ID
          demand_status: request.demand_status,
          year: recordData[1] || "N/A",
          amount: recordData[2] || "N/A",
        }
      })

      setDemands(formattedDemands)
      setFilteredDemands(formattedDemands)
    } catch (error) {
      console.error("Error fetching demands:", error)
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch fund requests.",
      })
    }
  }

  const handleEdit = (demand) => {
    setNewDemand(demand) // Set selected demand data in form
    setCurrentDemandId(demand.id) // Store the ID for updating
    setIsEditing(true) // Enable edit mode
    setIsModalOpen(true) // Open the modal
  }

  const confirmDelete = (id) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" })

      Swal.fire({
        title: "Deleted!",
        text: "The fund request has been deleted successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      })

      fetchDemands() // Refresh the data after deletion
      setIsDeleteModalOpen(false)
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete the fund request.",
        icon: "error",
      })
      console.error("Error deleting fund request:", error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    if (!newDemand.year) {
      newErrors.year = "Year is required"
      isValid = false
    }

    // Validate Amount
    if (!newDemand.amount || newDemand.amount.trim() === "") {
      newErrors.amount = "Amount is required"
      isValid = false
    } else if (isNaN(newDemand.amount) || Number(newDemand.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return // Validate the form before proceeding

    // Show SweetAlert confirmation before proceeding
    const result = await Swal.fire({
      title: isEditing ? "Are you sure?" : "Confirm Addition",
      text: isEditing ? "Do you want to update this fund request?" : "Are you sure you want to add this fund request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEditing ? "Yes, Update" : "Yes, Add",
      cancelButtonText: "Cancel",
    })

    if (!result.isConfirmed) return // Stop if user cancels

    const schoolId = localStorage.getItem("school_id")
    const userId = localStorage.getItem("user_id")

    // Pipe-separated format for fund request
    const demandData = `${schoolId}|${newDemand.year}|${newDemand.amount}|Credit|${userId}`

    const method = isEditing ? "PUT" : "POST"
    const url = isEditing ? `${API_URL}/${currentDemandId}` : API_URL

    try {
      // Show loading alert
      Swal.fire({
        title: isEditing ? "Updating..." : "Adding...",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demand_master_record: demandData }),
      })

      if (!res.ok) {
        throw new Error(`Failed to save fund request. Status: ${res.status}`)
      }

      // Show success alert after successful operation
      await Swal.fire({
        icon: "success",
        title: isEditing ? "Fund Request Updated!" : "Fund Request Added!",
        text: isEditing
          ? "The fund request details have been updated successfully."
          : "A new fund request has been added successfully.",
      })

      fetchDemands() // Refresh the list
      closeModal() // Close modal
    } catch (error) {
      console.error("Error saving fund request:", error)
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Something went wrong while saving the fund request.",
      })
    }
  }

  useEffect(() => {
    const filterDemands = () => {
      if (!searchTerm) {
        setFilteredDemands(demands) // Reset to all demands if search term is empty
        return
      }

      const lowercasedSearchTerm = searchTerm.toLowerCase()

      const filtered = demands.filter((demand) => {
        return (
          demand.year.toLowerCase().includes(lowercasedSearchTerm) ||
          demand.amount.toLowerCase().includes(lowercasedSearchTerm)
        )
      })

      setFilteredDemands(filtered)
    }

    filterDemands()
  }, [searchTerm, demands])

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsEditing(false)
    setNewDemand({
      year: "",
      amount: "",
    })
    setErrors({})
  }

  const columns = [
    {
      name: "Sr. No.",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
      hide: "sm",
    },
    {
      name: "Year",
      selector: (row) => row.year,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Status",
      selector: (row) => row.demand_status,
      sortable: true,
      hide: "md",
      minWidth: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2">
          <button
            onClick={row.demand_status === "Pending" ? () => handleEdit(row) : null}
            className={`${row.demand_status === "Pending" ? "text-blue-600" : "text-gray-600"} px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center`}
            disabled={row.demand_status !== "Pending"}
          >
            EDIT
          </button>
          <button
            onClick={row.demand_status === "Pending" ? () => confirmDelete(row.id) : null}
            className={`${row.demand_status === "Pending" ? "text-red-600" : "text-gray-600"} px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center`}
            disabled={row.demand_status !== "Pending"}
          >
            DELETE
          </button>
        </div>
      ),
      minWidth: "150px",
    },
  ]

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold">Fund Requests</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-blue-100 flex items-center shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-1 sm:mr-2" size={isMobile ? 16 : 20} />
            <span className="text-sm sm:text-base">Add Fund Request</span>
          </button>
        </div>

        {/* Search Filter - Responsive */}
        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="relative flex-grow max-w-full sm:max-w-[300px]">
            <input
              type="text"
              placeholder="Search fund requests..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        {/* Data Table - Responsive */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredDemands}
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
                  fontSize: "15px",
                  fontWeight: "600",
                  justifyContent: "center",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  color: "#333",
                  justifyContent: "center",
                  paddingLeft: "8px",
                  paddingRight: "8px",
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

        {filteredDemands.length === 0 && (
          <div className="text-center p-4 md:p-8 text-gray-500">No fund requests found</div>
        )}
      </div>

      {/* Modal - Responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950">
                {isEditing ? "Edit Fund Request" : "New Fund Request"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={newDemand.year}
                  onChange={(e) => setNewDemand({ ...newDemand, year: e.target.value })}
                  className={`w-full p-3 border ${errors.year ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500"} rounded focus:outline-none focus:ring`}
                >
                  <option value="">Select Year</option>
                  <option value="2023-2024">2023-24</option>
                  <option value="2024-2025">2024-25</option>
                </select>
                {errors.year && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-2 flex-shrink-0" size={16} /> {errors.year}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newDemand.amount}
                  onChange={(e) => setNewDemand({ ...newDemand, amount: e.target.value })}
                  className={`w-full p-3 border ${errors.amount ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500"} rounded focus:outline-none focus:ring`}
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="mr-2 flex-shrink-0" size={16} /> {errors.amount}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 border-t flex item-center justify-center">
              <button
                onClick={handleSubmit}
                className="w-full sm:w-[60%] md:w-[40%] bg-blue-950 text-white py-2 md:py-3 rounded-md hover:bg-blue-900 transition-colors font-semibold text-lg md:text-xl"
              >
                {isEditing ? "UPDATE" : "SUBMIT"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - Responsive */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950">Confirm Delete</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4">
              <p className="text-gray-700 font-bold">Are you sure you want to delete this fund request?</p>
            </div>

            <div className="p-4 md:p-6 border-t flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
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

