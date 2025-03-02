import { useState, useEffect, useRef } from "react";
import { Plus, X, Camera, Upload, CalendarPlus } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Tharav from "./Tharav";
import { useNavigate } from "react-router-dom"; // Import useNavigate


const Meetings = () => {

  const navigate = useNavigate(); // Use the navigate function
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
    // Convert the Date object to ISO string format for the backend
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
          id: item.member_id, // Use member_id instead of name
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
      const response = await axios.get("http://localhost:5000/api/meeting");
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
    event.stopPropagation(); // Stop event propagation
    setIsEditing(true);
    setEditingMeetingId(meeting.id);
    setDate(meeting.date);
    setLatitude(meeting.latitude);
    setLongitude(meeting.longitude);
    setAddress(meeting.address);
    setPhotoName(meeting.image_url);

// Set the photo URL to the full path of the image in the uploads folder
if (meeting.image_url) {
  if (meeting.image_url === "default.jpg") {
    setPhoto(null); // Reset photo for default image
  } else if (meeting.image_url.startsWith('http')) {
    setPhoto(meeting.image_url); // Use as-is if it's already a full URL
  } else {
    // Construct URL for images in the uploads folder
    setPhoto(`http://localhost:5000/uploads/${meeting.image_url}`);
  }
} else {
  setPhoto(null);
}

    // Map member IDs to their corresponding member objects
    const selectedMemberObjects = committeeMembers.filter((member) =>
      meeting.members.includes(member.id.toString())
    );
    setSelectedMembers(selectedMemberObjects);

    console.log("Editing meeting with members:", selectedMemberObjects); // Debug log
    setIsOpen(true);
  };

  const toggleModal = () => {
    if (!isOpen) {
      setIsEditing(false); // Reset editing state when opening the modal
      setEditingMeetingId(null); // Reset editing meeting ID
      resetForm(); // Reset the form fields
      detectLocation(); // Detect location for new meetings
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
          alert("Please enable location permissions");
          setLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser");
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
        setAddress("Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Unable to fetch address");
    } finally {
      setLoading(false);
    }
  };

  // Camera functions
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
      alert("Could not access camera. Please check permissions.");
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

      // Convert to data URL with selected format
      const imageDataURL = canvas.toDataURL(`image/${fileExtension}`);
      setPhoto(imageDataURL);

      // Create a unique filename based on date and meeting
      const timestamp = new Date()
        .toISOString()
        .replace(/:/g, "-")
        .split(".")[0];
      setPhotoName(
        `meeting_${meetingNumber || "new"}_${timestamp}.${fileExtension}`
      );

      // Stop camera after capturing
      stopCamera();
      setShowCamera(false);
    }
  };

  // Convert base64 to file for form submission
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
      alert("Please fill in all required fields");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("meeting_date", date);
    formData.append("latitude", latitude || "0.0000");
    formData.append("longitude", longitude || "0.0000");
    formData.append("address", address || "Unknown");
    formData.append("member_id", selectedMembers.map((m) => m.id).join(","));
    formData.append("selected_member_length", selectedMembers.length);

    // Add file if available
    if (document.getElementById("fileInput")?.files[0]) {
      formData.append("image", document.getElementById("fileInput").files[0]);
    } else if (photo && photo.startsWith("data:image")) {
      // Convert base64 data URL to file and append
      const imageFile = dataURLtoFile(photo, photoName);
      formData.append("image", imageFile);
    } else if (photoName) {
      formData.append("image_url", photoName);
    }

    // Add additional fields for new meetings
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
        // Update existing meeting
        response = await axios.put(
          `http://localhost:5000/api/meeting/${editingMeetingId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        // Create new meeting
        response = await axios.post(
          "http://localhost:5000/api/meeting",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // Increment meeting number after successful creation
        setMeetingNumber(meetingNumber + 1);
      }

      console.log("Meeting saved successfully:", response.data);
      await fetchMeetings(); // Refresh meetings
      resetForm();
      setIsEditing(false);
      setEditingMeetingId(null);
    } catch (error) {
      console.error("Error submitting meeting:", error.response?.data || error);
      alert("Failed to submit meeting");
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

    if (window.confirm("Are you sure you want to delete this meeting?")) {
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
        alert("Failed to delete meeting");
      }
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <h2 className="text-4xl font-bold text-center text-blue-950 realfont2">
        SMC Meetings
      </h2>

      <div className="flex justify-start">
        <button
          onClick={toggleModal}
          className="flex items-center gap-2 bg-blue-950 text-white px-2 py-2 rounded-md hover:bg-blue-900 transition-colors"
        >
          <CalendarPlus className="w-9 h-9" />
        
        </button>
      </div>

      {isOpen && (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] h-full">
          <div className="bg-white rounded-lg shadow-md shadow-blue-950 w-[500px] max-w-md h-[500px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-950">
                {isEditing ? "Edit Meeting" : "Add Meeting"}
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
                  Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="MMMM d, yyyy"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Select a date"
                  wrapperClassName="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Selected Members
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
                  Committee Members
                </label>
                <div className="border rounded-md h-32 overflow-y-auto">
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
                    Latitude
                  </label>
                  <div className="p-2 border rounded-md bg-gray-50 text-center">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      latitude
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-950">
                    Longitude
                  </label>
                  <div className="p-2 border rounded-md bg-gray-50 text-center">
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
                  Address
                </label>
                <input
                  value={address}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-950">
                  Upload or Take a Photo
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => document.getElementById("fileInput").click()}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Photo
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                    Take Photo
                  </button>
                </div>
                <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />

                {/* Display captured or selected photo */}
                {photo && !showCamera && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <img src={photo} alt="Selected" className="w-full" />
                    <div className="p-2 bg-gray-100 flex justify-between items-center">
                      <input
                        type="text"
                        value={photoName.split(".")[0]}
                        onChange={(e) =>
                          setPhotoName(`${e.target.value}.${fileExtension}`)
                        }
                        className="flex-1 px-2 py-1 border rounded text-sm"
                        placeholder="Enter filename"
                      />
                    </div>
                  </div>
                )}

                {/* Enhanced Camera UI */}
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
                          Cancel
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
              {isEditing ? "Update Meeting" : "Submit"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6 mt-[30px]">
        {meetings.map((meeting, index) => (
          <div
            key={meeting.no || index}
            className="relative flex items-center justify-between bg-white rounded-[20px] border-2 border-blue-950 p-2 cursor-pointer hover:shadow-md transition-shadow mb-9 w-2xl"
            onClick={() => {
              navigate(`/home/meetings/tharav/${index}`);            }}
          >
            <div className="flex items-center space-x-[90px]">
              <div className="text-lg font-semibold text-white bg-blue-950 rounded-[10px] pl-3 pr-3 absolute mb-[80px]">
                {meeting.date}
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Meeting No</div>
                <div className="text-xl font-bold text-gray-800">
                  {meeting.number}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Member's</div>
                <div className="text-xl font-bold text-gray-800">
                  {meeting.members?.length || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Tharav</div>
                <div className="text-xl font-bold text-gray-800">-</div>
              </div>
            </div>

            <button
              onClick={(e) => handleEditMeeting(meeting, e)}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              Edit
            </button>

            <button
              onClick={(event) => handleDeleteMeeting(meeting.id, event)}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Meetings;
