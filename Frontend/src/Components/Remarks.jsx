import { useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Image } from "lucide-react";
import axios from "axios";

export default function Remarks() {
  const location = useLocation();
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
  } = location.state || {};

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false);
  const [remarkDate, setRemarkDate] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [actualExpense, setActualExpense] = useState("");
  const [remarkPhoto, setRemarkPhoto] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized remark parser
  const parseRemarks = useCallback((data) => {
    if (!data) return [];
    
    // Normalize data to always be an array
    const dataArray = Array.isArray(data) ? data : (data.data || []);
    
    return dataArray.map(remark => {
      // Use parsedData if available from backend
      if (remark.parsedData) {
        return {
          id: remark.nirnay_remarks_id,
          date: remark.previous_date || new Date().toISOString(),
          text: remark.parsedData.remarkText || "No remark",
          amount: remark.parsedData.actualExpense || "0",
          photo: remark.parsedData.remarkPhoto || null
        };
      }
      
      // Fallback to parsing the raw record
      const parts = remark.nirnay_remarks_record?.split('|') || [];
      return {
        id: remark.nirnay_remarks_id,
        date: remark.previous_date || new Date().toISOString(),
        text: parts[4]?.trim() || "No remark",
        amount: parts[6]?.trim() || "0",
        photo: parts[5]?.trim() || null
      };
    });
  }, []);

  // Fetch remarks with error handling
  const fetchRemarks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:5000/api/remarks?tharavNo=${tharavNo}`
      );
      
      setRemarks(parseRemarks(response.data));
    } catch (err) {
      console.error("Failed to fetch remarks:", err);
      setError("Failed to load remarks. Please try again later.");
      setRemarks([]);
    } finally {
      setIsLoading(false);
    }
  }, [tharavNo, parseRemarks]);

  // Initial fetch and refetch when tharavNo changes
  useEffect(() => {
    if (tharavNo) fetchRemarks();
  }, [tharavNo, fetchRemarks]);

  // Submit new remark
  const handleAddRemark = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!remarkText || !actualExpense) {
      setError("Remark text and actual expense are required");
      return;
    }

    const formData = new FormData();
    formData.append("tharavNo", tharavNo);
    formData.append("remarkDate", remarkDate || new Date().toISOString());
    formData.append("remarkText", remarkText);
    formData.append("actualExpense", actualExpense);
    if (remarkPhoto) formData.append("remarkPhoto", remarkPhoto);
    formData.append("meetingNumber", meetingNumber);
    formData.append("schoolId", schoolId);
    formData.append("userId", userId);
    formData.append("headId", headId);

    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post("http://localhost:5000/api/remarks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh remarks after successful submission
      await fetchRemarks();
      
      // Reset form
      setRemarkDate("");
      setRemarkText("");
      setActualExpense("");
      setRemarkPhoto(null);
      setIsAddRemarkModalOpen(false);
    } catch (err) {
      console.error("Failed to add remark:", err);
      setError(err.response?.data?.message || "Failed to add remark");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="container mx-auto px-4 py-8 realfont">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-950 mb-8 text-center">
          Tharav No. {tharavNo}
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Tharav Details */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Date
            </label>
            <p className="mt-1 text-lg text-gray-900">{formatDate(date)}</p>
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Purpose
            </label>
            <p className="mt-1 text-lg text-gray-900">{purpose || "N/A"}</p>
          </div>
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Expected Amount
            </label>
            <p className="mt-1 text-lg text-gray-900">{formatCurrency(expectedAmount)}</p>
          </div>
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-600">
              Decision Taken
            </label>
            <p className="mt-1 text-lg text-gray-900">{decisionTaken || "N/A"}</p>
          </div>
        </div>

        {/* Photo View Button */}
        {photo && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
            disabled={isLoading}
          >
            <Image size={18} />
            View Tharav Photo
          </button>
        )}

        {/* Add Remark Button */}
        <button
          onClick={() => setIsAddRemarkModalOpen(true)}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Add Remark"}
        </button>

        {/* Remarks List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-4">Remarks</h2>
          
          {isLoading ? (
            <div className="text-center py-8">Loading remarks...</div>
          ) : remarks.length > 0 ? (
            <div className="space-y-4">
              {remarks.map((remark) => (
                <div key={remark.id} className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>Date:</strong> {formatDate(remark.date)}</p>
                  <p><strong>Remark:</strong> {remark.text}</p>
                  <p><strong>Actual Expense:</strong> {formatCurrency(remark.amount)}</p>
                  {remark.photo && (
                    <img 
                      src={`http://localhost:5000/${remark.photo}`}
                      alt="Remark proof"
                      className="mt-2 max-w-xs rounded-lg border border-gray-300"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {error ? "Error loading remarks" : "No remarks added yet"}
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-4 max-w-4xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <img
              src={photo}
              alt="Full Tharav Photo"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Add Remark Modal */}
      {isAddRemarkModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={remarkDate}
                  onChange={(e) => setRemarkDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remark
                </label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Expense (₹)
                </label>
                <input
                  type="number"
                  value={actualExpense}
                  onChange={(e) => setActualExpense(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Photo
                </label>
                <input
                  type="file"
                  onChange={(e) => setRemarkPhoto(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  accept="image/*"
                />
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Remark"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}