// Meetings.jsx
import { useState, useEffect, useRef } from "react";
import { Plus, X, Camera, Upload, CalendarPlus, Pencil, Trash2, ChevronRight } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; 

const Meetings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoName, setPhotoName] = useState("default.jpg");
  const [meetings, setMeetings] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [editingMeetingId, setEditingMeetingId] = useState(null);

  // Camera functionality
  const [showCamera, setShowCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [fileExtension, setFileExtension] = useState("jpeg");

  useEffect(() => {
    fetchCommitteeMembers();
    fetchMeetings();
  }, []);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Convert string date to Date object for the DatePicker when editing
  useEffect(() => {
    if (date) {
      setSelectedDate(new Date(date));
    }
  }, [date]);

  // Handle date change from the DatePicker
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDate(date.toISOString().split("T")[0]);
  };

  const fetchCommitteeMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/member");
      const data = await response.json();
      const filteredMembers = data.map((item) => {
        const recordData = item.member_record
          ? item.member_record.split("|")
          : [];
        return {
          id: item.member_id,
          name: recordData[0] || "N/A",
          representative: recordData[2] || "N/A",
          designation: recordData[8] || "N/A",
        };
      });
      setCommitteeMembers(filteredMembers);
    } catch (error) {
      console.error("Error fetching committee members:", error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const SchoolId = localStorage.getItem("school_id");
      if (!SchoolId) {
        console.error("School ID not found in local storage");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/meeting?school_id=${SchoolId}`);

      const meetingsData = response.data.map((meeting) => ({
        id: meeting.meeting_id,
        date: meeting.meeting_date,
        number: meeting.meeting_number,
        members: meeting.member_id ? meeting.member_id.split(",") : [],
        latitude: meeting.latitude,
        longitude: meeting.longitude,
        address: meeting.address,
        image_url: meeting.image_url,
        member_id: meeting.member_id,
      }));

      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleEditMeeting = (meeting, event) => {
    event.stopPropagation();
    setIsEditing(true);
    setEditingMeetingId(meeting.id);
    setDate(meeting.date);
    setLatitude(meeting.latitude);
    setLongitude(meeting.longitude);
    setAddress(meeting.address);
    setPhotoName(meeting.image_url);

    if (meeting.image_url) {
      if (meeting.image_url === "default.jpg") {
        setPhoto(null);
      } else if (meeting.image_url.startsWith('http')) {
        setPhoto(meeting.image_url);
      } else {
        setPhoto(`http://localhost:5000/uploads/${meeting.image_url}`);
      }
    } else {
      setPhoto(null);
    }

    const selectedMemberObjects = committeeMembers.filter((member) =>
      meeting.members.includes(member.id.toString())
    );
    setSelectedMembers(selectedMemberObjects);

    console.log("Editing meeting with members:", selectedMemberObjects);
    setIsOpen(true);
  };

  const toggleModal = () => {
    if (!isOpen) {
      setIsEditing(false);
      setEditingMeetingId(null);
      resetForm();
      detectLocation();
    }
    setIsOpen(!isOpen);
  };

  const handleMemberChange = (member) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const removeMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id));
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lon);
          getAddressFromGoogle(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(t("geolocationError")); // Translated error message
          setLoading(false);
        }
      );
    } else {
      alert(t("geolocationNotSupported")); // Translated error message
    }
  };

  const getAddressFromGoogle = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${lat},${lon}&key=AlzaSytrcKULEwn4WVVQDuh6EIZfjdXfq7GCHtH`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress(t("addressNotFound")); // Translated error message
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress(t("addressFetchError")); // Translated error message
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert(t("cameraAccessError")); // Translated error message
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageDataURL = canvas.toDataURL(`image/${fileExtension}`);
      setPhoto(imageDataURL);

      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .split(".")[0];
      setPhotoName(
        `meeting_${meetingNumber || "new"}_${timestamp}.${fileExtension}`
      );

      stopCamera();
      setShowCamera(false);
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
      setPhotoName(file.name);
    }
  };

  const toggleCamera = () => {
    setShowCamera(!showCamera);
    if (!showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const handleSubmit = async () => {
    if (!date || selectedMembers.length === 0) {
      alert(t("requiredFieldsError")); // Translated error message
      return;
    }

    const formData = new FormData();
    formData.append("meeting_date", date);
    formData.append("latitude", latitude || "0.0000");
    formData.append("longitude", longitude || "0.0000");
    formData.append("address", address || t("unknown")); // Translated default value
    formData.append("member_id", selectedMembers.map((m) => m.id).join(","));
    formData.append("selected_member_length", selectedMembers.length);

    if (document.getElementById("fileInput")?.files[0]) {
      formData.append("image", document.getElementById("fileInput").files[0]);
    } else if (photo && photo.startsWith("data:image")) {
      const imageFile = dataURLtoFile(photo, photoName);
      formData.append("image", imageFile);
    } else if (photoName) {
      formData.append("image_url", photoName);
    }

    if (!isEditing) {
      formData.append("meeting_number", meetingNumber);
      formData.append("school_id", localStorage.getItem("school_id") || "");
      formData.append("user_id", localStorage.getItem("user_id") || "");
      formData.append(
        "created_at",
        new Date().toISOString().replace("T", " ").split(".")[0]
      );
      formData.append("updated_at", "0000-00-00 00:00:00");
    }

    try {
      let response;

      if (isEditing) {
        response = await axios.put(
          `http://localhost:5000/api/meeting/${editingMeetingId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axios.post(
          "http://localhost:5000/api/meeting",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setMeetingNumber(meetingNumber + 1);
      }

      console.log("Meeting saved successfully:", response.data);
      await fetchMeetings();
      resetForm();
      setIsEditing(false);
      setEditingMeetingId(null);
    } catch (error) {
      console.error("Error submitting meeting:", error.response?.data || error);
      alert(t("submitError")); // Translated error message
    }
  };

  const resetForm = () => {
    setIsOpen(false);
    setDate("");
    setSelectedDate(null);
    setSelectedMembers([]);
    setLatitude(null);
    setLongitude(null);
    setAddress("");
    setPhoto(null);
    setPhotoName("default.jpg");
    setShowCamera(false);
    stopCamera();
  };

  const handleDeleteMeeting = async (meetingId, event) => {
    event.stopPropagation();

    if (window.confirm(t("confirmDeleteMeeting"))) { // Translated confirmation message
      try {
        const response = await axios.delete(
          `http://localhost:5000/api/meeting/${meetingId}`
        );
        console.log("Backend response:", response.data);

        setMeetings((prevMeetings) =>
          prevMeetings.filter((meeting) => meeting.id !== meetingId)
        );
      } catch (error) {
        console.error("Error deleting meeting:", error);
        alert(t("deleteError")); // Translated error message
      }
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-4xl font-bold text-center text-blue-950 realfont2">
        {t("smcMeetings")}
      </h2>

      <div className="flex justify-start">
        <button
          onClick={toggleModal}
          className="flex items-center gap-2 bg-blue-950 text-white px-2 py-2 rounded-md hover:bg-blue-900 transition-colors"
        >
          <CalendarPlus className="w-9 h-9" />
          <span>{t("addMeeting")}</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] h-full realfont">
          <div className="bg-white rounded-lg shadow-md shadow-blue-950 w-[500px] max-w-md h-[500px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-950">
                {isEditing ? t("editMeeting") : t("addMeeting")}
              </h3>
              <button
                onClick={toggleModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  {t("date")}
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  className="w-full px-3 py-2 shadow-lg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText={t("selectDate")} // Translated placeholder
                  wrapperClassName="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  {t("selectedMembers")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 bg-purple-700 text-white px-3 py-1 rounded-full text-sm"
                    >
                      {member.name}
                      <button
                        onClick={() => removeMember(member)}
                        className="hover:text-gray-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  {t("committeeMembersLabel")}
                </label>
                <div className=" shadow-lg rounded-md h-32 overflow-y-auto">
                  {committeeMembers.map((member, index) => (
                    <div
                      key={index}
                      onClick={() => handleMemberChange(member)}
                      className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-600">
                          {member.representative}
                        </p>
                        <p className="text-sm text-gray-600">
                          {member.designation}
                        </p>
                      </div>
                      {selectedMembers.find((m) => m.id === member.id) && (
                        <span className="text-purple-700">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-950">
                    {t("latitude")}
                  </label>
                  <div className="p-2 shadow-lg rounded-md bg-gray-50 text-center">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      latitude
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-950">
                    {t("longitude")}
                  </label>
                  <div className="p-2 shadow-lg rounded-md bg-gray-50 text-center">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      longitude
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  {t("address")}
                </label>
                <input
                  value={address}
                  readOnly
                  className="w-full px-3 py-2 shadow-lg rounded-md bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  {t("uploadOrTakePhoto")}
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => document.getElementById("fileInput").click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    {t("uploadPhoto")}
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    {t("takePhoto")}
                  </button>
                </div>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {photo && !showCamera && (
                  <div className="mt-2 shadow-lg rounded-md overflow-hidden">
                    <img src={photo} alt={t("selectedPhoto")} className="w-full" />
                    <div className="p-2 bg-gray-100 flex justify-between items-center">
                      <input
                        type="text"
                        value={photoName.split(".")[0]}
                        onChange={(e) =>
                          setPhotoName(`${e.target.value}.${fileExtension}`)
                        }
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        placeholder={t("enterFilename")} // Translated placeholder
                      />
                    </div>
                  </div>
                )}

                {showCamera && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <div className="relative w-full bg-black aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
                        <select
                          value={fileExtension}
                          onChange={(e) => setFileExtension(e.target.value)}
                          className="px-2 py-1 text-sm rounded bg-gray-800 text-white border border-gray-700"
                        >
                          <option value="jpeg">JPEG</option>
                          <option value="png">PNG</option>
                          <option value="webp">WebP</option>
                        </select>

                        <button
                          onClick={capturePhoto}
                          className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
                        >
                          <div className="w-10 h-10 rounded-full border-2 border-white"></div>
                        </button>

                        <button
                          onClick={toggleCamera}
                          className="px-2 py-1 bg-gray-700 text-white rounded"
                        >
                          {t("cancel")}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="p-4 border-t w-full bg-blue-900 text-white px-4 py-2 rounded-b-md hover:bg-blue-950 cursor-pointer transition-colors"
            >
              {isEditing ? t("updateMeeting") : t("submit")}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 mt-8">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() => navigate(`/home/meetings/tharav/${meeting.number}`, { state: { meetingId: meeting.id, meetingNumber: meeting.number } })}
            className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-[700px]"
          >
            <div className="absolute top-0 left-6 px-4 py-1 bg-blue-950 text-white text-sm font-medium rounded-b-lg shadow-sm transform transition-transform group-hover:translate-y-0.5">
              {meeting.date}
            </div>

            <div className="pt-8 pb-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-12 py-2">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-1">{t("meetingNo")}</div>
                    <div className="text-2xl font-bold text-blue-950">{meeting.number}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-1">{t("members")}</div>
                    <div className="text-2xl font-bold text-blue-950">{meeting.members?.length || 0}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-1">{t("totalTharav")}</div>
                    <div className="text-2xl font-bold text-blue-950">-</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleEditMeeting(meeting, e)}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 text-blue-950 hover:bg-blue-200 transition-colors"
                    aria-label={t("editMeeting")}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteMeeting(meeting.id, e)}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    aria-label={t("deleteMeeting")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Meetings;