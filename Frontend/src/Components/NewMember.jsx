// NewMember.jsx
import { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next"; 

export default function NewMember() {
  const { t } = useTranslation(); 
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

  const representativeOptions = [
    { value: "Principal EX (प्राचार्य माजी)", label: t("principalEx") },
    { value: "board representative (मंडळ प्रतिनिधी)", label: t("boardRepresentative") },
    { value: "parent representative (पालक प्रतिनिधी)", label: t("parentRepresentative") },
    { value: "teacher representative (शिक्षक प्रतिनिधी)", label: t("teacherRepresentative") },
    { value: "student representative (विद्यार्थी प्रतिनिधी)", label: t("studentRepresentative") },
  ];

  const castOptions = [
    { value: "GEN", label: t("gen") },
    { value: "OBC", label: t("obc") },
    { value: "ST", label: t("st") },
    { value: "SC", label: t("sc") },
  ];

  const designationOptions = [
    { value: "अध्यक्ष", label: t("chairman") },
    { value: "उपाध्यक्ष", label: t("viceChairman") },
    { value: "सदस्य", label: t("member") },
    { value: "सदस्य सचिव", label: t("memberSecretary") },
    { value: "सह सचिव", label: t("coSecretary") },
  ];

  const genderOptions = [
    { value: "Male", label: t("male") },
    { value: "Female", label: t("female") },
  ];

  const yearOptions = [
    { label: "2023-24", value: "2023-2024" },
    { label: "2024-25", value: "2024-2025" },
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(t("fetchMembersError"));
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
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteMember"))) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("deleteMemberError"));
      fetchMembers();
    } catch (error) {
      console.error("Error deleting member:", error);
      alert(t("deleteMemberError"));
    }
  };

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  const handleSubmit = async () => {
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

      if (!res.ok) throw new Error(t("saveMemberError"));
      fetchMembers();
      closeModal();
    } catch (error) {
      console.error("Error saving member:", error);
      alert(t("saveMemberError"));
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
  };

  const handlerepresentativeChange = (value) => {
    setNewMember({ ...newMember, representative: value });
  };

  const handlecastChange = (value) => {
    setNewMember({ ...newMember, cast: value });
  };

  const handledesignationChange = (value) => {
    setNewMember({ ...newMember, designation: value });
  };

  const handleyear = (value) => {
    setNewMember({ ...newMember, year: value });
  };

  const handlegender = (value) => {
    setNewMember({ ...newMember, gender: value });
  };

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
      year: "",
    });
  };

  return (
    <div className="p-4 w-full">
      <div className="bg-blue-950 text-white text-xl font-bold p-4 text-center rounded-t-md realfont2">
        <span>{t("committeeMembers")}</span>
      </div>
      <div className="flex justify-end p-4">
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded realfont2 flex"
        >
          <Plus />
          {t("addMember")}
        </button>
      </div>
      <div className="overflow--auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("mobile")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("representative")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("designation")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("gender")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("year")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("cast")}
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => {
              const recordData = member.member_record
                ? member.member_record.split("|")
                : [];
              return (
                <tr key={member.member_id} className="mb-2">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[0] || t("na")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[1] || t("na")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[2] || t("na")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[8] || t("na")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[9] || t("na")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {yearOptions.find(
                        (option) => option.value === recordData[10]
                      )?.label || t("na")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {recordData[3] || t("na")}
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
                              <FaEdit className="mr-2" /> {t("edit")}
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
                              <FaTrash className="mr-2" /> {t("delete")}
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
      </div>
      {members.length === 0 && (
        <p className="text-center text-gray-500 mt-4">{t("noMembersFound")}</p>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 overflow-scroll">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl transition-transform transform">
            <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">
              {isEditing ? t("editMember") : t("addMember")}
            </h2>
            <div className="border border-b w-full border-purple-900 mb-5"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                  placeholder={t("enterFullName")}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("mobile")}
                </label>
                <input
                  type="text"
                  value={newMember.mobile}
                  onChange={(e) =>
                    setNewMember({ ...newMember, mobile: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                  placeholder={t("enterMobileNumber")}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("representative")}
                </label>
                <select
                  value={newMember.representative}
                  onChange={(e) => handlerepresentativeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">{t("selectRepresentative")}</option>
                  {representativeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("gender")}
                </label>
                <select
                  value={newMember.gender}
                  onChange={(e) => handlegender(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">{t("selectGender")}</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("designation")}
                </label>
                <select
                  value={newMember.designation}
                  onChange={(e) => handledesignationChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">{t("selectDesignation")}</option>
                  {designationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("year")}
                </label>
                <select
                  value={newMember.year}
                  onChange={(e) => handleyear(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">{t("selectYear")}</option>
                  {yearOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  {t("cast")}
                </label>
                <select
                  value={newMember.cast}
                  onChange={(e) => handlecastChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500 transition duration-200"
                >
                  <option value="">{t("selectCast")}</option>
                  {castOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-400 px-4 py-2 rounded text-white hover:bg-gray-500 transition duration-200"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="bg-purple-600 px-4 py-2 rounded text-white hover:bg-purple-700 transition duration-200"
              >
                {isEditing ? t("update") : t("submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}