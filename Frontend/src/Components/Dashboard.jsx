import { useState, useEffect } from "react";
import BarGraph from "./BarGraph";
import axios from "axios";

const Dashboard = () => {
  const [values, setValues] = useState({ actualExpense: 1, expectedExpense: 1.9 });
  const [headwiseData, setHeadwiseData] = useState([]); // Stores headwise data

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear() // Current year
  });

  // Fetch Expense Data
  const fetchExpenseData = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/expenceData", {
        month: selectedDate.month.toString(),
        year: selectedDate.year.toString(),
        category_id: "4",
        school_id: "14",
      });

      console.log("🚀 API Response:", response.data);

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("❌ API response is not an array:", response.data);
        return;
      }

      const expenseData = response.data.data;

      console.log("✅ Processed Expense Data:", expenseData);

      const totalActual = expenseData.reduce(
        (sum, head) => sum + (parseFloat(head.actual_cost) || 0),
        0
      );
      const totalExpected = expenseData.reduce(
        (sum, head) => sum + (parseFloat(head.expected_cost) || 0),
        0
      );

      // Update total values
      setValues({
        actualExpense: Number((totalActual / 100000).toFixed(2)),
        expectedExpense: Number((totalExpected / 100000).toFixed(2)),
      });

      // Set head-wise data for the 9 graphs
      setHeadwiseData(expenseData);
    } catch (error) {
      console.error("❌ Error fetching expense data:", error);
    }
  };

  useEffect(() => {
    fetchExpenseData();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setSelectedDate({ month: parseInt(month), year: parseInt(year) });
  };

  return (
    <div className="flex flex-col px-10 mb-[180px] gap-[50px]">
      {/* Date Selector */}
      <div className="w-full flex justify-start">
        <label className="text-lg font-semibold text-blue-950 mt-[26px]">Choose Month:</label>
        <input
          type="month"
          value={`${selectedDate.year}-${selectedDate.month.toString().padStart(2, "0")}`}
          onChange={handleDateChange}
          className="ml-4 px-4 py-2 border-2 border-blue-950 rounded-lg shadow-md 
                    text-lg text-blue-950 cursor-pointer transition-all duration-300 
                    focus:ring-2 focus:ring-blue-500 focus:outline-none 
                    hover:border-blue-700 hover:shadow-lg mt-[20px]"
        />
      </div>

      {/* Main Bar Graph & Expense Cards */}
      <div className="flex justify-center gap-12">
        {/* Main Graph Section */}
        <div className="w-[600px] h-[400px]">
          <BarGraph 
            width="600px" 
            height="400px" 
            actualExpense={values.actualExpense} 
            expectedExpense={values.expectedExpense} 
          />
        </div>

        {/* Expense Cards */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-5 text-blue-950">Total Expense</h2>
          <div className="flex gap-8">
            {/* Actual Expense Card */}
            <div className="relative border-2 border-blue-950 rounded-lg p-6 w-44 text-center">
              <p className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-blue-950 text-sm">
                Actual Exp
              </p>
              <p className="text-3xl font-bold text-blue-950">
                {values.actualExpense.toLocaleString()} Lakh
              </p>
            </div>

            {/* Expected Expense Card */}
            <div className="relative border-2 border-blue-950 rounded-lg p-6 w-44 text-center">
              <p className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-blue-950 text-sm">
                Expected Exp
              </p>
              <p className="text-3xl font-bold text-blue-950">
                {values.expectedExpense.toLocaleString()} Lakh
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Head-wise Expense Section */}
      <div className="text-2xl font-bold mb-5 text-blue-950 mt-1.5 ml-[41%]">
        Head Wise Expense :
      </div>

      {/* 9 Head-wise Graphs */}
      <div className="grid grid-cols-3 gap-6 -mt-[15px]">
        {headwiseData.map((head, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-center">{head.head_name}</h3>
            <div className="border-t-2 border-blue-950 my-2"></div>
            {/* Individual Graphs */}
            <BarGraph 
              width="250px" 
              height="200px" 
              actualExpense={head.actual_cost / 100000} 
              expectedExpense={head.expected_cost / 100000} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;