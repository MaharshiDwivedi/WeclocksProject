import { useState, useEffect } from "react";
import BarGraph from "./BarGraph";
import axios from "axios";

const Dashboard = () => {
  const [values, setValues] = useState({ actualExpense: 1, expectedExpense: 1.9 });
  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear() // Current year
  });

  // Function to fetch expense data
  const fetchExpenseData = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/expenceData", {
        month: selectedDate.month.toString(),
        year: selectedDate.year.toString(),
        
      });

      // Assuming the response data structure matches your API
      const totalActual = response.data.data.reduce((sum, head) => 
        sum + (head.andajit_kharch || 0), 0);
      const totalExpected = response.data.data.reduce((sum, head) => 
        sum + (head.prateksh_kelela_kharch || 0), 0);

      // Convert to Lakhs
      setValues({
        actualExpense: totalActual / 100000,
        expectedExpense: totalExpected / 100000
      });
    } catch (error) {
      console.error("Error fetching expense data:", error);
    }
  };

  // Effect to fetch data when date changes
  useEffect(() => {
    fetchExpenseData();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const [year, month] = e.target.value.split("-");
    setSelectedDate({
      month: parseInt(month),
      year: parseInt(year)
    });
  };

  return (
    <div className="flex flex-col px-10 mb-[180px] mr-[400px] gap-[100px]">
      {/* Date Selector */}
      <div className="w-full flex justify-start -ml-[300px] mt-[40px] -pb-[300px]">
        <input
          type="month"
          value={`${selectedDate.year}-${selectedDate.month.toString().padStart(2, '0')}`}
          onChange={handleDateChange}
          className="p-2 border border-blue-950 rounded-lg"
        />
      </div>

      <div className="flex gap-[100px]">
        {/* Graph Section */}
        <div className="w-[500px] h-[400px] -ml-[300px]">
          <BarGraph 
            width="600px" 
            height="400px" 
            actualExpense={values.actualExpense} 
            expectedExpense={values.expectedExpense} 
          />
        </div>

        {/* Expense Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-5 -mr-[800px] text-blue-950">
            Total Expense
          </h2>

          <div className="flex gap-8 -mr-[800px] mt-[60px]">
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
    </div>
  );
};

export default Dashboard;