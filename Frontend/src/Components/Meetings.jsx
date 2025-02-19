import { useState, useRef } from "react";
import { Plus, X, Camera, MapPin } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link

const Meetings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false); // Loader State
  const [photo, setPhoto] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const videoRef = useRef(null);

  const committeeMembers = [
    { name: "Jayraj Kalsariya", role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष" },
    { name: "Mayur Wagh", role: "Parent Representative (पालक प्रतिनिधी) | सदस्य" },
    { name: "Nitin Dube", role: "Member" },
  ];

  const toggleModal = () => setIsOpen(!isOpen);

  const handleMemberChange = (member) => {
    if (!selectedMembers.find((m) => m.name === member.name)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const removeMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m.name !== member.name));
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true); // Start Loader
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
          alert("⚠️ Please enable location permissions.");
          setLoading(false); // Stop Loader on error
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("❌ Geolocation is not supported by this browser.");
    }
  };

  const getAddressFromGoogle = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${lat},${lon}&key=AlzaSyW1XwD8LsAfdMByNty5EViuSIOjCDsNWtg`
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        let formattedAddress = "";
        for (let result of data.results) {
          if (result.types.includes("street_address")) {
            formattedAddress = result.formatted_address;
            break;
          } else if (result.types.includes("route")) {
            formattedAddress = result.formatted_address;
          }
        }
        setAddress(formattedAddress || data.results[0].formatted_address);
      } else {
        setAddress("⚠️ Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("❌ Unable to fetch address");
    } finally {
      setLoading(false); // Stop Loader after fetching address
    }
  };

  const handleSubmit = () => {
    const newMeeting = {
      number: meetings.length + 1, // Assign a fixed number based on the length
      date,
      members: selectedMembers,
      address,
      photo,
    };
  
    setMeetings([...meetings, newMeeting]); // Add at the bottom so Meeting 1 stays on top
    toggleModal();
    setDate("");
    setSelectedMembers([]);
    setAddress("");
    setPhoto(null);
  };
  
  

  return (
    <div className="h-screen pt-1 flex flex-col relative mt-[60px]">
      <h2 className="text-4xl font-bold text-center">SMC Meetings</h2>

      <div className="mb-[400px] flex justify-start pl-4 pr-4 mr-[1200px]">
        <button 
          onClick={toggleModal} 
          className="flex items-center text-white bg-blue-950 pl-2 pr-2 rounded-[3px] pb-1 text-2xl"
        >
          <Plus className="mr-2" />
          New Meeting
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-950">Add Meeting</h3>
              <button onClick={toggleModal} className="text-gray-600 hover:text-red-600">
                <X size={24} />
              </button>
            </div>

            <label className="block text-blue-950 font-medium">Date:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <div className="flex flex-wrap gap-2 mb-3">
              {selectedMembers.map((member, index) => (
                <div key={index} className="flex items-center bg-purple-700 text-white px-3 py-1 rounded-full">
                  {member.name}
                  <button onClick={() => removeMember(member)} className="ml-2">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <label className="block text-blue-950 font-medium">Committee Members:</label>
            <div className="border border-gray-300 rounded p-2 max-h-40 overflow-y-auto">
              {committeeMembers.map((member, index) => (
                <div 
                  key={index} 
                  onClick={() => handleMemberChange(member)} 
                  className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                  {selectedMembers.find((m) => m.name === member.name) && <span className="text-purple-700 font-bold">✔</span>}
                </div>
              ))}
            </div>

            <button 
              className="w-full flex items-center justify-center bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 mt-3"
              onClick={getUserLocation}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="ml-2">Just a moment....</span>
                </div>
              ) : (
                <>
                  <MapPin className="mr-2" size={20} />
                  Auto-Detect Location
                </>
              )}
            </button>

            <label className="block text-blue-950 font-medium mt-3">Address:</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Enter meeting address" 
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            <button 
              className="w-full flex items-center justify-center bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700"
              onClick={() => document.getElementById("cameraInput").click()}
            >
              <Camera className="mr-2" size={20} />
              Take Meeting’s Photo
            </button>

            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              id="cameraInput"
              style={{ display: "none" }} 
              onChange={(e) => console.log("Captured image:", e.target.files[0])}
            />

            <button 
              className="w-full flex items-center justify-center bg-blue-950 text-white px-3 py-2 rounded-md hover:bg-blue-900 mt-3"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 space-y-6">
      {meetings.map((meeting, index) => (
  <Link to={`/home/meetings/tharav/${index}`} key={index}>
    <div className="flex items-center justify-between bg-white rounded-[30px] border-2 border-blue-950 p-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-6">
        <div className="text-lg font-semibold text-white bg-blue-950 rounded-[10px] pl-3 pr-3 absolute mb-[80px]">
          {meeting.date}
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Meeting No</div>
          <div className="text-xl font-bold text-gray-800">{meeting.number}</div> {/* Corrected numbering */}        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Member's</div>
          <div className="text-xl font-bold text-gray-800">{meeting.members.length}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600">Total Tharav</div>
          <div className="text-xl font-bold text-gray-800">-</div>
        </div>
      </div>
    </div>
  </Link>
))}

      </div>
    </div>
  );
};

export default Meetings;
