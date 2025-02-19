import { useState, useRef, useEffect } from "react";
import { Plus, X, Camera } from "lucide-react";
import { Link } from "react-router-dom"; // Import Link

const Meetings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(true); // Loader starts when popup opens
  const [photo, setPhoto] = useState(null);
  const [meetings, setMeetings] = useState([]); // Store meetings in a list
  const videoRef = useRef(null);

  const committeeMembers = [
    { name: "Jayraj Kalsariya", role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष" },
    { name: "Mayur Wagh", role: "Parent Representative (पालक प्रतिनिधी) | सदस्य" },
    { name: "Nitin Dube", role: "Member" },
  ];

  const toggleModal = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      detectLocation(); // Auto-detect location when the popup opens
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
          alert("⚠️ Please enable location permissions.");
          setLoading(false);
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
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress("⚠️ Address not found");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("❌ Unable to fetch address");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const newMeeting = {
      number: meetings.length + 1, // Assign a fixed number based on the length
      date,
      members: selectedMembers,
      latitude,
      longitude,
      address,
      photo,
    };

    setMeetings([newMeeting, ...meetings]); // Add new meeting at the **TOP** of the list
    toggleModal();
    setDate("");
    setSelectedMembers([]);
    setLatitude(null);
    setLongitude(null);
    setAddress("");
    setPhoto(null);
  };

  return (
    <>
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

            {/* Committee Members List */}
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

            {/* Latitude & Longitude Fields with Loaders */}
            <div className="flex space-x-2 mt-3">
              <div className="w-1/2">
                <label className="block text-blue-950 font-medium">Latitude:</label>
                <div className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-center">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-950 mx-auto"></div> : latitude}
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-blue-950 font-medium">Longitude:</label>
                <div className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-center">
                  {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-950 mx-auto"></div> : longitude}
                </div>
              </div>
            </div>

            <label className="block text-blue-950 font-medium mt-3">Address:</label>
            <input type="text" value={address} readOnly className="w-full p-2 border border-gray-300 rounded mb-3" />

            <button
              className="w-full flex items-center justify-center bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700"
              onClick={() => document.getElementById("cameraInput").click()}
            >
              <Camera className="mr-2" size={20} />
              Take Meeting’s Photo
            </button>

            <input type="file" accept="image/*" capture="environment" id="cameraInput" style={{ display: "none" }} />

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

    </>
  );
};

export default Meetings;
