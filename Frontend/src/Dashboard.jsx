import { useState, useEffect } from "react";
import BarGraph from "./BarGraph";
import axios from "axios";

const Dashboard = () => {
  const [values, setValues] = useState({ actualExpense: 1, expectedExpense: 1.9 });

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear() // Current year
  });

  
  const fetchExpenseData = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/expenceData", {
        month: selectedDate.month.toString(),
        year: selectedDate.year.toString(),
      });
  
      console.log("API Response:", response.data); // Debugging
  
      // Extract values from response
      const totalActual = response.data.reduce(
        (sum, head) => sum + (parseFloat(head.andajit_kharch) || 0),
        0
      );
      const totalExpected = response.data.reduce(
        (sum, head) => sum + (parseFloat(head.prateksh_kelela_kharch) || 0),
        0
      );
  
      // Convert to Lakhs and update state
      setValues({
        actualExpense: totalActual / 100000,
        expectedExpense: totalExpected / 100000,
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
    <div className="flex flex-col px-10 mb-[180px] gap-[50px]">
      {/* Date Selector */}
      <div className="w-full flex justify-start">
        <input
          type="month"
          value={`${selectedDate.year}-${selectedDate.month.toString().padStart(2, "0")}`}
          onChange={handleDateChange}
          className="p-2 border border-blue-950 rounded-lg"
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
          <h2 className="text-2xl font-bold mb-5 text-blue-950">
            Total Expense
          </h2>

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

      {/* 9 Small Graphs Section */}
      <div className="grid grid-cols-3 gap-6">
        {[
          "शैक्षणिक बाबी",
          "पाणी स्वच्छता इ. बाबी",
          "सुरक्षितता",
          "किचन अन्न व पोषण",
          "आरोग्य तपासण्या",
          "आजारपण व अपघात",
          "क्रीडा व कला",
          "शाळेचे शुशोभीकरण",
          "अन्य खर्च",
        ].map((title, index) => (
          <div key={index} className="p-4 border rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-center">{title}</h3>
            <div className="border-t-2 border-blue-950 my-2"></div>
            {/* Placeholder for Graphs */}
            <div className="h-40 flex items-center justify-center text-gray-500">
              Graph Placeholder
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
