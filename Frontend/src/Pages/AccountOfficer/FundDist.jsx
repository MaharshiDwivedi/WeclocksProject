"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { X, Plus, AlertCircle, Search, IndianRupee } from "lucide-react"
import DataTable from "react-data-table-component"
import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2'

const FundDist = () => {
  const [fundData, setFundData] = useState([])
  const [filteredFundData, setFilteredFundData] = useState([])
  const [schools, setSchools] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFundId, setEditFundId] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState("")
  const [selectedYear, setSelectedYear] = useState("2023-24")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [errors, setErrors] = useState({})
  const [additionalAmount, setAdditionalAmount] = useState("")
  const [formError, setFormError] = useState("")
  const modalRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const { t } = useTranslation();

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/fund-distribution")
        setFundData(response.data)
        setFilteredFundData(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching fund data:", err)
        setError("Failed to fetch fund data")
        setLoading(false)
      }
    }

    const fetchSchools = async () => {
      try {
        await axios.get("http://localhost:5000/api/schools")
          .then(response => setSchools(response.data))
          .catch(err => console.error("Error fetching schools:", err))
      } catch (err) {
        console.error("Error fetching schools:", err)
      }
    }

    fetchFundData()
    fetchSchools()
  }, [])

  const validateForm = () => {
    const newErrors = {}
    if (isEditMode) {
      if (!additionalAmount || Number.parseFloat(additionalAmount) <= 0) {
        newErrors.additionalAmount = "Valid additional amount is required"
      }
    } else {
      if (!selectedSchool) newErrors.school = "School is required"
      if (!amount || amount <= 0) newErrors.amount = "Valid amount is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

// Modify the handleSubmit function in FundDist.jsx
const handleSubmit = async () => {
  if (!validateForm()) return;

  setFormError("");

  const result = await Swal.fire({
    title: isEditMode ? t('Update Fund?') : t('Add Fund'),
    text: isEditMode 
      ? t('updateText') 
      : t('addText'),
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: t('yesAddIt'),
    cancelButtonText: t('Cancel')
  });

  if (!result.isConfirmed) return;

  try {
    if (isEditMode) {
      const payload = { additional_amount: additionalAmount }
      await axios.put(`http://localhost:5000/api/fund-distribution/${editFundId}`, payload)
      const updatedData = await axios.get("http://localhost:5000/api/fund-distribution")
      setFundData(updatedData.data)
      setFilteredFundData(updatedData.data)
      Swal.fire({
        icon: 'success',
        title: t('Success'),
        text: t('Fund updated successfully'),
        timer: 2000,
        showConfirmButton: false
      })
      resetForm()
    } else {
      const payload = {
        school_id: selectedSchool,
        year: selectedYear,
        amount,
      }
      await axios.post("http://localhost:5000/api/fund-distribution", payload)
      const updatedData = await axios.get("http://localhost:5000/api/fund-distribution")
      setFundData(updatedData.data)
      setFilteredFundData(updatedData.data)
      Swal.fire({
        icon: 'success',
        title: t('Success'),
        text: t('Fund added successfully'),
        timer: 2000,
        showConfirmButton: false
      })
      resetForm()
    }
  } catch (err) {
    if (err.response && err.response.status === 409) {
      setFormError(err.response.data.message)
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: err.response.data.message
      })
    } else {
      console.error("Error saving fund:", err)
      setError("Failed to save fund")
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: t('Failed to save fund')
      })
    }
  }
}

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isModalOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        resetForm(); // Using resetForm instead of closeModal
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t('Are you sure you want to delete this fund?'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('yesDeleteIt'),
      cancelButtonText: t('Cancel')
    })

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/fund-distribution/${id}`)
        setFundData((prevFundData) => prevFundData.filter((fund) => fund.demand_master_id !== id))
        setFilteredFundData((prevFilteredFundData) =>
          prevFilteredFundData.filter((fund) => fund.demand_master_id !== id)
        )
        
        Swal.fire({
          icon: 'success',
          title: t('Deleted!'),
          text: t('Fund has been deleted.'),
          timer: 2000,
          showConfirmButton: false
        })
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: t('Error'),
          text: t('Failed to delete fund')
        })
        console.error("Error deleting fund:", err)
        setError("Failed to delete fund")
      }
    }
  }

  const handleEdit = (fund) => {
    setSelectedSchool(fund.school_id)
    setSelectedYear(fund.year)
    setAmount(fund.amount)
    setAdditionalAmount("")
    setEditFundId(fund.demand_master_id)
    setIsEditMode(true)
    setIsModalOpen(true)
    setErrors({})
    setFormError("")
  }

  const resetForm = () => {
    setIsModalOpen(false)
    setIsEditMode(false)
    setEditFundId(null)
    setSelectedSchool("")
    setSelectedYear("2023-24")
    setAmount("")
    setAdditionalAmount("")
    setErrors({})
    setFormError("")
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    const filtered = fundData.filter(
      (fund) => 
        fund.school_name.toLowerCase().includes(term) || 
        fund.amount.toString().includes(term) ||
        fund.year.toLowerCase().includes(term)
    )
    setFilteredFundData(filtered)
  }

  // Updated columns with responsive design - FIXED: Using text-only buttons on small screens
  const columns = [
    {
      name: t("Sr. No."),
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
      hide: "sm",
    },
    {
      name: t("School Name"),
      selector: (row) => row.school_name,
      sortable: true,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: t("Amount"),
      selector: (row) => `₹${row.amount}`,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("date"),
      selector: (row) => new Date(row.ins_date_time).toLocaleDateString("en-GB").replace(/\//g, "-"),
      sortable: true,
      hide: "md",
      minWidth: "120px",
    },
    {
      name: t("Actions"),
      cell: (row) => (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2">
          <button
            onClick={() => handleEdit(row)}
            className=" text-blue-600 x-3 py-1 cursor-pointer rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center"
          >
            {t("EDIT")}
          </button>
          <button
            onClick={() => handleDelete(row.demand_master_id)}
            className=" text-red-600 px-3 py-1 cursor-pointer rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center"
          >
           {t("DELETE")}
          </button>
        </div>
      ),
      minWidth: "150px",
    },
  ]

  if (loading) return <div className="text-center p-6">Loading...</div>
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10 realfont">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2">
            <IndianRupee size={isMobile ? 16 : 18} />
            {t("Fund Distribution")}
          </h2>
          <button
            onClick={() => {
              setIsEditMode(false)
              setIsModalOpen(true)
            }}
            className="bg-white text-blue-950 hover:bg-blue-100 transition-colors px-4 py-2 rounded-md flex items-center whitespace-nowrap shadow-md hover:shadow-lg realfont2 w-[200px] sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="mr-2" size={18} /> {t("Add Fund")}
          </button>
        </div>

        {/* Make search and add button responsive */}
        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="relative w-full sm:w-[300px]">
            <input
              type="text"
              placeholder={t("Search")}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="text-base sm:text-md md:text-md text-gray-600 font-medium">
            {t("Total Funds")} :<span className="text-blue-950 font-bold px-2">{filteredFundData.length}</span>
          </div>
         
        </div>

        {/* Make DataTable responsive */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredFundData}
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
                  borderTopColor: "rgba(229, 231, 235, 0.5)",
                  fontWeight: 500,
                },
              },
              table: {
                style: {
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                },
              },
            }}
          />
        </div>

        {filteredFundData.length === 0 && <div className="text-center p-4 md:p-8 text-gray-500">{t("No funds found")}</div>}
      </div>

      {/* Make modals responsive */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div ref={modalRef}
                               className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950">
                {isEditMode ? t("Edit Fund") : t("Fund Distribution")}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form content remains the same, just ensure padding is responsive */}
            <div className="p-4 md:p-6 space-y-4">
              {formError && (
                <div className="text-red-500 text-sm mb-4 flex items-center p-3 bg-red-50 rounded-md">
                  <AlertCircle className="mr-2 flex-shrink-0" size={20} />
                  <span>{formError}</span>
                </div>
              )}

              {isEditMode ? (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("School")}</label>
                    <input
                      type="text"
                      value={schools.find((s) => String(s.school_id) === String(selectedSchool))?.school_name || ""}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("Year")}</label>
                    <input
                      type="text"
                      value={selectedYear}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("Current Amount")}</label>
                    <input
                      type="number"
                      value={amount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("Additional Amount")}</label>
                    <input
                      type="number"
                      value={additionalAmount}
                      onChange={(e) => setAdditionalAmount(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.additionalAmount
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder={t("Enter additional amount")}
                    />
                    {errors.additionalAmount && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="mr-2 flex-shrink-0" size={16} /> {errors.additionalAmount}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("School")}</label>
                    <select
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.school ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                    >
                      <option value="">{t("Select School")}</option>
                      {schools.map((school) => (
                        <option key={school.school_id} value={school.school_id}>
                          {school.school_name}
                        </option>
                      ))}
                    </select>
                    {errors.school && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="mr-2 flex-shrink-0" size={16} /> {errors.school}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("Year")}</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="2023-24">2023-24</option>
                      <option value="2024-25">2024-25</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">{t("Amount")}</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.amount ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder={t("Enter amount")}
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="mr-2 flex-shrink-0" size={16} /> {errors.amount}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-3 border-t flex item-center justify-center">
              <button
                onClick={handleSubmit}
                className="w-full sm:w-[60%] md:w-[40%] bg-blue-950 text-white py-2 md:py-3 rounded-md hover:bg-blue-900 transition-colors font-semibold text-lg md:text-xl"
              >
               {t("SUBMIT")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FundDist

