import { useState, useRef } from "react";
import { Plus, X, Camera } from "lucide-react";

const Meetings = () => {
  const [isOpen, setIsOpen] = useState(false); // Controls modal visibility
  const [selectedMembers, setSelectedMembers] = useState([]); // Stores selected members
  const [date, setDate] = useState(""); // Stores date input
  const [address, setAddress] = useState(""); // Stores address input
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState(null);
  const videoRef = useRef(null);

  const committeeMembers = [
    { name: "Jayraj Kalsariya", role: "Principal Ex (प्राचार्य माजी) | अध्यक्ष" },
    { name: "Mayur Wagh", role: "Parent Representative (पालक प्रतिनिधी) | सदस्य" },
    { name: "Nitin Dube", role: "Member" },
  ]; // Example names with roles

  // Toggle modal
  const toggleModal = () => setIsOpen(!isOpen);

  // Handle member selection
  const handleMemberChange = (member) => {
    if (!selectedMembers.find((m) => m.name === member.name)) {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  // Remove selected member
  const removeMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m.name !== member.name));
  };

  // Open Camera
  const openCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Unable to access camera. Please allow camera permissions.");
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL("image/png")); // Convert to Base64 image
    setShowCamera(false);
  };

  return (
    <div className="h-screen pt-1 flex flex-col relative mt-[60px]">
      <h2 className="text-4xl font-bold text-center">SMC Meetings</h2>

      {/* New Meeting Button */}
      <div className="mb-[400px] flex justify-start pl-4 pr-4 mr-[1200px]">
        <button 
          onClick={toggleModal} 
          className="flex items-center text-white bg-blue-950 pl-2 pr-2 rounded-[3px] pb-1 text-2xl"
        >
          <Plus className="mr-2" />
          New Meeting
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent">
          <div className="bg-white p-6 rounded-lg border-blue-950 shadow-2xl w-[600px]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-950">Add Meeting</h3>
              <button onClick={toggleModal} className="text-gray-600 hover:text-red-600">
                <X size={24} />
              </button>
            </div>

            {/* Date Field */}
            <label className="block text-blue-950 font-medium">Date:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            {/* Selected Committee Members as Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedMembers.map((member, index) => (
                <div key={index} className="flex items-center bg-blue-700 text-white px-3 py-1 rounded-full">
                  {member.name}
                  <button onClick={() => removeMember(member)} className="ml-2">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Committee Members Dropdown */}
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

            {/* Address Field */}
            <label className="block text-blue-950 font-medium mt-3">Address:</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Enter meeting address" 
              className="w-full p-2 border border-gray-300 rounded mb-3"
            />

            {/* Take Picture Button */}
            <button 
              className="w-full flex items-center justify-center bg-blue-950 text-white px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={openCamera} // Opens camera
            >
              <Camera className="mr-2" size={20} />
              Take Meeting’s Photo
            </button>

            {/* Camera Preview */}
            {showCamera && (
              <div className="mt-3">
                <video ref={videoRef} autoPlay className="w-full h-48"></video>
                <button 
                  className="mt-2 bg-green-500 text-white px-3 py-2 rounded-md"
                  onClick={capturePhoto}
                >
                  Capture Photo
                </button>
              </div>
            )}

            {/* Display Captured Photo */}
            {photo && (
              <div className="mt-3">
                <p className="text-sm font-semibold">Captured Image:</p>
                <img src={photo} alt="Captured" className="mt-2 w-full rounded-md" />
              </div>
            )}

            {/* Submit Button */}
            <button className="w-full bg-blue-950 text-white py-2 rounded-md mt-3">
              Submit Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;

