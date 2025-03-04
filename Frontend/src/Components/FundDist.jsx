import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Trash2, Edit3, Plus, PencilLine } from 'lucide-react';

const FundDist = () => {
  const [fundData, setFundData] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFundId, setEditFundId] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedYear, setSelectedYear] = useState('2023-24');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/fund-distribution');
        setFundData(response.data);
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

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/fund-distribution/${editFundId}`, {
          school_id: selectedSchool,
          year: selectedYear,
          amount,
        });
      } else {
        await axios.post('http://localhost:5000/api/fund-distribution', {
          school_id: selectedSchool,
          year: selectedYear,
          amount,
        });
      }
      
      const response = await axios.get('http://localhost:5000/api/fund-distribution');
      setFundData(response.data);

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditFundId(null);
      setAmount('');
    } catch (err) {
      console.error('Error saving fund:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/fund-distribution/${id}`);
      setFundData(fundData.filter(fund => fund.demand_master_id !== id));
    } catch (err) {
      console.error('Error deleting fund:', err);
    }
  };

  const handleEdit = (fund) => {
    setSelectedSchool(fund.school_id);
    setSelectedYear('2023-24');
    setAmount(fund.amount);
    setEditFundId(fund.demand_master_id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-4xl font-bold text-center text-blue-950 realfont2">Fund Distribution</h2>
      <button
        className="mb-4 px-4 py-2 bg-blue-950 text-white rounded"
        onClick={() => {
          setIsEditMode(false);
          setIsModalOpen(true);
        }}
      >
        <Plus/>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fundData.map((fund) => (
          <div key={fund.demand_master_id} className="bg-white p-4 rounded-lg shadow-lg relative">
            <button 
              className="absolute top-2 right-10 text-blue-500" 
              onClick={() => handleEdit(fund)}
            >
              <PencilLine  className="w-5 h-5" />
            </button>
            <button 
              className="absolute top-2 right-2 text-red-500" 
              onClick={() => handleDelete(fund.demand_master_id)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold">{fund.school_name}</h3>
            <p className="text-gray-600">Date: {new Date(fund.ins_date_time).toLocaleDateString()}</p>
            <p className=" font-bold">₹{fund.amount}</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent backdrop-blur-[2px] realfont">
          <div className="bg-white p-6 rounded shadow-lg relative max-w-sm">
            <button 
              className="absolute top-2 right-2 px-3 py-1 text-neutral-500"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">{isEditMode ? 'Edit Fund' : 'Add Fund'}</h3>
            <label>School:</label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full p-2 shadow-lg rounded mb-2"
            >
              <option value="">Select School</option>
              {schools.map((school) => (
                <option key={school.school_id} value={school.school_id}>{school.school_name}</option>
              ))}
            </select>

            <label>Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 shadow-lg rounded mb-2"
            >
              <option value="2023-24">2023-24</option>
              <option value="2024-25">2024-25</option>
            </select>

            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 shadow-lg rounded mb-2"
            />

            <button onClick={handleSubmit} className="w-full px-4 py-2 bg-blue-950 text-white rounded">{isEditMode ? 'Update' : 'Submit'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundDist;
