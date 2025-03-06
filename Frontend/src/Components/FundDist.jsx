import React, { useEffect, useState } from "react";
import axios from "axios";
import { X, Trash2, Pencil, Plus, AlertCircle, Search } from "lucide-react";
import DataTable from "react-data-table-component";

const FundDist = () => {
  const [fundData, setFundData] = useState([]);
  const [filteredFundData, setFilteredFundData] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFundId, setEditFundId] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedYear, setSelectedYear] = useState("2023-24");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [additionalAmount, setAdditionalAmount] = useState(""); // New state for additional amount

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/fund-distribution"
        );
        setFundData(response.data); // These will now only be active records due to backend filter
        setFilteredFundData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching fund data:", err);
        setError("Failed to fetch fund data");
        setLoading(false);
      }
    };

    const fetchSchools = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/schools");
        setSchools(response.data);
      } catch (err) {
        console.error("Error fetching schools:", err);
      }
    };

    fetchFundData();
    fetchSchools();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (isEditMode) {
      if (!additionalAmount || parseFloat(additionalAmount) <= 0) {
        newErrors.additionalAmount = "Valid additional amount is required";
      }
    } else {
      if (!selectedSchool) newErrors.school = "School is required";
      if (!amount || amount <= 0) newErrors.amount = "Valid amount is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (isEditMode) {
        const payload = { additional_amount: additionalAmount };
        await axios.put(
          `http://localhost:5000/api/fund-distribution/${editFundId}`,
          payload
        );
      } else {
        const payload = {
          school_id: selectedSchool,
          year: selectedYear,
          amount,
        };
        await axios.post(
          "http://localhost:5000/api/fund-distribution",
          payload
        );
      }

      const response = await axios.get(
        "http://localhost:5000/api/fund-distribution"
      );
      setFundData(response.data);
      setFilteredFundData(response.data);
      resetForm();
    } catch (err) {
      console.error("Error saving fund:", err);
      setError("Failed to save fund");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fund?")) {
      try {
        await axios.delete(`http://localhost:5000/api/fund-distribution/${id}`);

        // Remove the deleted fund from the frontend list
        setFundData((prevFundData) =>
          prevFundData.filter((fund) => fund.demand_master_id !== id)
        );
        setFilteredFundData((prevFilteredFundData) =>
          prevFilteredFundData.filter((fund) => fund.demand_master_id !== id)
        );
      } catch (err) {
        console.error("Error deleting fund:", err);
        setError("Failed to delete fund");
      }
    }
  };

  const handleEdit = (fund) => {
    setSelectedSchool(fund.school_id);
    setSelectedYear(fund.year);
    setAmount(fund.amount); // Keep original amount for display
    setAdditionalAmount(""); // Reset additional amount
    setEditFundId(fund.demand_master_id);
    setIsEditMode(true);
    setIsModalOpen(true);
    setErrors({});
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditFundId(null);
    setSelectedSchool("");
    setSelectedYear("2023-24");
    setAmount("");
    setAdditionalAmount(""); // Reset additional amount
    setErrors({});
  };

  // Filter funds
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = fundData.filter(
      (fund) =>
        fund.school_name.toLowerCase().includes(term) ||
        fund.amount.toString().includes(term)
    );
    setFilteredFundData(filtered);
  };

  // Table columns
  const columns = [
    {
      name: "School Name",
      selector: (row) => row.school_name,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row) => `₹${row.amount}`,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) =>
        new Date(row.ins_date_time)
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2 gap-5">
          <button onClick={() => handleEdit(row)} className=" flex">
            <span className="realfont2 text-teal-500 text-lg ">
              {" "}
              EDIT{" "}
            </span>
          </button>
          <button
            onClick={() => handleDelete(row.demand_master_id)}
            className="text-red-500 hover:text-red-600"
          >
            <span className="realfont2 text-lg "> DELETE </span>
          </button>
        </div>
      ),
      // center: true,
    },
  ];

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-8 py-8 ">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 text-white p-3 flex justify-between items-center ">
          <h2 className="text-2xl font-bold">Fund Distribution</h2>
        </div>

        {/* Filters */}
        <div className="p-4 flex items-center justify-between">
          {/* Search Input - Placeholder Left, Icon Right */}
          <div className="relative w-[300px]">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
            />
            <Search className="absolute right-3 top-3 text-gray-400 -mt-1" />
          </div>

          {/* Add Fund Button - Rightmost */}
          <button
            onClick={() => {
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
            className="bg-blue-950 text-white  hover:bg-blue-900 transition-colors px-4 py-2 rounded-md  flex items-center whitespace-nowrap"
          >
            <Plus className="mr-2" /> Add Fund
          </button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredFundData}
          pagination
          highlightOnHover
          customStyles={{
            headCells: {
              style: { backgroundColor: "#f3f4f6", fontSize: "18px" },
            },
            cells: {
              style: {
                fontSize: "16px",
                fontFamily: "Poppins",
                color: "#333",
              },
            },
          }}
        />

        {/* Empty State */}
        {filteredFundData.length === 0 && (
          <div className="text-center p-8 text-gray-500">No funds found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 realfont">
          <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-blue-950">
                {isEditMode ? "Edit Fund" : "Fund Distribution"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isEditMode ? (
                <>
                  {/* Display existing values as read-only */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      School
                    </label>
                    <input
                      type="text"
                      value={
                        schools.find((s) => String(s.school_id) === String(selectedSchool))
                       ?.school_name || ""
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                   </div>
                   <div>
                    <label className="block mb-2 text-sm font-medium">
                      Year
                    </label>
                    <input
                      type="text"
                      value={selectedYear}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                   </div>
                   <div>
                    <label className="block mb-2 text-sm font-medium">
                      Current Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      readOnly
                    />
                   </div>
                   <div>
                    <label className="block mb-2 text-sm font-medium">
                      Additional Amount
                    </label>
                    <input
                      type="number"
                      value={additionalAmount}
                      onChange={(e) => setAdditionalAmount(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.additionalAmount
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter additional amount"
                    />
                    {errors.additionalAmount && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="mr-2" size={16} />{" "}
                        {errors.additionalAmount}
                      </p>
                    )}
                   </div>
                     </>
                     ) : (
                    <>
                    {/* Original add fund fields */}
                     <div>
                    <label className="block mb-2 text-sm font-medium">
                      School
                    </label>
                    <select
                      value={selectedSchool}
                      onChange={(e) => setSelectedSchool(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.school
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                    >
                      <option value="">Select School</option>
                      {schools.map((school) => (
                        <option key={school.school_id} value={school.school_id}>
                          {school.school_name}
                        </option>
                      ))}
                    </select>
                    {errors.school && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="mr-2" size={16} />{" "}
                        {errors.school}
                      </p>
                    )}
                   </div>
                   <div>
                    <label className="block mb-2 text-sm font-medium">
                      Year
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="2023-24">2023-24</option>
                      <option value="2024-25">2024-25</option>
                    </select>
                   </div>
                   <div>
                    <label className="block mb-2 text-sm font-medium">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.amount
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500"
                      }`}
                      placeholder="Enter amount"
                    />
                    {errors.amount && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="mr-2" size={16} />{" "}
                        {errors.amount}
                      </p>
                    )}
                   </div>
                    </>
                   )}
                    </div>

            <div className="p-6 border-t">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-950 text-white py-3 rounded-md hover:bg-blue-900 transition-colors text-[18px]"
              >
                {isEditMode ? "UPDATE FUND" : "ADD FUND"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundDist;
