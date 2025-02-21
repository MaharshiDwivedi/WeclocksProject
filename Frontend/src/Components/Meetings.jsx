import { useState, useEffect } from "react";
import { Plus, X, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios"; 



const Meetings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [meetingNumber, setMeetingNumber] = useState(1); // Initial meeting number



  useEffect(() => {
    fetchCommitteeMembers();
    fetchMeetings(); 
  }, []);

  const fetchCommitteeMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/member");
      const data = await response.json();
      const filteredMembers = data.map((item) => {
        const recordData = item.member_record ? item.member_record.split("|") : [];
        return {
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
      }));
      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };











  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      detectLocation();
    }
  };

  const handleMemberChange = (member) => {
    if (!selectedMembers.find((m) => m.name === member.name)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const removeMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m.name !== member.name));
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
    }
  };

  const handleSubmit = async () => {
  if (!date || selectedMembers.length === 0) {
    alert("Please fill in all required fields");
    return;
  }

  const newMeeting = {
    meeting_number: meetingNumber, // Use meetingNumber here
    school_id: localStorage.getItem("school_id") || "",
    user_id: localStorage.getItem("user_id") || "",
    meeting_date: date,
    selected_member_length: selectedMembers.length,
    image_url: photo || "default.jpg",
    latitude: latitude || "0.0000",
    longitude: longitude || "0.0000",
    address: address || "Unknown",
    created_at: new Date().toISOString().replace("T", " ").split(".")[0],
    updated_at: null,
    member_id: selectedMembers.map((m) => m.name).join(","),
  };

  console.log("Sending new meeting data:", newMeeting); // Debugging log

  try {
    const response = await axios.post("http://localhost:5000/api/meeting", newMeeting, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Meeting created successfully:", response.data); // Debugging log

    // Refetch meetings to ensure the state is up-to-date
    await fetchMeetings();

    // Increment the meeting number for the next meeting
    setMeetingNumber(meetingNumber + 1);

    // Reset the form
    resetForm();
  } catch (error) {
    console.error("Error creating meeting:", error);
    alert("Failed to create meeting");
  }
};


  const resetForm = () => {
    setIsOpen(false);
    setDate("");
    setSelectedMembers([]);
    setLatitude(null);
    setLongitude(null);
    setAddress("");
    setPhoto(null);
  };


  const handleDeleteMeeting = async (meetingId, event) => {
    event.stopPropagation(); // Stop event propagation
  
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      try {
        console.log("Deleting meeting with ID:", meetingId); // Debugging log
  
        const response = await axios.delete(`http://localhost:5000/api/meeting/${meetingId}`);
        console.log("Backend response:", response.data); // Debugging log
  
        if (response.data.error) {
          alert(response.data.error); // Show error message from backend
          return;
        }
  
        // Update the meetings state to remove the deleted meeting
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
      <h2 className="text-4xl font-bold text-center text-blue-950">SMC Meetings</h2>

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
        <h3 className="text-xl font-bold text-blue-950">Add Meeting</h3>
        <button
          onClick={toggleModal}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Date Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-950">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selected Members */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-950">Selected Members</label>
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

        {/* Committee Members */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-950">Committee Members</label>
          <div className="border rounded-md h-32 overflow-y-auto">
            {committeeMembers.map((member, index) => (
              <div
                key={index}
                onClick={() => handleMemberChange(member)}
                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.representative}</p>
                  <p className="text-sm text-gray-600">{member.designation}</p>
                </div>
                {selectedMembers.find((m) => m.name === member.name) && (
                  <span className="text-purple-700">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-950">Latitude</label>
            <div className="p-2 border rounded-md bg-gray-50 text-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                latitude
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-950">Longitude</label>
            <div className="p-2 border rounded-md bg-gray-50 text-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                longitude
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-950">Address</label>
          <input
            value={address}
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
          />
        </div>

        {/* Take Photo */}
        <div className="space-y-2">
          <button
            onClick={() => document.getElementById("cameraInput").click()}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Take Meeting's Photo
          </button>
          <input
            type="file"
            id="cameraInput"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {photo && (
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
              <img src={photo} alt="Meeting" className="w-full rounded-md" />
            </div>
          )}
        </div>
      </div>

      {/* Submit Button (Fixed at Bottom) */}
        <button 
          onClick={handleSubmit}
          className=" p-4 border-t w-full bg-blue-900 text-white px-4 py-2 rounded-b-md hover:bg-blue-950 cursor-pointer transition-colors"
        >
          Submit
        </button>
    </div>
  </div>
)}


<div className="space-y-6 mt-[30px]">
  {meetings && meetings.map((meeting, index) => (
    <div
      key={meeting.id || index}
      className="relative flex items-center justify-between bg-white rounded-[20px] border-2 border-blue-950 p-2 cursor-pointer hover:shadow-md transition-shadow mb-9 w-2xl"
      onClick={() => {
        // Navigate to the meeting details page (if needed)
        window.location.href = `/home/meetings/tharav/${index}`;
      }}
    >
      <div className="flex items-center space-x-[90px]">
        <div className="text-lg font-semibold text-white bg-blue-950 rounded-[10px] pl-3 pr-3 absolute mb-[80px]">
          {meeting.date}
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Meeting No</div>
          <div className="text-xl font-bold text-gray-800">{meeting.number}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Member's</div>
          <div className="text-xl font-bold text-gray-800">{meeting.members?.length || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Total Tharav</div>
          <div className="text-xl font-bold text-gray-800">-</div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={(event) => {
          event.stopPropagation(); // Stop event propagation
          handleDeleteMeeting(meeting.id, event); // Pass event here
        }}
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