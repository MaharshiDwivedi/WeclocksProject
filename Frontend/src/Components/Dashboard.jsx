import { useState, useEffect } from "react";
import BarGraph from "./BarGraph";
import axios from "axios";
import { Card, CardContent } from "@mui/material";

const Dashboard = () => {
  const [values, setValues] = useState({
    actualExpense: 0,
    expectedExpense: 0,
  });
  const [headwiseData, setHeadwiseData] = useState([]);

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const formatNumber = (value) => {
    let numericValue, unit;

    if (value === 0) {
      numericValue = "0";
      unit = "Lakh";
    } else if (value >= 100000) {
      numericValue = (value / 100000).toFixed(2);
      unit = "Lakh";
    } else if (value >= 1000) {
      numericValue = (value / 1000).toFixed(2);
      unit = "K";
    } else {
      numericValue = value.toString();
      unit = "";
    }

    // Return JSX with number and unit stacked vertically
    return (
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-blue-950 realfont2">{numericValue}</span>
        {unit && <span className="text-lg text-blue-950 realfont realfont2">{unit}</span>}
      </div>
    );
  };

  const fetchExpenseData = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/expenceData",
        {
          month: selectedDate.month.toString(),
          year: selectedDate.year.toString(),
          category_id: "4",
          school_id: "14",
        }
      );

      if (!response.data || !Array.isArray(response.data.data)) {
        console.error("❌ API response is not an array:", response.data);
        return;
      }

      const expenseData = response.data.data;
      const totalActual = expenseData.reduce(
        (sum, head) => sum + (parseFloat(head.actual_cost) || 0),
        0
      );
      const totalExpected = expenseData.reduce(
        (sum, head) => sum + (parseFloat(head.expected_cost) || 0),
        0
      );

      setValues({
        actualExpense: Number(totalActual),
        expectedExpense: Number(totalExpected),
      });
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
    <div className="flex flex-col px-4 md:px-10 py-6 min-h-screen gap-8 bgcolor shadow-sm">
      {/* Date Picker */}
      <div className="w-full flex items-center justify-start">
        <label className="text-lg font-semibold text-blue-950 mr-4 realfont2">
          Choose Month:
        </label>
        <input
          type="month"
          value={`${selectedDate.year}-${selectedDate.month
            .toString()
            .padStart(2, "0")}`}
          onChange={handleDateChange}
          className="px-4 py-2 border-2 border-blue-950 rounded-lg shadow-sm text-lg text-blue-950 cursor-pointer transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-blue-700 hover:shadow-md realfont"
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row justify-center items-start gap-6">
        {/* Bar Graph */}
        <div className="w-full md:w-[45vw] h-[400px] bg-white shadow-lg rounded-lg overflow-hidden">
          <BarGraph
            width="100%"
            height="400px"
            actualExpense={values.actualExpense}
            expectedExpense={values.expectedExpense}
          />
        </div>

        {/* Total Expense Cards */}
        <div className="flex flex-col items-center w-full ml-10 md:w-auto">
          <h2 className="text-2xl font-bold text-blue-950  realfont2">
            Total Expense
          </h2>
          <div className="flex flex-col gap-6 p-4 rounded-lg ">
            <Card
              variant="outlined"
              sx={{
                width: 250,
                transition: "transform 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent className="p-6">
                <div className="text-center text-blue-950 text-lg realfont">
                  Actual Expense
                </div>
                <div className="mt-3">
                  {formatNumber(values.actualExpense)}
                </div>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                width: 250,
                transition: "transform 0.2s",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent className="p-6">
                <div className="text-center text-blue-950 text-lg realfont">
                  Expected Expense
                </div>
                <div className="mt-3">
                  {formatNumber(values.expectedExpense)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Head Wise Expense Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-blue-950 text-center mb-6 realfont2">
          Head Wise Expense
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {headwiseData.length > 0 ? (
            headwiseData.map((head, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  transition: "transform 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent className="p-4">
                  <div className="text-center text-blue-950 font-semibold text-lg mb-2">
                    {head.head_name}
                  </div>
                  <div className="border-t-2 border-blue-950 my-2"></div>
                  <div className="w-full h-[200px]">
                    <BarGraph
                      width="100%"
                      height="200px"
                      actualExpense={parseFloat(head.actual_cost) || 0}
                      expectedExpense={parseFloat(head.expected_cost) || 0}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-blue-950 text-lg">
              No head-wise data available for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;