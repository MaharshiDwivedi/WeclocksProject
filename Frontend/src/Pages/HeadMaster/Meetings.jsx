// Meetings.jsx
import { useState, useEffect, useRef } from "react"
import { X, Camera, Upload, Plus, AlertCircle } from "lucide-react"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Swal from 'sweetalert2'
import SkeletonLoader from "../../Components/Layout/SkeletonLoader";


const Meetings = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [date, setDate] = useState("")
  const [selectedDate, setSelectedDate] = useState(null)
  const [address, setAddress] = useState("")
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoName, setPhotoName] = useState("default.jpg")
  const [meetings, setMeetings] = useState([])
  const [committeeMembers, setCommitteeMembers] = useState([])
  const [meetingNumber, setMeetingNumber] = useState(1)
  const [editingMeetingId, setEditingMeetingId] = useState(null)
  const modalRef = useRef(null);
  const [errors, setErrors] = useState({
    date: "",
    members: "",
    photo: ""
  });
  const [isCheckingMeeting, setIsCheckingMeeting] = useState(false);
  

  // Camera functionality
  const [showCamera, setShowCamera] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [fileExtension, setFileExtension] = useState("jpeg")

  useEffect(() => {
    fetchCommitteeMembers()
    fetchMeetings()
  }, [])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  // Convert string date to Date object for the DatePicker when editing
  useEffect(() => {
    if (date) {
      setSelectedDate(new Date(date))
    }
  }, [date])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        toggleModal();
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle date change from the DatePicker
  const handleDateChange = (date) => {
    setSelectedDate(date)
    setDate(date.toISOString().split("T")[0])
  }

  const fetchCommitteeMembers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/member")
      const data = await response.json()
      const filteredMembers = data.map((item) => {
        const recordData = item.member_record ? item.member_record.split("|") : []
        return {
          id: item.member_id,
          name: recordData[0] || "N/A",
          representative: recordData[2] || "N/A",
          designation: recordData[8] || "N/A",
        }
      })
      setCommitteeMembers(filteredMembers)
    } catch (error) {
      console.error("Error fetching committee members:", error)
    }
  }

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      date: "",
      members: "",
      photo: ""
    };
  
    if (!date) {
      newErrors.date = "Date is required";
      valid = false;
    }
  
    if (selectedMembers.length === 0) {
      newErrors.members = "At least one member is required";
      valid = false;
    }
  
    if (!photo || photoName === "default.jpg") {
      newErrors.photo = "Photo is required";
      valid = false;
    }
  
    setErrors(newErrors);
    return valid;
  };

  const fetchMeetings = async () => {
    try {
      const SchoolId = localStorage.getItem("school_id");
      if (!SchoolId) {
        console.error("School ID not found in local storage");
        return;
      }
  
      const [meetingsResponse, countsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/meeting?school_id=${SchoolId}`),
        axios.get(`http://localhost:5000/api/tharav/count?school_id=${SchoolId}`)
      ]);
  
      // Create a map of meeting numbers to counts
      const countMap = countsResponse.data.reduce((acc, item) => {
        acc[item.meeting_number] = item.count;
        return acc;
      }, {});
  
      const meetingsData = meetingsResponse.data.map((meeting) => {
        return {
          id: meeting.meeting_id,
          date: meeting.meeting_date,
          number: meeting.meeting_number,
          members: meeting.member_id ? meeting.member_id.split(",") : [],
          latitude: meeting.latitude,
          longitude: meeting.longitude,
          address: meeting.address,
          image_url: meeting.image_url,
          member_id: meeting.member_id,
          tharavCount: countMap[meeting.meeting_number] || 0
        };
      });
  
      setMeetings(meetingsData);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    }
  };

  const handleEditMeeting = (meeting, event) => {
    event.stopPropagation()
    setIsEditing(true)
    setEditingMeetingId(meeting.id)
    setDate(meeting.date)
    setLatitude(meeting.latitude)
    setLongitude(meeting.longitude)
    setAddress(meeting.address)
    setPhotoName(meeting.image_url)

    if (meeting.image_url) {
      if (meeting.image_url === "default.jpg") {
        setPhoto(null)
      } else if (meeting.image_url.startsWith("http")) {
        setPhoto(meeting.image_url)
      } else {
        setPhoto(`http://localhost:5000/uploads/${meeting.image_url}`)
      }
    } else {
      setPhoto(null)
    }

    const selectedMemberObjects = committeeMembers.filter((member) => meeting.members.includes(member.id.toString()))
    setSelectedMembers(selectedMemberObjects)

    console.log("Editing meeting with members:", selectedMemberObjects)
    setIsOpen(true)
  }

  const toggleModal = async () => {
    if (!isOpen) {
      // If we're opening the modal for a new meeting (not editing)
      if (!isEditing) {
        // Check if we can create a new meeting
        const canCreateNewMeeting = await checkCanCreateNewMeeting();
        if (!canCreateNewMeeting) {
          return; // Don't open the modal if we can't create a new meeting
        }
      }
      
      setIsEditing(false);
      setEditingMeetingId(null);
      resetForm();
      detectLocation();
    }
    setIsOpen(!isOpen);
  };







  const handleDeleteMeeting = async (meetingId, event) => {
    // Prevent navigation to meeting details page
    event.stopPropagation();
    
    // Show confirmation dialog
    const result = await Swal.fire({
      title: t("deleteMeeting"),
      text: t("deleteMeetingConfirmation"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("yesDeleteIt"),
      cancelButtonText: t("cancel")
    });
    
    // If user confirms deletion
    if (result.isConfirmed) {
      try {
        // Call API to soft delete the meeting
        await axios.delete(`http://localhost:5000/api/meeting/${meetingId}`);
        
        // Show success message
        Swal.fire({
          icon: "success",
          title: t("deleted"),
          text: t("meetingDeletedSuccess"),
          timer: 2000,
          showConfirmButton: false
        });
        
        // Refresh meetings list
        await fetchMeetings();
      } catch (error) {
        console.error("Error deleting meeting:", error);
        Swal.fire({
          icon: "error",
          title: t("error"),
          text: error.response?.data?.message || t("deleteMeetingError")
        });
      }
    }
  };

  // New function to check if a new meeting can be created
  const checkCanCreateNewMeeting = async () => {
    setIsCheckingMeeting(true);
    try {
      // If there are no meetings, we can always create the first one
      if (meetings.length === 0) {
        setIsCheckingMeeting(false);
        return true;
      }
  
      const schoolId = localStorage.getItem("school_id");
      if (!schoolId) {
        Swal.fire({
          icon: 'error',
          title: t('Error'),
          text: t('School ID not found')
        });
        setIsCheckingMeeting(false);
        return false;
      }
  
      // Check each meeting for tharav records and remarks
      for (const meeting of meetings) {
        // Get tharav records for this meeting
        const tharavResponse = await axios.get(
          `http://localhost:5000/api/tharav/filter?meeting_number=${meeting.number}&school_id=${schoolId}`
        );
        const tharavRecords = tharavResponse.data;
  
        // If there are no tharav records for this meeting
        if (!tharavRecords || tharavRecords.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: t('Cannot Create New Meeting'),
            html: `<div class="text-left">
              <p class="mb-2">${t('Meeting')} #${meeting.number} ${t('has no tharav records')}</p>
              <p class="text-sm text-gray-600">${t('Please add at least one tharav record to this meeting before creating a new one')}</p>
            </div>`,
            confirmButtonText: t('OK')
          });
          setIsCheckingMeeting(false);
          return false;
        }
  
        // Check all tharavs in this meeting
        let allTharavsValid = true;
        let invalidTharavs = [];
        
        for (const tharav of tharavRecords) {
          let isTharavValid = false;
          
          // Check if tharav is active
          if (tharav.status === "Active") {
            console.log("Found active tharav:", tharav);
            isTharavValid = true;
          } else {
            // Check for remarks specific to this tharav
            const remarksResponse = await axios.get(
              `http://localhost:5000/api/remarks?nirnay_id=${tharav.nirnay_id}`
            );
            
            // Check if this specific tharav has remarks
            if (remarksResponse.data.success && remarksResponse.data.data.length > 0) {
              // Verify the remarks belong to this tharav
              const tharavRemarks = remarksResponse.data.data.filter(
                remark => remark.nirnay_id === tharav.nirnay_id
              );
              
              if (tharavRemarks.length > 0) {
                console.log("Found remarks for tharav:", tharav);
                isTharavValid = true;
              }
            }
          }
          
          if (!isTharavValid) {
            allTharavsValid = false;
            invalidTharavs.push(tharav);
          }
        }
  
        if (!allTharavsValid) {
          Swal.fire({
            icon: 'warning',
            title: t('Cannot Create New Meeting'),
            html: `<div class="text-left">
              <p class="mb-2">${t('Meeting')} #${meeting.number} ${t('has incomplete tharavs')}</p>
              <p class="text-sm text-gray-600">${t('Each tharav must be either completed (Active) or have its own remarks')}</p>
              <p class="text-sm text-gray-600 mt-2">${t('Number of incomplete tharavs')}: ${invalidTharavs.length}</p>
            </div>`,
            confirmButtonText: t('OK')
          });
          setIsCheckingMeeting(false);
          return false;
        }
      }
  
      // All meetings have all tharavs valid
      setIsCheckingMeeting(false);
      return true;
    } catch (error) {
      console.error("Error checking if new meeting can be created:", error);
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: t('An error occurred while checking if a new meeting can be created.')
      });
      setIsCheckingMeeting(false);
      return false;
    }
  };

  const handleMemberChange = (member) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member])
    }
  }

  const removeMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id))
  }

  const detectLocation = () => {
    console.log("detectLocation called"); // Log 3
    if (navigator.geolocation) {
      console.log("Geolocation is supported"); // Log 4
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation success:", position); // Log 5
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log("Coordinates:", lat, lon); // Log 6
          setLatitude(lat);
          setLongitude(lon);
          getAddressFromGoogle(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error); // Log 7
          alert(t("geolocationError"));
          setLoading(false);
        }
      );
    } else {
      console.log("Geolocation not supported"); // Log 8
      alert(t("geolocationNotSupported"));
    }
  };

  const getAddressFromGoogle = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${lat},${lon}&key=AlzaSyHvevS18i8KquC0cX9_YhJOBwCdK4G8JSd`,
      )
      const data = await response.json()
      if (data.status === "OK" && data.results.length > 0) {
        setAddress(data.results[0].formatted_address)
      } else {
        setAddress(t("addressNotFound")) // Translated error message
      }
    } catch (error) {
      console.error("Error fetching address:", error)
      setAddress(t("addressFetchError")) // Translated error message
    } finally {
      setLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      alert(t("cameraAccessError")) // Translated error message
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight

      const ctx = canvas.getContext("2d")
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

      const imageDataURL = canvas.toDataURL(`image/${fileExtension}`)
      setPhoto(imageDataURL)

      const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0]
      setPhotoName(`meeting_${meetingNumber || "new"}_${timestamp}.${fileExtension}`)

      stopCamera()
      setShowCamera(false)
    }
  }

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",")
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target.result)
      }
      reader.readAsDataURL(file)
      setPhotoName(file.name)
    }
  }

  const toggleCamera = () => {
    setShowCamera(!showCamera)
    if (!showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
  
    // Add confirmation dialog
    const confirmResult = await Swal.fire({
      title: isEditing ? t("Update Meeting?") : t("Add Meeting?"),
      text: isEditing 
        ? t("Do you really want to update this meeting?") 
        : t("Do you really want to add this meeting?"),
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEditing ? t("Yes, update it!") : t("Yes, add it!"),
      cancelButtonText: t("Cancel"),
    });
  
    if (!confirmResult.isConfirmed) {
      return;
    }
  
    if (!date || selectedMembers.length === 0) {
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: t('requiredFieldsError')
      })
      return
    }
  
    const formData = new FormData()
    formData.append("meeting_date", date)
    formData.append("latitude", latitude || "0.0000")
    formData.append("longitude", longitude || "0.0000")
    formData.append("address", address || t("unknown"))
    formData.append("member_id", selectedMembers.map((m) => m.id).join(","))
    formData.append("selected_member_length", selectedMembers.length)
  
    if (document.getElementById("fileInput")?.files[0]) {
      formData.append("image", document.getElementById("fileInput").files[0])
    } else if (photo && photo.startsWith("data:image")) {
      const imageFile = dataURLtoFile(photo, photoName)
      formData.append("image", imageFile)
    } else if (photoName) {
      formData.append("image_url", photoName)
    }
  
    if (!isEditing) {
      formData.append("meeting_number", meetingNumber)
      formData.append("school_id", localStorage.getItem("school_id") || "")
      formData.append("user_id", localStorage.getItem("user_id") || "")
      formData.append("created_at", new Date().toISOString().replace("T", " ").split(".")[0])
      formData.append("updated_at", "0000-00-00 00:00:00")
    }
  
    try {
      let response
  
      if (isEditing) {
        response = await axios.put(`http://localhost:5000/api/meeting/${editingMeetingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        Swal.fire({
          icon: 'success',
          title: t('Success'),
          text: t('Meeting updated successfully'),
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        response = await axios.post("http://localhost:5000/api/meeting", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
  
        setMeetingNumber(meetingNumber + 1)
        Swal.fire({
          icon: 'success',
          title: t('Success'),
          text: t('Meeting added successfully'),
          timer: 2000,
          showConfirmButton: false
        })
      }
  
      console.log("Meeting saved successfully:", response.data)
      await fetchMeetings()
      resetForm()
      setIsEditing(false)
      setEditingMeetingId(null)
    } catch (error) {
      console.error("Error submitting meeting:", error.response?.data || error)
      Swal.fire({
        icon: 'error',
        title: t('Error'),
        text: error.response?.data?.message || t('submitError')
      })
    }
  }


  const resetForm = () => {
    setIsOpen(false)
    setDate("")
    setSelectedDate(null)
    setSelectedMembers([])
    setLatitude(null)
    setLongitude(null)
    setAddress("")
    setPhoto(null)
    setPhotoName("default.jpg")
    setShowCamera(false)
    stopCamera()
  }

 
  return (
    <>
    {loading ? (
      <SkeletonLoader />
    ) : (
<div className="min-h-screen p-3 md:p-6 space-y-4 md:space-y-6">
       <div className="bg-white  rounded-[14px] mx-auto w-[75%] max-w-6xl overflow-y-auto max-h-[85vh] shadow-md"> 
        <div className="  bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
  <h2 className="text-xl md:text-3xl font-bold realfont2">{t("smcMeetings")}</h2>
  <button
              onClick={toggleModal}
              disabled={isCheckingMeeting}
              className="bg-white text-blue-950 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-blue-100 flex items-center shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isCheckingMeeting ? (
      <>
        <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-sm sm:text-base realfont2">{t("Checking...")}</span>
      </>
    ) : (
      <>
    <Plus className="mr-1 sm:mr-2" size={20} />
    <span className="text-sm sm:text-base realfont2">{t("addMeeting")}</span>
      </>
    )}
  </button>
</div>
       


    {isOpen && (
  <div className="fixed inset-0 bg-transparent backdrop-blur-[4px] flex items-center justify-center z-50 p-4 realfont">
    <div ref={modalRef} className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
      <div className="p-4 md:p-6 border-b flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-blue-950">
          {isEditing ? t("editMeeting") : t("addMeeting")}
        </h2>
        <button
          onClick={toggleModal}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Form content */}
      <div className="p-4 md:p-6 space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
  <label className="block text-sm font-medium text-blue-950">
    {t("date")} <span className="text-red-500">*</span>
  </label>
  <DatePicker
    selected={selectedDate}
    onChange={handleDateChange}
    dateFormat="MMMM d, yyyy"
    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.date ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
    placeholderText={t("selectDate")}
  />
  {errors.date && (
    <p className="text-red-500 text-sm mt-1 flex items-center">
      <AlertCircle className="mr-2 flex-shrink-0" size={16} />
      {errors.date}
    </p>
  )}
</div>
        {/* Selected Members */}
        <div className="space-y-2">
  <label className="block text-sm font-medium text-blue-950">
    {t("selectedMembers")} <span className="text-red-500">*</span>
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


          {errors.members && (
    <p className="text-red-500 text-sm mt-1 flex items-center">
      <AlertCircle className="mr-2 flex-shrink-0" size={16} />
      {errors.members}
    </p>
  )}
        </div>

        {/* Committee Members */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-950">
            {t("committeeMembers")}
          </label>
          <div className="border rounded-md h-32 overflow-y-auto">
            {committeeMembers.map((member, index) => (
              <div
                key={index}
                onClick={() => handleMemberChange(member)}
                className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
              >
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-gray-600">{member.representative}</p>
                </div>
                {selectedMembers.find((m) => m.id === member.id) && (
                  <span className="text-purple-700">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-950">{t("latitude")}</label>
            <div className="p-2 border rounded-md bg-gray-50 text-center">
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-950 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                latitude || "Not detected"
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-blue-950">{t("longitude")}</label>
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
          <label className="block text-sm font-medium text-blue-950">{t("address")}</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
  <label className="block text-sm font-medium text-blue-950">
    {t("uploadOrTakePhoto")} <span className="text-red-500">*</span>
  </label>
  {errors.photo && (
    <p className="text-red-500 text-sm flex items-center">
      <AlertCircle className="mr-2 flex-shrink-0" size={16} />
      {errors.photo}
    </p>
  )}
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
          <input type="file" id="fileInput" accept="image/*" onChange={handlePhotoChange} className="hidden" />

          {photo && !showCamera && (
            <div className="mt-2 border rounded-md overflow-hidden">
              <img src={photo} alt={t("selectedPhoto")} className="w-full h-auto" />
            </div>
          )}

          {showCamera && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <div className="relative w-full bg-black aspect-video">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center">
                  <select
                    value={fileExtension}
                    onChange={(e) => setFileExtension(e.target.value)}
                    className="px-2 py-1 text-sm rounded bg-gray-800 text-white border border-gray-700"
                  >
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                  <button
                    onClick={capturePhoto}
                    className="bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-white"></div>
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="px-2 py-1 bg-gray-700 text-white rounded text-sm"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-950 text-white py-3 rounded-md hover:bg-blue-900 transition-colors font-semibold text-lg"
        >
          {isEditing ? t("updateMeeting") : t("submit")}
        </button>
      </div>
    </div>
  </div>
)}

      <div className="space-y-4 md:space-y-6 mt-4 md:mt-8">
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() =>
              navigate(`/home/meetings/tharav/${meeting.number}`, {
                state: { meetingId: meeting.id, meetingNumber: meeting.number },
              })
            }
            className="group relative overflow-hidden bg-blue-50  rounded-xl   hover:shadow-lg transition-all duration-200 cursor-pointer w-full max-w-full md:max-w-[740px] mx-auto"
          >
            <div className="absolute top-0 left-3 md:left-6 px-2 md:px-4 py-0.5 md:py-1  bg-blue-950 text-white text-xs md:text-sm realfont rounded-lg shadow-sm transform transition-transform group-hover:translate-y-0.5">
              {meeting.date}
            </div>

            <div className="pt-6 md:pt-8 pb-3 md:pb-4 px-3 md:px-6 realfont">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-12 py-2">
                  <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">{t("meetingNo")}</div>
                    <div className="text-xl md:text-2xl font-bold text-blue-950">{meeting.number}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">{t("members")}</div>
                    <div className="text-xl md:text-2xl font-bold text-blue-950">{meeting.members?.length || 0}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs md:text-sm font-medium text-gray-500 mb-1">{t("totalTharav")}</div>
                    <div className="text-xl md:text-2xl font-bold text-blue-950">{meeting.tharavCount}</div>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-end gap-3 mt-3 md:mt-0">
                  <button
                    onClick={(e) => handleEditMeeting(meeting, e)}
                    className="text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer"
                    aria-label={t("editMeeting")}
                  >
                    {t("edit")}
                  </button>

                  <button
                    onClick={(e) => handleDeleteMeeting(meeting.id, e)}
                    aria-label={t("deleteMeeting")}
                    className="text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-colors text-lg font-medium min-w-[60px] text-center cursor-pointer"
                    >
                   {t("delete")}
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
       </div>
      </div>
    </div>
     )}
     </>
  )
}

export default Meetings

