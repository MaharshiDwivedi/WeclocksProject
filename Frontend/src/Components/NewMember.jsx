
import { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";

export default function Ui() {
    const API_URL = "http://localhost:5000/api/member";
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentMemberId, setCurrentMemberId] = useState(null);
    const [newMember, setNewMember] = useState({ name: "", designation: "", mobile: "", category: "" });
    const [syncDateTime, setSyncDateTime] = useState(""); // New state for sync date & time

    const designationOptions = [
        "Principal EX (प्राचार्य माजी)",
        "board representative (मंडळ प्रतिनिधी)",
        "parent representative (पालक प्रतिनिधी)",
        "teacher representative (शिक्षक प्रतिनिधी)",
        "student representative (विद्यार्थी प्रतिनिधी)",
    ];

    const categoryOptions = ["GEN","OBC","ST","SC"];

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

    // Handle modal open (Edit mode)
    const handleEdit = (member) => {
        const recordData = member.member_record.split('|');
        console.log("checkdata", recordData)
        setNewMember({
            name: recordData[0] || "",
            mobile: recordData[1] || "",
            designation: recordData[2] || "",
            category: recordData[3] || "",
        });
        setCurrentMemberId(member.member_id);
        setIsEditing(true);
        setIsModalOpen(true);
        // Set sync date/time on edit as well
        const now = new Date();
        setSyncDateTime(now.toLocaleString());
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

    // Handle form submit (Add or Update)
    const handleSubmit = async () => {
        if (!newMember.name || !newMember.mobile || !newMember.designation || !newMember.category) {
            alert("Please fill in all fields!");
            return;
        }

        const memberData = `${newMember.name}|${newMember.mobile}|${newMember.designation}|${newMember.category}`;

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
        setNewMember({ name: "", designation: "", mobile: "", category: "" });
        setCurrentMemberId(null);
        setSyncDateTime(""); // Clear the sync date/time when closing the modal
    };

    const handleDesignationChange = (value) => {
        setNewMember({ ...newMember, designation: value });
    };

    const handleCategoryChange = (value) => {
        setNewMember({ ...newMember, category: value });
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setIsEditing(false);
        setNewMember({ name: '', designation: '', mobile: '', category: '' });
        // Set the sync date/time when the modal opens
        const now = new Date();
        setSyncDateTime(now.toLocaleString());
    };

    return (
        <div className="p-4 bg-blue-200 min-h-screen ">
            <div className="bg-blue-950 text-white text-xl font-bold p-4 text-center rounded-t-md">
                <span>Committee Members</span>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-md">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Designation</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 ">
                        {members.map((member) => {
                            const recordData = member.member_record ? member.member_record.split('|') : [];
                            return (
                                <tr key={member.member_id} className="mb-2">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{recordData[0] || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{recordData[1] || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{recordData[2] || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{recordData[3] || 'N/A'}</div>
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
                                                            className={`flex items-center w-full px-4 py-2 text-sm ${active ? "bg-gray-100" : ""} text-purple-600`}
                                                        >
                                                            <FaEdit className="mr-2" /> Edit
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                                <Menu.Item>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={() => handleDelete(member.member_id)}
                                                            className={`flex items-center w-full px-4 py-2 text-sm ${active ? "bg-gray-100" : ""} text-red-600`}
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
            </div> {members.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No members found</p>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Member" : "Add New Member"}</h2>

                        {/* Full Name Field */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold mb-1">Full Name</label>
                            <input type="text" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="w-full p-2 border rounded" />
                        </div>

                        {/* Mobile No Field - Moved to 2nd Position */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold mb-1">Mobile No</label>
                            <input type="text" value={newMember.mobile} onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })} className="w-full p-2 border rounded" />
                        </div>

                        {/* Designation Field - Moved to 3rd Position */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold mb-1">Designation</label>
                            <select
                                value={newMember.designation}
                                onChange={(e) => handleDesignationChange(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Designation</option>
                                {designationOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Field */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold mb-1">Category</label>
                            <select
                                value={newMember.category}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Category</option>
                                {categoryOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sync Date and Time Field - Moved to Last */}
                        <div className="mb-3">
                            <label className="block text-sm font-semibold mb-1">Sync Date and Time</label>
                            <input
                                type="text"
                                value={syncDateTime}
                                className="w-full p-2 border rounded bg-gray-100" // Make it look read-only
                                readOnly // Prevent user editing
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeModal} className="bg-gray-400 px-4 py-2 rounded text-white">Cancel</button>
                            <button onClick={handleSubmit} className="bg-purple-600 px-4 py-2 rounded text-white">{isEditing ? "Update" : "Submit"}</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Member Button - Moved to the Bottom */}
            <div className="flex justify-end p-4">
                <button
                    onClick={handleOpenModal}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    + ADD MEMBER
                </button>
            </div>
        </div>
    );
}
