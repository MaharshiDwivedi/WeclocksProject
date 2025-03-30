"use client"

// Meetings.jsx
import { useState, useEffect, useRef } from "react"
import { X, Camera, Upload, CalendarPlus, Pencil, Trash2, ChevronRight, Plus } from "lucide-react"
import axios from "axios"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Swal from 'sweetalert2'


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

  const fetchMeetings = async () => {
    try {
      const SchoolId = localStorage.getItem("school_id")
      if (!SchoolId) {
        console.error("School ID not found in local storage")
        return
      }

      const response = await axios.get(`http://localhost:5000/api/meeting?school_id=${SchoolId}`)

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
      }))

      setMeetings(meetingsData)
    } catch (error) {
      console.error("Error fetching meetings:", error)
    }
  }

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

  const toggleModal = () => {
    if (!isOpen) {
      setIsEditing(false)
      setEditingMeetingId(null)
      resetForm()
      detectLocation()
    }
    setIsOpen(!isOpen)
  }

  const handleMemberChange = (member) => {
    if (!selectedMembers.find((m) => m.id === member.id)) {
      setSelectedMembers([...selectedMembers, member])
    }
  }

  const removeMember = (member) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== member.id))
  }

  const detectLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setLatitude(lat)
          setLongitude(lon)
          getAddressFromGoogle(lat, lon)
        },
        (error) => {
          console.error("Geolocation error:", error)
          alert(t("geolocationError")) // Translated error message
          setLoading(false)
        },
      )
    } else {
      alert(t("geolocationNotSupported")) // Translated error message
    }
  }

  const getAddressFromGoogle = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${lat},${lon}&key=AlzaSytrcKULEwn4WVVQDuh6EIZfjdXfq7GCHtH`,
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
    formData.append("address", address || t("unknown")) // Translated default value
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
      })    }
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

  const handleDeleteMeeting = async (meetingId, event) => {
    event.stopPropagation()

    const result = await Swal.fire({
      title: t('Are you sure?'),
      text: t('confirmDeleteMeeting'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: t('Yes, delete it!'),
      cancelButtonText: t('Cancel')
    })

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/meeting/${meetingId}`)
        console.log("Backend response:", response.data)

        setMeetings((prevMeetings) => prevMeetings.filter((meeting) => meeting.id !== meetingId))
        Swal.fire({
          icon: 'success',
          title: t('Deleted!'),
          text: t('Meeting has been deleted.'),
          timer: 2000,
          showConfirmButton: false
        })
      } catch (error) {
        console.error("Error deleting meeting:", error)
        Swal.fire({
          icon: 'error',
          title: t('Error'),
          text: t('deleteError')
        })
      }
    }
  }


  return (
<div className="min-h-screen p-3 md:p-6 space-y-4 md:space-y-6">
  <div className="bg-neutral-200 rounded-lg mx-auto w-[75%] max-w-6xl overflow-y-auto max-h-[85vh] shadow-md"> 
    <h2 className="text-2xl md:text-4xl font-bold text-center text-blue-950 realfont2 pt-4">{t("smcMeetings")}</h2> 

    <div className="flex justify-center md:justify-end md:mr-[620px] px-4"> {/* Added px-4 for side padding */}
      <button
        onClick={toggleModal}
        className="realfont flex items-center gap-1 md:gap-2 bg-blue-950 text-white px-2 py-1.5 md:py-2 rounded-md hover:bg-blue-900 transition-colors text-sm md:text-base mb-4" 
      >
        <Plus className="w-5 h-5 md:w-9 md:h-9" />
        <span>{t("addMeeting")}</span>
      </button>
    </div>


    {isOpen && (
  <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4 realfont">
    <div className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
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
          <label className="block text-sm font-medium text-blue-950">{t("date")}</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholderText={t("selectDate")}
          />
        </div>

        {/* Selected Members */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-blue-950">{t("selectedMembers")}</label>
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
                latitude
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
            readOnly
            className="w-full px-3 py-2 border rounded-md bg-gray-50"
          />
        </div>

        {/* Photo Upload */}
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
            className="group relative overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full max-w-full md:max-w-[700px] mx-auto"
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
                    <div className="text-xl md:text-2xl font-bold text-blue-950">-</div>
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
  )
}

export default Meetings

