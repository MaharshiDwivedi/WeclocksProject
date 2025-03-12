import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Image, PhoneOutgoing, PhoneOutgoingIcon } from "lucide-react";
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
  } = location.state || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddRemarkModalOpen, setIsAddRemarkModalOpen] = useState(false);
  const [remarkDate, setRemarkDate] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [actualExpense, setActualExpense] = useState("");
  const [remarkPhoto, setRemarkPhoto] = useState(null);
  const [remarks, setRemarks] = useState([]);

  const handleAddRemark = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("tharavNo", tharavNo);
    formData.append("remarkDate", remarkDate); // should match previous_date in model
    formData.append("remarkText", remarkText); // should match nirnay_remarks_record
    formData.append("actualExpense", actualExpense);
    formData.append("remarkPhoto", remarkPhoto);
  
    try {
      const response = await axios.post("http://localhost:5000/api/remarks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setRemarks([...remarks, response.data]);
      setIsAddRemarkModalOpen(false);
    } catch (error) {
      console.error("Error adding remark:", error);
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8 realfont">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-950 mb-8 text-center">
          Tharav No. {tharavNo}
        </h1>

        {/* Grid for details */}
        <div className="grid grid-cols-2 gap-6">
          {/* Tharav No. */}
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Tharav No.
            </label>
            <p className="mt-1 text-lg text-gray-900">{tharavNo}</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Date
            </label>
            <p className="mt-1 text-lg text-gray-900">{date}</p>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Purpose
            </label>
            <p className="mt-1 text-lg text-gray-900">{purpose}</p>
          </div>

          {/* Expected Amount */}
          <div>
            <label className="block text-base font-semibold text-gray-600">
              Expected Amount
            </label>
            <p className="mt-1 text-lg text-gray-900">₹{expectedAmount}</p>
          </div>

          {/* Decision Taken */}
          <div className="col-span-2">
            <label className="block text-base font-semibold text-gray-600">
              Decision Taken
            </label>
            <p className="mt-1 text-lg text-gray-900">{decisionTaken}</p>
          </div>
        </div>

        {/* Photo Section with View Button */}
        {photo && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Image />
          </button>
        )}

        {/* Add Remark Button */}
        <button
          onClick={() => setIsAddRemarkModalOpen(true)}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Remark
        </button>

        {/* Display Remarks */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-blue-950 mb-4">Remarks</h2>
          {remarks.map((remark, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg mb-4">
              <p><strong>Remark No.:</strong> {remark.nirnay_remarks_id}</p>
              <p><strong>Date:</strong> {remark.previous_date}</p>
              <p><strong>Remark:</strong> {remark.remarkText}</p>
              <p><strong>Actual Expense:</strong> ₹{remark.actualExpense}</p>
              {remark.remarkPhoto && (
                <img src={remark.remarkPhoto} alt="Remark Photo" className="mt-2 max-w-full h-auto rounded-lg" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Full-Size Image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50">
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

      {/* Modal for Add Remark */}
      {isAddRemarkModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full">
            <button
              onClick={() => setIsAddRemarkModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-blue-950 mb-6">Add Remark</h2>
            <form onSubmit={handleAddRemark}>
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-600">
                  Date
                </label>
                <input
                  type="date"
                  value={remarkDate}
                  onChange={(e) => setRemarkDate(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-600">
                  Remark
                </label>
                <textarea
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-600">
                  Actual Expense
                </label>
                <input
                  type="number"
                  value={actualExpense}
                  onChange={(e) => setActualExpense(e.target.value)}
                  className="mt-1 p-2 w-full border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-600">
                  Upload Photo
                </label>
                <input
                  type="file"
                  onChange={(e) => setRemarkPhoto(e.target.files[0])}
                  className="mt-1 p-2 w-full border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}