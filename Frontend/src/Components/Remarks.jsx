import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
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
    headId, // Add headId from state
  } = location.state || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false);
  const [remarkDate, setRemarkDate] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [actualExpense, setActualExpense] = useState("");
  const [remarkPhoto, setRemarkPhoto] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to parse remarks consistently
  const parseRemarks = (data) => {
    return data.map(remark => {
      // If already parsed by backend, use as-is
      if (remark.text && remark.amount) return remark;
      
      // Otherwise parse the raw record
      const parts = remark.nirnay_remarks_record?.split('|') || [];
      return {
        id: remark.nirnay_remarks_id,
        date: remark.previous_date || new Date().toISOString(),
        text: parts[4]?.trim() || "No remark",
        amount: parts[6]?.trim() || "0",
        photo: parts[5]?.trim() || null
      };
    });
  };

  useEffect(() => {
    const fetchRemarks = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/remarks?tharavNo=${tharavNo}`
        );
        
        // Use the parseRemarks helper function
        setRemarks(parseRemarks(response.data));
      } catch (error) {
        console.error("Error fetching remarks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tharavNo) fetchRemarks();
  }, [tharavNo]);

  const handleAddRemark = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("tharavNo", tharavNo);
    formData.append("remarkDate", remarkDate);
    formData.append("remarkText", remarkText);
    formData.append("actualExpense", actualExpense);
    formData.append("remarkPhoto", remarkPhoto);
    formData.append("meetingNumber", meetingNumber);
    formData.append("schoolId", schoolId);
    formData.append("userId", userId);
    formData.append("headId", headId); // Add headId to FormData
    try {
      setIsLoading(true);
      await axios.post("http://localhost:5000/api/remarks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      // Re-fetch remarks after adding
      const response = await axios.get(
        `http://localhost:5000/api/remarks?tharavNo=${tharavNo}`
      );
      
      // Use the same parsing function here as well
      setRemarks(parseRemarks(response.data));
  
      // Reset form
      setRemarkDate("");
      setRemarkText("");
      setActualExpense("");
      setRemarkPhoto(null);
      setIsAddRemarkModalOpen(false);
    } catch (error) {
      console.error("Error adding remark:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
          >
            <Image size={18} />
            View Tharav Photo
          </button>
        )}

        {/* Add Remark Button */}
        <button
          onClick={() => setIsAddRemarkModalOpen(true)}
          className="mt-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
        >
          Add Remark
        </button>

        {/* Remarks List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-4">Remarks</h2>
          
          {isLoading ? (
            <div className="text-center py-8">Loading remarks...</div>
          ) : remarks.length > 0 ? (
            remarks.map((remark) => (
              <div key={remark.id} className="bg-gray-100 p-4 rounded-lg mb-4">
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
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No remarks added yet
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
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
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