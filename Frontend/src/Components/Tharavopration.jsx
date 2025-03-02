import { useEffect, useState } from "react";
import { Menu } from "@headlessui/react";
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import WebcamCapture from "./WebcamCapture";


export default function Tharavopration() {
  const API_URL = "http://localhost:5000/api/tharav";
  const API_URL_Purpose = "http://localhost:5000/api/purpose";
  const SERVER_URL = "http://localhost:5000";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNirnayId, setCurrentNirnayId] = useState(null);
  const [insertdate, setInsertdate] = useState("");
  const [nirnay, setNirnay] = useState([]);
  const [purpose, setpurpose] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  const [tharav, setTharav] = useState({
    tharavNo: "",
    purpose: "",
    problemFounded: "",
    where: "",
    what: "",
    howMany: "",
    deadStockNumber: "",
    decisionTaken: "",
    expectedExpenditure: "",
    fixedDate: "",
    photo: "",
  });

  useEffect(() => {
    fetchTharavs();
    fetchMembers();
  }, []);

  const fetchTharavs = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setNirnay(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching Tharavs:", error);
      setNirnay([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(API_URL_Purpose);
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      console.log("Fetched Members:", data);
      setpurpose(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching members:", error);
      setpurpose([]);
    }
  };

  const handleEdit = (nirnay) => {
    const recordData = nirnay.nirnay_reord.split("|");
    setInsertdate(recordData[8]);

    // Set preview image if photo exists
    if (recordData[4]) {
      setPreviewImage(`${SERVER_URL}${recordData[4]}`);
    } else {
      setPreviewImage(null);
    }

    setTharav({
      tharavNo: recordData[1] || "",
      decisionTaken: recordData[2] || "",
      expectedExpenditure: recordData[3] || "",
      photo: recordData[4] || "",
      purpose: recordData[11] || "",
      problemFounded: recordData[12] || "",
      where: recordData[13] || "",
      what: recordData[14] || "",
      howMany: recordData[15] || "",
      deadStockNumber: recordData[16] || "",
      fixedDate: recordData[17] || "",
    });
    setCurrentNirnayId(nirnay.nirnay_id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this nirnay?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete nirnay");
      fetchTharavs();
    } catch (error) {
      console.error("Error deleting nirnay:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
      2,
      "0"
    )} ${String(currentDate.getHours()).padStart(2, "0")}:${String(
      currentDate.getMinutes()
    ).padStart(2, "0")}:${String(currentDate.getSeconds()).padStart(2, "0")}`;

    // Use the existing photo path if we're editing and no new file was selected
    const photoValue =
      tharav.photo instanceof File ? tharav.photo.name : tharav.photo;

    const memberData = `1|${tharav.tharavNo}|${tharav.decisionTaken}|${
      tharav.expectedExpenditure
    }|${photoValue}|14|34|Pending|${
      !isEditing ? formattedDate : insertdate
    }|${formattedDate}|0000-00-00 00:00:00|${tharav.purpose}|${
      tharav.problemFounded
    }|${tharav.where}|${tharav.what}|${tharav.howMany}|${
      tharav.deadStockNumber
    }|${tharav.fixedDate}`;

    const formData = new FormData();
    formData.append("nirnay_reord", memberData);

    // Append the file if it exists and is a File object
    if (tharav.photo instanceof File) {
      formData.append("photo", tharav.photo);
    }

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentNirnayId}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save nirnay");
      closeModal();
      fetchTharavs();
    } catch (error) {
      console.error("Error saving member:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setTharav({
      tharavNo: "",
      purpose: "",
      problemFounded: "",
      where: "",
      what: "",
      howMany: "",
      deadStockNumber: "",
      decisionTaken: "",
      expectedExpenditure: "",
      fixedDate: "",
      photo: "",
    });
    setPreviewImage(null);
    setCurrentNirnayId(null);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    setPreviewImage(null);
    setTharav({
      tharavNo: "",
      purpose: "",
      problemFounded: "",
      where: "",
      what: "",
      howMany: "",
      deadStockNumber: "",
      decisionTaken: "",
      expectedExpenditure: "",
      fixedDate: "",
      photo: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTharav((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      setTharav((prev) => ({
        ...prev,
        photo: file, // Store the File object
      }));
    }
  };

  // Modified WebcamCapture handling
  const handleWebcamCapture = (capturedImage) => {
    // Convert base64 to file object
    if (capturedImage) {
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `webcam_capture_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          setTharav((prev) => ({
            ...prev,
            photo: file,
          }));
          setPreviewImage(capturedImage);
        });
    }
  };

  return (
    <div className="p-4 w-full container mx-auto">
      <div className="bg-purple-600 text-white text-xl font-bold p-4 text-center rounded-t-md shadow-md">
        <span>Tharavs</span>
      </div>
      <div className="flex justify-end p-4">
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md"
        >
          + ADD THARAV
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tharav No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Problem Founded
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                How Many
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                What
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Where
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Expected Expense
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Decision Taken
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Dead Stock Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Fixed Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {nirnay.map((item) => {
              const recordData = item.nirnay_reord
                ? item.nirnay_reord.split("|")
                : [];
              return (
                <tr
                  key={item.nirnay_id}
                  className="hover:bg-gray-50 transition duration-150"
                >
              {[1, 12, 11, 15, 14, 13, 3, 2, 16, 17, 4].map((index) => (
                    <td key={index} className="px-6 py-4 whitespace-nowrap">
                      {index === 4 ? (
                        recordData[4] ? (
                          <img
                            src={`${SERVER_URL}${recordData[4]}`}
                            alt="Tharav Photo"
                            className="w-16 h-16 object-cover rounded-md border shadow"
                          />
                        ) : (
                          <div className="text-sm text-gray-500">No image</div>
                        )
                      ) : index === 11 ? (
                        <div className="text-sm text-gray-900">
                          {purpose.filter(
                            (data) => data.head_id == recordData[index]
                          ).map((datas)=>datas.head_name || "N/A")}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900">
                          {recordData[index] || "N/A"}
                        </div>
                      )}
                    </td>
                  ))}

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="text-gray-500 hover:text-purple-600 focus:outline-none">
                        <FaEllipsisV size={18} />
                      </Menu.Button>
                      <Menu.Items className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border border-gray-200 py-1 z-10">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleEdit(item)}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              } text-purple-600 hover:bg-purple-50`}
                            >
                              <FaEdit className="mr-2" /> Edit
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDelete(item.nirnay_id)}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                active ? "bg-gray-100" : ""
                              } text-red-600 hover:bg-red-50`}
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
      </div>
      {nirnay.length === 0 && (
        <div className="bg-white p-8 text-center rounded-lg shadow-md mt-4">
          <p className="text-gray-500">No Tharavs found</p>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 overflow-y-auto z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl transition-transform transform mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center text-purple-600">
                {isEditing ? "Edit Tharav" : "Add Tharav"}
              </h2>
              <div className="border-b w-full border-purple-300 mb-5"></div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 max-h-[70vh] overflow-y-auto px-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Tharav No.
                    </label>
                    <input
                      type="text"
                      name="tharavNo"
                      placeholder="Tharav No"
                      value={tharav.tharavNo}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Purpose
                    </label>
                    <select
                      name="purpose"
                      id=""
                      value={tharav.purpose}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Purpose</option>
                      {purpose.map((data) => (
                        <option key={data.head_id} value={data.head_id}>
                          {data.head_name}
                        </option>
                      ))}
                    </select>
                  </div>

 
                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Problem Founded
                    </label>
                    <input
                      type="text"
                      name="problemFounded"
                      placeholder="Problem Founded"
                      value={tharav.problemFounded}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Where
                    </label>
                    <input
                      type="text"
                      name="where"
                      placeholder="Where"
                      value={tharav.where}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      What
                    </label>
                    <input
                      type="text"
                      name="what"
                      placeholder="What"
                      value={tharav.what}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      How Many
                    </label>
                    <input
                      type="text"
                      name="howMany"
                      placeholder="How Many"
                      value={tharav.howMany}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Dead Stock Number
                    </label>
                    <input
                      type="text"
                      name="deadStockNumber"
                      placeholder="Dead Stock Number"
                      value={tharav.deadStockNumber}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Decision Taken
                    </label>
                    <input
                      type="text"
                      name="decisionTaken"
                      placeholder="Decision Taken"
                      value={tharav.decisionTaken}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Expected Expenditure
                    </label>
                    <input
                      type="number"
                      name="expectedExpenditure"
                      placeholder="Expected Expenditure"
                      value={tharav.expectedExpenditure}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      required
                    />
                  </div>

                  <div className="mb-1">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Fixed Date
                    </label>
                    <input
                      type="date"
                      name="fixedDate"
                      value={tharav.fixedDate}
                      onChange={handleInputChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Photo
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">
                        Upload Image
                      </h4>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full p-2 rounded-md border border-gray-300 bg-white"
                      />
                    </div>
                    <div className="border rounded-md p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">
                     
                      </h4>
                      <WebcamCapture onCapture={handleWebcamCapture} />
                    </div>
                  </div>

                  {/* Image Preview */}
                  {previewImage && (
                    <div className="mt-4 p-3 border rounded-md bg-gray-50">
                      <h4 className="text-sm font-medium mb-2 text-gray-700">
                        Image Preview:
                      </h4>
                      <div className="flex justify-center">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-40 object-contain rounded-md border shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-400 px-5 py-2 rounded-md text-white hover:bg-gray-500 transition duration-200 shadow"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 px-5 py-2 rounded-md text-white hover:bg-purple-700 transition duration-200 shadow"
                  >
                    {isEditing ? "Update" : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
