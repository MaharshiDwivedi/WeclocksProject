"use client"

import { useLocation } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { CheckCircle, Image, Plus } from "lucide-react"
import axios from "axios"
import Swal from "sweetalert2"

export default function Remarks() {
  const location = useLocation()
  const {
    tharavNo,
    date,
    purpose,
    expectedAmount,
    decisionTaken,
    photo,
    meetingNumber,
    meetingId,
    schoolId,
    userId,
    headId,
    nirnay_id,
  } = location.state || {}

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewImageModalOpen, setIsViewImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [remarkDate, setRemarkDate] = useState("")
  const [remarkText, setRemarkText] = useState("")
  const [actualExpense, setActualExpense] = useState("")
  const [remarkPhoto, setRemarkPhoto] = useState(null)
  const [remarks, setRemarks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingRemark, setEditingRemark] = useState(null)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [finalRemark, setFinalRemark] = useState("")
  const [finalRemarkPhoto, setFinalRemarkPhoto] = useState(null)
  const [isTharavCompleted, setIsTharavCompleted] = useState(false)
  const [completedTharavData, setCompletedTharavData] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false);

  // Memoized remark parser
  const parseRemarks = useCallback((data) => {
    if (!data) return []

    // Normalize data to always be an array
    const dataArray = Array.isArray(data) ? data : data.data || []

    return dataArray.map((remark) => {
      // Use parsedData if available from backend
      if (remark.parsedData) {
        return {
          id: remark.nirnay_remarks_id,
          date: remark.previous_date || new Date().toISOString(),
          text: remark.parsedData.remarkText || "No remark",
          amount: remark.parsedData.actualExpense || "0",
          photo: remark.parsedData.remarkPhoto || null,
        }
      }

      // Fallback to parsing the raw record
      const parts = remark.nirnay_remarks_record?.split("|") || []
      return {
        id: remark.nirnay_remarks_id,
        date: remark.previous_date || new Date().toISOString(),
        text: parts[4]?.trim() || "No remark",
        amount: parts[6]?.trim() || "0",
        photo: parts[5]?.trim() || null,
      }
    })
  }, [])

  // Check tharav completion status
  const checkTharavCompletion = useCallback(async (tharavId) => {
    if (!tharavId) {
      console.error("No tharav ID available");
      return;
    }
  
    try {
      const response = await axios.get(`http://localhost:5000/api/tharav/status/${tharavId}`);
      
      if (response.data) {
        // Handle both array and object formats
        let completedData = response.data.completedData;
        if (Array.isArray(completedData)) {
          completedData = completedData[0] || null;
        }
  
        const isCompleted = response.data.isCompleted || 
                           (completedData && completedData.work_status === 'Completed');
  
        setIsTharavCompleted(isCompleted);
        setCompletedTharavData(completedData || null);
        
        // Update localStorage
        localStorage.setItem(`tharavCompleted_${tharavId}`, isCompleted ? 'true' : 'false');
      } else {
        console.error("Invalid response format:", response.data);
        setIsTharavCompleted(false);
        setCompletedTharavData(null);
      }
    } catch (err) {
      console.error("Error checking tharav completion:", err);
      setIsTharavCompleted(false);
      setCompletedTharavData(null);
    }
  }, []);
  // Fetch remarks with error handling
  const fetchRemarks = useCallback(async (tharavId) => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (!tharavId) {
        console.error("No tharav ID available for fetching remarks")
        setIsLoading(false)
        return
      }
      
      const response = await axios.get(`http://localhost:5000/api/remarks`, {
        params: {
          nirnay_id: tharavId
        }
      })

      setRemarks(parseRemarks(response.data))
    } catch (err) {
      console.error("Failed to fetch remarks:", err)
      setError("Failed to load remarks. Please try again later.")
      setRemarks([])
    } finally {
      setIsLoading(false)
    }
  }, [parseRemarks])

  // Initial data loading
  useEffect(() => {
    // If we have nirnay_id from location state, store it in localStorage
    if (nirnay_id) {
      localStorage.setItem('currentTharavId', nirnay_id);
      localStorage.setItem(`tharavCompleted_${nirnay_id}`, isTharavCompleted ? 'true' : 'false');
    }
    
    // Use either the nirnay_id from location state or from localStorage
    const tharavIdToUse = nirnay_id || localStorage.getItem('currentTharavId');
    
    if (tharavIdToUse) {
      // Check localStorage first for immediate UI feedback
      const storedStatus = localStorage.getItem(`tharavCompleted_${tharavIdToUse}`);
      if (storedStatus === 'true') {
        setIsTharavCompleted(true);
      }
      
      // Then verify with server
      checkTharavCompletion(tharavIdToUse);
      fetchRemarks(tharavIdToUse);
    }
  }, [nirnay_id, checkTharavCompletion, fetchRemarks]);

  // Submit new remark
  const handleAddRemark = async (e) => {
    e.preventDefault()
  
    if (!remarkText || !actualExpense) {
      Swal.fire("Error!", "Remark text and actual expense are required", "error")
      return
    }
  
    try {
      setIsLoading(true)
  
      const formData = new FormData()
      formData.append("remarkText", remarkText)
      formData.append("actualExpense", actualExpense)
      formData.append("remarkDate", remarkDate || new Date().toISOString())
      formData.append("nirnay_id", nirnay_id)
      formData.append("schoolId", schoolId)
      formData.append("userId", userId)
      formData.append("headId", headId)
      if (remarkPhoto) formData.append("remarkPhoto", remarkPhoto)
  
      await axios.post("http://localhost:5000/api/remarks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
  
      await fetchRemarks(nirnay_id || localStorage.getItem('currentTharavId'))
      setRemarkDate("")
      setRemarkText("")
      setActualExpense("")
      setRemarkPhoto(null)
      setIsAddRemarkModalOpen(false)
  
      Swal.fire("Success!", "Remark added successfully", "success")
    } catch (err) {
      console.error("Failed to add remark:", err)
      Swal.fire("Error!", err.response?.data?.message || "Failed to add remark", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Edit remark handler
  const handleEditRemark = (remark) => {
    setEditingRemark(remark)
    setRemarkText(remark.text)
    setActualExpense(remark.amount)
    setRemarkDate(remark.date)
    setIsEditModalOpen(true)
  }

  // Submit edited remark
  const handleEditSubmit = async (e) => {
    e.preventDefault()

    if (!remarkText || !actualExpense) {
      Swal.fire("Error!", "Remark text and actual expense are required", "error")
      return
    }

    // Create FormData for the edit request
    const formData = new FormData()
    formData.append("remarkText", remarkText)
    formData.append("actualExpense", actualExpense)
    formData.append("remarkDate", remarkDate)
    formData.append("schoolId", schoolId)
    formData.append("userId", userId)
    if (remarkPhoto) formData.append("remarkPhoto", remarkPhoto)

    try {
      setIsLoading(true)
      await axios.put(`http://localhost:5000/api/remarks/${editingRemark.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      await fetchRemarks(nirnay_id || localStorage.getItem('currentTharavId'))
      setIsEditModalOpen(false)
      setEditingRemark(null)
      setRemarkPhoto(null)

      Swal.fire("Success!", "Remark updated successfully", "success")
    } catch (err) {
      console.error("Failed to update remark:", err)
      Swal.fire("Error!", err.response?.data?.message || "Failed to update remark", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTharav = async (e) => {
    e.preventDefault()
    
    const tharavIdToUse = nirnay_id || localStorage.getItem('currentTharavId')
    
    if (!tharavIdToUse) {
      Swal.fire("Error!", "Tharav ID not found", "error")
      return
    }
    
    if (!finalRemark) {
      Swal.fire("Error!", "Final remark is required", "error")
      return
    }
  
    try {
      setIsLoading(true)
  
      const formData = new FormData()
      formData.append("nirnay_id", tharavIdToUse)
      formData.append("completed_remarks", finalRemark)
      formData.append("schoolId", schoolId || localStorage.getItem('schoolId'))
      formData.append("userId", userId || localStorage.getItem('userId'))
      
      if (finalRemarkPhoto) {
        formData.append("complete_tharav_img", finalRemarkPhoto)
      }
  
      const response = await axios.post(
        "http://localhost:5000/api/tharav/complete", 
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
  
      if (response.data.success) {
        // Save to localStorage
        localStorage.setItem(`tharavCompleted_${tharavIdToUse}`, 'true')
        
        // Update state
        setIsTharavCompleted(true)
        setCompletedTharavData(response.data.completedData)
        
        Swal.fire("Success!", "Tharav marked as completed", "success")
        setIsCompleteModalOpen(false)
      }
    } catch (err) {
      console.error("Failed to complete tharav:", err)
      Swal.fire("Error!", err.response?.data?.message || "Failed to complete tharav", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Delete remark handler
  const handleDeleteRemark = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    })

    if (result.isConfirmed) {
      try {
        setIsLoading(true)
        await axios.delete(`http://localhost:5000/api/remarks/${id}`)
        await fetchRemarks(nirnay_id || localStorage.getItem('currentTharavId'))

        Swal.fire("Deleted!", "Your remark has been deleted.", "success")
      } catch (err) {
        console.error("Failed to delete remark:", err)
        Swal.fire("Error!", err.response?.data?.message || "Failed to delete remark", "error")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // View image handler
  const handleViewImage = (imagePath) => {
    setSelectedImage(`http://localhost:5000/${imagePath}`)
    setIsViewImageModalOpen(true)
  }

  // Helper functions
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(num)
  }
  return (
    <div className="container mx-auto px-4 py-8 realfont">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-950 mb-8 text-center">Tharav No. {tharavNo}</h1>

        {/* Error Message */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        {/* Tharav Details Card */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8 shadow-md">
          <h2 className="text-xl font-bold text-blue-950 mb-4">Tharav Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-black-1000">Date</label>
              <p className="mt-1 text-lg text-gray-900">{formatDate(date)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-Black-1000">Expected Amount</label>
              <p className="mt-1 text-lg text-gray-900">{formatCurrency(expectedAmount)}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-black-1000">Purpose</label>
              <p className="mt-1 text-lg text-gray-900 truncate">{purpose || "N/A"}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-semibold text-black-1000">Decision Taken</label>
              <p className="mt-1 text-lg text-gray-900">{decisionTaken || "N/A"}</p>
            </div>
            <div className="flex justify-between items-start">


            {!isTharavCompleted && (
  <button
    onClick={() => setIsCompleteModalOpen(true)}
    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors shadow-md"
    disabled={isLoading}
  >
    <CheckCircle size={18} />
    Complete Tharav
  </button>
)}
          </div>          
          {isTharavCompleted && (
  <div className="w-[500px] rounded-lg border-2 border-green-300 bg-green-100 p-6 relative ml-[55%] -mb-[19%]">
    {/* Date pill at the top */}
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-lg font-medium">
      {completedTharavData?.complete_date &&
        new Date(completedTharavData.complete_date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
    </div>

    <div className="mt-4 text-center">
      <h2 className="text-2xl font-bold text-green-800 mt-2">This Tharav is Completed</h2>
    </div>

    <div className="flex mt-8">
      <div className="flex-grow">
        <p className="text-xl font-medium text-green-800">
          Final Remark :{" "}
          <span className="text-black">{completedTharavData?.completed_remarks || "No final remark provided"}</span>
        </p>
      </div>

      {/* Photo section - Only show if image exists */}
      {completedTharavData?.complete_tharav_img && completedTharavData.complete_tharav_img !== "" && (
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowImageModal(true)}
            className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center cursor-pointer"
          >
            <Image className="w-8 h-8 text-white" />
          </button>
          <span className="mt-1 text-lg font-medium">Photo</span>
        </div>
      )}
    </div>

    {/* Image Modal */}
    {showImageModal && (
      <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
        <div className="relative max-w-4xl max-h-[90vh]">
          <button 
            className="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageModal(false);
            }}
          >
            &times;
          </button>
          <img 
            src={`http://localhost:5000${completedTharavData.complete_tharav_img}`} 
            alt="Completed Tharav" 
            className="max-w-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    )}
  </div>
)}




          </div>

          {/* Photo View Button */}
          {photo && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2 transition-colors"
            >
              <Image size={18} />
              View Tharav Photo
            </button>
          )}
        </div>

        {/* Remarks Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-950">Remarks</h2>

            {/* Add Remark Button */}
            {!isTharavCompleted ? (
<>
            <button
              onClick={() => setIsAddRemarkModalOpen(true)}
              className=" realfont2 bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md"
              disabled={isLoading}
            >
              <Plus size={18} />
              {isLoading ? "Processing..." : "Add Remark"}
            </button>
            </>
             ) : (
              <span className="text-gray-500 text-sm"> </span>
              )}
          </div>
          

          {isLoading && !remarks.length ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              <p>Loading remarks...</p>
            </div>
          ) : remarks.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200 bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remark
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actual Expense
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {remarks.map((remark) => (
                    <tr key={remark.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(remark.date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                        <div className="line-clamp-2">{remark.text}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(remark.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2">
                          {remark.photo ? (
                            <button
                              onClick={() => handleViewImage(remark.photo)}
                              className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer flex items-center gap-1"
                              title="View Image"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-gray-400 px-3 py-1 rounded-md bg-gray-100 text-lg font-medium min-w-[60px] text-center">
                              No Photo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 py-2">
                        {!isTharavCompleted ? (
                           <>
                          <button
                            onClick={() => handleEditRemark(remark)}
                            className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRemark(remark.id)}
                            className="text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer"
                            title="Delete"
                          >
                            Delete
                          </button>
                          </>
                           ) : (
                            <span className="text-gray-500 text-sm">Actions disabled (Tharav completed)</span>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-gray-500">{error ? "Error loading remarks" : "No remarks added yet"}</div>
              
            </div>
          )}
        </div>
      </div>

      {/* Tharav Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Tharav Photo</h3>
            <img
              src={photo || "/placeholder.svg"}
              alt="Full Tharav Photo"
              className="w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}























      

      {/* Remark Image Modal */}
      {isViewImageModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <button
              onClick={() => {
                setIsViewImageModalOpen(false)
                setSelectedImage(null)
              }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold mb-4">Remark Photo</h3>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Remark Photo"
              className="w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}


{isCompleteModalOpen && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                disabled={isLoading}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold text-blue-950 mb-6">Complete Tharav</h2>
              <form onSubmit={handleCompleteTharav}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Remark</label>
                  <textarea
                    value={finalRemark}
                    onChange={(e) => setFinalRemark(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Completion Proof (optional)</label>
                  <input
                    type="file"
                    onChange={(e) => setFinalRemarkPhoto(e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    accept="image/*"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCompleteModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Mark as Completed"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      
    
  




      {/* Add Remark Modal */}
      {isAddRemarkModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <button
              onClick={() => setIsAddRemarkModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-950 mb-6">Add Remark</h2>
            <form onSubmit={handleAddRemark}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={remarkDate}
                  onChange={(e) => setRemarkDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Expense (₹)</label>
                <input
                  type="number"
                  value={actualExpense}
                  onChange={(e) => setActualExpense(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Photo</label>
                <input
                  type="file"
                  onChange={(e) => setRemarkPhoto(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*"
                />
              </div>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRemarkModalOpen(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Remark Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-4px] flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <button
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingRemark(null)
                setRemarkPhoto(null)
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
              disabled={isLoading}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-950 mb-6">Edit Remark</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={remarkDate}
                  onChange={(e) => setRemarkDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Expense (₹)</label>
                <input
                  type="number"
                  value={actualExpense}
                  onChange={(e) => setActualExpense(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Photo (optional)</label>
                <input
                  type="file"
                  onChange={(e) => setRemarkPhoto(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*"
                />
                {editingRemark?.photo && !remarkPhoto && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Current Photo:</p>
                    <img
                      src={`http://localhost:5000/${editingRemark.photo}`}
                      alt="Current remark proof"
                      className="mt-1 max-h-32 rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setEditingRemark(null)
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

