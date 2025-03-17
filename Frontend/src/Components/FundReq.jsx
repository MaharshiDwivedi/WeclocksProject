import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { FaTrash, FaEdit } from "react-icons/fa";
import Swal from 'sweetalert2';
import axios from 'axios';
import { Plus, Search } from "lucide-react";

export default function FundReq() {
  const API_URL = "http://localhost:5000/api/fundreqhm";
  const [demands, setDemands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDemandId, setCurrentDemandId] = useState("");
  console.log("currentDemandId",currentDemandId)
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDemands, setFilteredDemands] = useState([]);

  const [newDemand, setNewDemand] = useState({
    year: "",
    Amount: "",
  });

  useEffect(() => {
    
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const res = await axios.get(API_URL);
      console.log("API Response:", res.data); // Log the response
  
      // Parse the pipe-separated data
      const formattedDemands = res.data.map(request => {
        const recordData = request.demand_master_record.split("|");
        return {
          id: request.demand_master_id, // Assuming there is a unique ID
          demand_status: request.demand_status,
          year: recordData[1] || "N/A",
          amount: recordData[2] || "N/A",
          
        };
      });
  
      setDemands(formattedDemands);
      setFilteredDemands(formattedDemands);
    } catch (error) {
      console.error("Error fetching demands:", error);
    }
  };


  const handleEdit = (demand) => {
   
    setNewDemand(demand); // Set selected demand data in form
    setCurrentDemandId(demand.id); // Store the ID for updating
    setIsEditing(true); // Enable edit mode
    setIsModalOpen(true); // Open the modal
  };
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to undo this action!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  
          Swal.fire({
            title: "Deleted!",
            text: "The fund request has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
  
          fetchDemands(); // Refresh the data after deletion
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the fund request.",
            icon: "error"
          });
          console.error("Error deleting fund request:", error);
        }
      }
    });
  };
  
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;


    if (!newDemand.year) {
      newErrors.year = "Year is required";
      isValid = false;
    }
  
    // Validate Amount
    if (!newDemand.amount.trim()) {
      newErrors.amount = "Amount is required";
      isValid = false;
    } else if (isNaN(newDemand.amount) || Number(newDemand.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return; // Validate the form before proceeding
  
    // Show SweetAlert confirmation before proceeding
    const result = await Swal.fire({
      title: isEditing ? "Are you sure?" : "Confirm Addition",
      text: isEditing
        ? "Do you want to update this fund request?"
        : "Are you sure you want to add this fund request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: isEditing ? "Yes, Update" : "Yes, Add",
      cancelButtonText: "Cancel",
    });
  
    if (!result.isConfirmed) return; // Stop if user cancels
  
    const schoolId = localStorage.getItem("school_id");
    const userId = localStorage.getItem("user_id");
  
    // Pipe-separated format for fund request
    const demandData = `${schoolId}|${newDemand.year}|${newDemand.amount}|Credit|${userId}`;
  
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${currentDemandId}` : API_URL;
  
    try {
      // Show loading alert
      Swal.fire({
        title: isEditing ? "Updating..." : "Adding...",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demand_master_record: demandData }),
      });
  
      if (!res.ok) {
        throw new Error(`Failed to save fund request. Status: ${res.status}`);
      }
  
      // Show success alert after successful operation
      await Swal.fire({
        icon: "success",
        title: isEditing ? "Fund Request Updated!" : "Fund Request Added!",
        text: isEditing
          ? "The fund request details have been updated successfully."
          : "A new fund request has been added successfully.",
      });
  
      fetchDemands(); // Refresh the list
      closeModal(); // Close modal
    } catch (error) {
      console.error("Error saving fund request:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Something went wrong while saving the fund request.",
      });
    }
  };
  

  useEffect(() => {
    const filterDemands = () => {
      if (!searchTerm) {
        setFilteredDemands(demands); // Reset to all demands if search term is empty
        return;
      }
  
      const lowercasedSearchTerm = searchTerm.toLowerCase();
  
      const filtered = demands.filter((demand) => {
        return (
          demand.year.toLowerCase().includes(lowercasedSearchTerm) ||
          demand.amount.toLowerCase().includes(lowercasedSearchTerm)
        );
      });
  
      setFilteredDemands(filtered);
    };
  
    filterDemands();
  }, [searchTerm, demands]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  


  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setNewDemand({
      
      year: "",
      Amount: "",
    });
    setErrors({});
  };



  const columns = [
    // { name: "demand_status", selector: (row) => row.demand_status, sortable: true },
    { name: "Year", selector: (row) => row.year, sortable: true },
    { name: "Amount", selector: (row) => row.amount, sortable: true },
    { name: "Demand Status", selector: (row) => row.demand_status, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={row.demand_status == "Pending" ? () => handleEdit(row) : null}
            className={`${row.demand_status == "Pending" ? "bg-blue-600" :"bg-gray-600"} text-white px-3 py-1 rounded flex items-center`}>
            <FaEdit className="mr-2" /> Edit
          </button>
          <button
            onClick={row.demand_status == "Pending" ? () => handleDelete(row.id) : null}
            className={`${row.demand_status == "Pending" ? "bg-red-600" : "bg-gray-600"} text-white px-3 py-1 rounded flex items-center`}>
            <FaTrash className="mr-2" /> Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4  w-full">
      <div className="bg-blue-950 text-white px-6 py-2 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fund Requests</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-blue-950 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center">
          <Plus className="mr-2" /> Add Fund Request
        </button>
      </div>

      {/* Search Filter */}
      <div className="p-4 bg-gray-50 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search fund requests..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-[800px] pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredDemands}
        pagination
        highlightOnHover
        customStyles={{
          headCells: {
            style: {
              backgroundColor: "#f3f4f6",
              fontSize: "18px",
              fontFamily: "Poppins",
              fontWeight: 400,
              justifyContent: "center",
            },
          },
          cells: {
            style: {
              fontSize: "16px",
              fontFamily: "Poppins",
              color: "#333",
              justifyContent: "center",
            },
          },
        }}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-left text-blue-80">
              {isEditing ? "Edit Fund Request" : "New Fund Request"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                value={newDemand.year}
                onChange={(e) => setNewDemand({ ...newDemand, year: e.target.value })}
                className={`w-full p-3 border ${errors.year ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:ring focus:ring-purple-500`}>
                <option value="">Select Year</option>
                <option value="2023-2024">2023-24</option>
                <option value="2024-2025">2024-25</option>
              </select>
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newDemand.amount}
                onChange={(e) => setNewDemand({ ...newDemand, amount: e.target.value })}
                className={`w-full p-3 border ${errors.amount ? "border-red-500" : "border-gray-300"} rounded focus:outline-none focus:ring focus:ring-purple-500`}
                placeholder="Enter amount"
                
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button onClick={handleSubmit} className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-purple-700">
                {isEditing ? "Update" : "Submit"}
              </button>
              <button onClick={closeModal} className="bg-gray-400 px-4 py-2 rounded text-white hover:bg-gray-500">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}