import React, { useState } from 'react';
import { Camera, ArrowLeft } from 'lucide-react';

const TharavFormModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    tharavNo: '',
    purpose: '',
    problemFounded: '',
    where: '',
    what: '',
    howMany: '',
    deadStockNumber: '',
    decisionTaken: '',
    expectedExpenditure: '',
    fixedDate: '',
    photo: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0  bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-xl rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-purple-600 p-4 rounded-t-lg">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h2 className="text-xl text-white font-semibold ml-4">Add Tharav</h2>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="text-sm text-gray-600">Meeting No: 1</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <input
                type="text"
                name="tharavNo"
                placeholder="Tharav No"
                value={formData.tharavNo}
                onChange={handleInputChange}
                className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="col-span-1">
              <select
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                <option value="">Purpose</option>
                <option value="purpose1">Purpose 1</option>
                <option value="purpose2">Purpose 2</option>
              </select>
            </div>
          </div>

          <input
            type="text"
            name="problemFounded"
            placeholder="Problem Founded"
            value={formData.problemFounded}
            onChange={handleInputChange}
            className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />

          <input
            type="text"
            name="where"
            placeholder="Where"
            value={formData.where}
            onChange={handleInputChange}
            className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />

          <input
            type="text"
            name="what"
            placeholder="What"
            value={formData.what}
            onChange={handleInputChange}
            className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="howMany"
              placeholder="How Many"
              value={formData.howMany}
              onChange={handleInputChange}
              className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              name="deadStockNumber"
              placeholder="Dead Stock Number"
              value={formData.deadStockNumber}
              onChange={handleInputChange}
              className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          <textarea
            name="decisionTaken"
            placeholder="Decision Taken"
            value={formData.decisionTaken}
            onChange={handleInputChange}
            className="w-full p-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            rows={4}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="expectedExpenditure"
              placeholder="Expected Expenditure"
              value={formData.expectedExpenditure}
              onChange={handleInputChange}
              className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <button
              type="button"
              className="w-full p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Camera className="h-5 w-5" />
              Take Tharav Photo
            </button>
          </div>

          <input
            type="date"
            name="fixedDate"
            placeholder="Fixed Date"
            value={formData.fixedDate}
            onChange={handleInputChange}
            className="w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />

          <button
            type="submit"
            className="w-full p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
          >
            Submit Tharav
          </button>
        </form>
      </div>
    </div>
  );
};

export default TharavFormModal;