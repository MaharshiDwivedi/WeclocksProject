import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Trash2, Pencil, Plus, AlertCircle, Search } from 'lucide-react';
import DataTable from 'react-data-table-component';

const FundDist = () => {
  const [fundData, setFundData] = useState([]);
  const [filteredFundData, setFilteredFundData] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFundId, setEditFundId] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedYear, setSelectedYear] = useState('2023-24');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fund-distribution');
        setFundData(response.data);
        setFilteredFundData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fund data:', err);
        setError('Failed to fetch fund data');
        setLoading(false);
      }
    };

    const fetchSchools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schools');
        setSchools(response.data);
      } catch (err) {
        console.error('Error fetching schools:', err);
      }
    };

    fetchFundData();
    fetchSchools();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!selectedSchool) newErrors.school = "School is required";
    if (!amount || amount <= 0) newErrors.amount = "Valid amount is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = { school_id: selectedSchool, year: selectedYear, amount };
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/fund-distribution/${editFundId}`, payload);
      } else {
        await axios.post('http://localhost:5000/api/fund-distribution', payload);
      }

      const response = await axios.get('http://localhost:5000/api/fund-distribution');
      setFundData(response.data);
      setFilteredFundData(response.data);
      resetForm();
    } catch (err) {
      console.error('Error saving fund:', err);
      setError('Failed to save fund');
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
        console.error('Error deleting fund:', err);
        setError('Failed to delete fund');
      }
    }
  };

  const handleEdit = (fund) => {
    setSelectedSchool(fund.school_id);
    setSelectedYear('2023-24'); // Assuming year isn't stored separately, defaulting
    setAmount(fund.amount);
    setEditFundId(fund.demand_master_id);
    setIsEditMode(true);
    setIsModalOpen(true);
    setErrors({});
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditFundId(null);
    setSelectedSchool('');
    setSelectedYear('2023-24');
    setAmount('');
    setErrors({});
  };

  // Filter funds
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = fundData.filter(fund =>
      fund.school_name.toLowerCase().includes(term) ||
      fund.amount.toString().includes(term)
    );
    setFilteredFundData(filtered);
  };

  // Table columns
  const columns = [
    {
      name: "School Name",
      selector: row => row.school_name,
      sortable: true,
    },
    {
      name: "Amount",
      selector: row => `₹${row.amount}`,
      sortable: true,
    },
    {
      name: "Date",
      selector: row => new Date(row.ins_date_time).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-yellow-500 hover:text-yellow-600"
          >
            <Pencil />
          </button>
          <button
            onClick={() => handleDelete(row.demand_master_id)}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 />
          </button>
        </div>
      ),
      center: true,
    },
  ];

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Fund Distribution</h2>
          <button
            onClick={() => {
              setIsEditMode(false);
              setIsModalOpen(true);
            }}
            className="bg-white text-blue-950 px-4 py-2 rounded-md hover:bg-blue-100 flex items-center"
          >
            <Plus className="mr-2" /> Add Fund
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 flex space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search funds by school or amount..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredFundData}
          pagination
          highlightOnHover
          customStyles={{
            headCells: {
              style: { backgroundColor: "#f3f4f6", fontSize: "16px" },
            },
          }}
        />

        {/* Empty State */}
        {filteredFundData.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No funds found
          </div>
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
              {/* School Field */}
              <div>
                <label className="block mb-2 text-sm font-medium">School</label>
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
                    <AlertCircle className="mr-2" size={16} /> {errors.school}
                  </p>
                )}
              </div>

              {/* Year Field */}
              <div>
                <label className="block mb-2 text-sm font-medium">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                </select>
              </div>

              {/* Amount Field */}
              <div>
                <label className="block mb-2 text-sm font-medium">Amount</label>
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
                    <AlertCircle className="mr-2" size={16} /> {errors.amount}
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-950 text-white py-3 rounded-md hover:bg-blue-900 transition-colors"
              >
                {isEditMode ? "Update Fund" : "Add Fund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundDist;