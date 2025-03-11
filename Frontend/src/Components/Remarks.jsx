import { useLocation } from "react-router-dom";
import { useState } from "react";
import { Image, PhoneOutgoing, PhoneOutgoingIcon } from "lucide-react";

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
              <Image/>
            </button>
          
        )}
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
    </div>
  );
}
