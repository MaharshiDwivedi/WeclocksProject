import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TharavFormModal from "./TharavFormModal";

const Tharav = () => {
  const { index } = useParams();
  const [isTharavModalOpen, setIsTharavModalOpen] = useState(false);

  // Dummy meeting data (replace with actual data)
  const meetings = [
    {
      date: "2025-02-17",
      members: [
        { name: "Jayraj Kalsariya", role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष" },
        { name: "Mayur Wagh", role: "Parent Representative (पालक प्रतिनिधी) | सदस्य" },
        { name: "Nitin Dube", role: "Member" },
      ],
      address: "123 Main St",
      photo: null,
    },
    {
      date: "2025-02-10",
      members: [
        { name: "Jayraj Kalsariya", role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष" },
        { name: "Mayur Wagh", role: "Parent Representative (पालक प्रतिनिधी) | सदस्य" },
      ],
      address: "456 Oak Ave",
      photo: null,
    },
  ];

  const meeting = meetings[index];

  if (!meeting) {
    return <div className="text-red-600 text-center text-xl mt-10">⚠️ Meeting not found</div>;
  }

  return (
    <div className="container mx-auto mt-8 p-4">
      {/* Meeting Details */}
      <h1 className="text-3xl font-bold text-center mb-4">Meeting No: {parseInt(index) + 1}</h1>
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <div className="mb-2">
          <strong>Date:</strong> {meeting.date}
        </div>
        <div className="mb-2">
          <strong>Address:</strong> {meeting.address}
        </div>
        <div className="mb-2">
          <strong>Members:</strong>
          <ul className="list-disc pl-5">
            {meeting.members.map((member, i) => (
              <li key={i}>{member.name} - {member.role}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Tharav Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsTharavModalOpen(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-all"
        >
          Add Tharav
        </button>
      </div>

      {/* Tharav Modal */}
      {isTharavModalOpen && (
        <TharavFormModal isOpen={isTharavModalOpen} onClose={() => setIsTharavModalOpen(false)} />
      )}
    </div>
  );
};

export default Tharav;
