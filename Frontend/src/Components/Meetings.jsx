import { useState, useEffect } from "react";
import { Plus, X, Camera, Upload } from "lucide-react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Meetings = () => {
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

  useEffect(() => {
    fetchCommitteeMembers();
    fetchMeetings();
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
    setDate(date.toISOString().split('T')[0]);
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

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      setPhotoName(file.name);
    }
  };

  const handleSubmit = async () => {
    if (!date || selectedMembers.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
  
    // Ensure member_id is a comma-separated string of member IDs
    const memberIds = selectedMembers.map((m) => m.id).join(",");
  
    const meetingData = {
      meeting_date: date,
      image_url: photoName,
      latitude: latitude || "0.0000",
      longitude: longitude || "0.0000",
      address: address || "Unknown",
      member_id: memberIds, // Ensure member_id is included
      selected_member_length: selectedMembers.length, // Update member length
    };
  
    try {
      let response;
  
      if (isEditing) {
        // Update the meeting with the edited data
        response = await axios.put(
          `http://localhost:5000/api/meeting/${editingMeetingId}`,
          meetingData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Meeting updated successfully:", response.data);
      } else {
        // Create a new meeting
        meetingData.meeting_number = meetingNumber;
        meetingData.school_id = localStorage.getItem("school_id") || "";
        meetingData.user_id = localStorage.getItem("user_id") || "";
        meetingData.created_at = new Date()
          .toISOString()
          .replace("T", " ")
          .split(".")[0];
        meetingData.updated_at = "0000-00-00 00:00:00"; // Default value for new meetings
  
        response = await axios.post(
          "http://localhost:5000/api/meeting",
          meetingData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Meeting created successfully:", response.data);
        setMeetingNumber(meetingNumber + 1);
      }
  
      await fetchMeetings(); // Refresh the meeting list
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
      <h2 className="text-4xl font-bold text-center text-blue-950">
        SMC Meetings
      </h2>

      <div className="flex justify-start">
        <button
          onClick={toggleModal}
          className="flex items-center gap-2 bg-blue-950 text-white px-4 py-2 rounded-md hover:bg-blue-900 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Meeting
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
                    onClick={() =>
                      document.getElementById("cameraInput").click()
                    }
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
                <input
                  type="file"
                  id="cameraInput"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {photo && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <img src={photo} alt="Selected" className="w-full" />
                    <p className="text-center text-sm text-gray-600">
                      {photoName}
                    </p>
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
            key={meeting.id || index}
            className="relative flex items-center justify-between bg-white rounded-[20px] border-2 border-blue-950 p-2 cursor-pointer hover:shadow-md transition-shadow mb-9 w-2xl"
            onClick={() => {
              window.location.href = `/home/meetings/tharav/${index}`;
            }}
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