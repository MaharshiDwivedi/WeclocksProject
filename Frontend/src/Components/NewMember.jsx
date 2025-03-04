import { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { Plus } from "lucide-react";

export default function Ui() {
  const API_URL = "http://localhost:5000/api/member";
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [newMember, setNewMember] = useState({
    name: "",
    representative: "",
    mobile: "",
    gender: "",
    cast: "",
    year: "",
  });
  const [insertdate, setinsertdate] = useState("");
  // const [syncDateTime, setSyncDateTime] = useState(""); // New state for sync date & time
  const representativeOptions = [
    "Principal EX (प्राचार्य माजी)",
    "board representative (मंडळ प्रतिनिधी)",
    "parent representative (पालक प्रतिनिधी)",
    "teacher representative (शिक्षक प्रतिनिधी)",
    "student representative (विद्यार्थी प्रतिनिधी)",
  ];

  const castOptions = ["GEN", "OBC", "ST", "SC"];

  const designationOptions = [
    "अध्यक्",
    "उपाध्यक्",
    "सदस्य",
    "सदस्य सचिव",
    "सह सचिव",
  ];

  const genderoption = ["Male", "Female"];

  const yearoption = [
    {
      lable: "2023-24",
      value: "2023-2024",
    },
    {
      lable: "2024-25",
      value: "2024-2025",
    },
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  // Fetch all members
  const fetchMembers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      console.log("Fetched Members:", data);
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    }
  };
  
  const handleEdit = (member) => {
    const recordData = member.member_record.split("|");
    setinsertdate(recordData[6]);

    setNewMember({
      name: recordData[0] || "",
      mobile: recordData[1] || "",
      representative: recordData[2] || "",
      cast: recordData[3] || "",
      year: recordData[10] || "",
      designation: recordData[8] || "",
      gender: recordData[9] || "",
    });
    setCurrentMemberId(member.member_id);
    setIsEditing(true);
    setIsModalOpen(true);
    // Set sync date/time on edit as well
    // const now = new Date();
    // setSyncDateTime(now.toLocaleString());
  };

  // Handle delete member
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // Handle form submit (Add or Update)
  const handleSubmit = async () => {
    // Prepare member data
    const memberData = `${newMember.name}|${newMember.mobile}|${
      newMember.representative
    }|${newMember.cast}|14|34|${isEditing ? insertdate : formattedDate}|${
      isEditing ? formattedDate : "0000-00-00 00:00:00"
    }|${newMember.designation}|${newMember.gender}|${newMember.year}`;

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentMemberId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_record: memberData }),
      });

      if (!res.ok) throw new Error("Failed to save member");
      fetchMembers();
      closeModal();
    } catch (error) {
      console.error("Error saving member:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setNewMember({
      name: "",
      representative: "",
      designation: "",
      gender: "",
      mobile: "",
      cast: "",
      year: "",
    });
    setCurrentMemberId(null);
    // setSyncDateTime(""); // Clear the sync date/time when closing the modal
  };

  const handlerepresentativeChange = (value) => {
    setNewMember({ ...newMember, representative: value });
  };

  const handlecastChange = (value) => {
    setNewMember({ ...newMember, cast: value });
  };

  const handledesignationChange = (value) => {
    setNewMember({ ...newMember, designation: value, year: value });
  };
  const handleyear = (value) => {
    setNewMember({ ...newMember, year: value });
  };
  const handlegender = (value) => {
    setNewMember({ ...newMember, gender: value });
  };
  // const handlegenderChange = (value) => {
  //     setNewMember({ ...newMember, gender: value });
  // };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setNewMember({
      name: "",
      representative: "",
      designation: "",
      gender: "",
      mobile: "",
      cast: "",
    });
    // Set the sync date/time when the modal opens
    // const now = new Date();
    // setSyncDateTime(now.toLocaleString());
  };

  return (
    <div className="p-4 bg-purple-100 w-full">
      <div className="bg-purple-600 text-white text-xl font-bold p-4 text-center rounded-t-md realfont2">
        <span>Committee Members</span>
      </div>
      <div className="flex justify-end p-4">
        <button
          onClick={handleOpenModal}
          className="bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded realfont2 flex"
        >

<Plus />

           ADD MEMBER
        </button>
      </div>
      <div className="overflow--auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Representative
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Cast
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 ">
            {members.map((member) => {
              const recordData = member.member_record
                ? member.member_record.split("|")
                : [];
              return (
                <tr key={member.member_id} className="mb-2">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[0] || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[1] || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[2] || "N/A"}
                    </div>
                  </td>

                  {/* 
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{recordData[10] || 'N/A'}</div>
                                    </td> */}

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[8] || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[9] || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {yearoption.find(
                        (option) => option.value === recordData[10]
                      )?.lable || "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[3] || "N/A"}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="text-gray-500 hover:text-purple-600">
                        <FaEllipsisV size={18} />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(member)}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              } text-purple-600`}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDelete(member.member_id)}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              } text-red-600`}
                            >
                              <FaTrash className="mr-2" /> Delete
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>{" "}
      {members.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No members found</p>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 overflow-scroll">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl transition-transform transform">
            {" "}
            {/* Increased max-w for wider screens */}
            <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">
              {isEditing ? "Edit Member" : "Add New Member"}
            </h2>
            <div className="border border-b w-full border-purple-900 mb-5"></div>
            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              {/* Responsive grid: 1 column on small screens, 2 on medium and up */}
              {/* Full Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                  placeholder="Enter full name"
                />
              </div>
              {/* Mobile No Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Mobile No
                </label>
                <input
                  type="text"
                  value={newMember.mobile}
                  onChange={(e) =>
                    setNewMember({ ...newMember, mobile: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                  placeholder="Enter mobile number"
                />
              </div>
              {/* Representative Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Representative
                </label>
                <select
                  value={newMember.representative}
                  onChange={(e) => handlerepresentativeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">Select representative</option>
                  {representativeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {/* Gender Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Gender
                </label>
                <select
                  value={newMember.gender}
                  onChange={(e) => handlegender(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">Select Gender</option>
                  {genderoption.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {/* Designation Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Designation
                </label>
                <select
                  value={newMember.designation}
                  onChange={(e) => handledesignationChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              {/* Year Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Year
                </label>
                <select
                  value={newMember.year}
                  onChange={(e) => handleyear(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">Select Year</option>
                  {yearoption.map((option) => (
                    <option key={option} value={option.value}>
                      {option.lable}
                    </option>
                  ))}
                </select>
              </div>
              {/* Cast Field */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Cast
                </label>
                <select
                  value={newMember.cast}
                  onChange={(e) => handlecastChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">Select Cast</option>
                  {castOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>{" "}
            {/* End Grid Container */}
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-400 px-4 py-2 rounded text-white hover:bg-gray-500 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700 transition duration-200"
              >
                {isEditing ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Member Button - Moved to the Bottom */}
    </div>
  );
}