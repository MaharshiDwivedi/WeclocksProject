import { useState, useEffect } from "react"
import BarGraph from "./BarGraph"
import axios from "axios"
import { Card, CardContent } from "@mui/material"
import { MonthPicker, MonthInput } from "react-lite-month-picker"
import { useTranslation } from "react-i18next"


const Dashboard = () => {
  const { t } = useTranslation()  

  const [values, setValues] = useState({
    actualExpense: 0,
    expectedExpense: 0,
  })
  const [headwiseData, setHeadwiseData] = useState([])

  const [selectedDate, setSelectedDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const formatNumber = (value) => {
    let numericValue, unit

    if (value === 0) {
      numericValue = "0"
      unit = t("lakh")
    } else if (value >= 100000) {
      numericValue = (value / 100000).toFixed(2)
      unit = t("lakh")
    } else if (value >= 1000) {
      numericValue = (value / 1000).toFixed(2)
      unit = "K"
    } else {
      numericValue = value.toString()
      unit = ""
    }

    return (
      <div className="flex flex-col items-center">
        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-950 realfont2">{numericValue}</span>
        {unit && <span className="text-base md:text-lg text-blue-950 realfont realfont2">{unit}</span>}
      </div>
    )
  }

  const fetchExpenseData = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/expenceData", {
            month: selectedDate.month.toString(),
            year: selectedDate.year.toString(),
            category_id: "4",
            school_id: "14",
        });

        if (!response.data || !Array.isArray(response.data.data)) {
            console.error("❌ API response is not an array:", response.data);
            return;
        }

        const expenseData = response.data.data;

        // ✅ Log each item received to check actual_cost values
        expenseData.forEach((head, index) => {
            console.log(`🟢 Head ${index}:`, head);
        });

        const totalActual = expenseData.reduce((sum, head) => sum + (Number.parseFloat(head.actual_cost) || 0), 0);
        const totalExpected = expenseData.reduce((sum, head) => sum + (Number.parseFloat(head.expected_cost) || 0), 0);

        console.log("✅ Total Actual Expense Calculated:", totalActual);
        console.log("✅ Total Expected Expense Calculated:", totalExpected);

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
    fetchExpenseData()
  }, [selectedDate])

  return (
    <div className="flex flex-col px-2 sm:px-4 md:px-6 lg:px-10 py-4 md:py-6 min-h-screen gap-4 md:gap-8 shadow-sm">
      {/* Date Picker */}
      <div className="w-full flex items-center justify-between">
  <div className="relative transform origin-left realfont scale-90 md:scale-95">
    <MonthInput
      selected={selectedDate}
      setShowMonthPicker={setIsPickerOpen}
      showMonthPicker={isPickerOpen}
      className="px-0.2 py-0 border bg-white border-blue-950 rounded-sm shadow-sm text-[7px] md:text-[8px] text-blue-950 cursor-pointer transition-all duration-300 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-blue-700 hover:shadow-md realfont"
    />
    {isPickerOpen && (
      <MonthPicker
        setIsOpen={setIsPickerOpen}
        selected={selectedDate}
        onChange={setSelectedDate}
        className="absolute top-full left-0 mt-0.5 z-50 scale-70 md:scale-65 font-realfont"
      />
    )}
  </div>
</div>


      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-6 bg-gradient-to-br from-neutral-50 to-neutral-300 rounded-[10px] p-7 shadow-md">
        {/* Bar Graph */}
        <div className="w-full lg:w-[60%] h-[300px] md:h-[400px] bg-white shadow-lg rounded-lg overflow-hidden">
          <BarGraph
            width="100%"
            height="100%"
            actualExpense={values.actualExpense}
            expectedExpense={values.expectedExpense}
          />
        </div>

        {/* Total Expense Cards */}
        <div className="flex flex-col items-center w-full lg:w-[40%] lg:ml-0">
          <h2 className="text-xl md:text-2xl font-bold text-blue-950 realfont2">{t("totalExpense")}</h2>
          <div className="flex flex-col gap-4 md:gap-6 p-4 rounded-lg w-full max-w-xs">
            <Card
              variant="outlined"
              sx={{
                width: "100%",
                transition: "transform 0.2s, box-shadow 0.3s",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                background: "white",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 15px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="text-center text-blue-950 text-base md:text-lg realfont font-semibold">
                  {t("actualExpense")}
                </div>
                <div className="mt-3">{formatNumber(values.actualExpense)}</div>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{
                width: "100%",
                transition: "transform 0.2s, box-shadow 0.3s",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                background: "white",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 15px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="text-center text-blue-950 text-base md:text-lg realfont font-semibold">
                  {t("expectedExpense")}
                </div>
                <div className="mt-3">{formatNumber(values.expectedExpense)}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Head Wise Expense Section */}
      <div className="mt-6 rounded-[10px] p-3 md:p-5 bg-gradient-to-br from-neutral-50 to-neutral-300 shadow-md">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-950 text-center mb-4 md:mb-6 realfont2">
          {t("headwiseExpense")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {headwiseData.length > 0 ? (
            headwiseData.map((head, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  transition: "transform 0.2s, box-shadow 0.3s",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%)",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: "0 8px 15px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="text-center text-blue-950 font-semibold text-base md:text-lg mb-2">
                    {head.head_name}
                  </div>
                  <div className="border-t-2 border-blue-950 my-2"></div>
                  <div className="w-full h-[150px] md:h-[200px]">
                    <BarGraph
                      width="100%"
                      height="100%"
                      actualExpense={Number.parseFloat(head.actual_cost) || 0}
                      expectedExpense={Number.parseFloat(head.expected_cost) || 0}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-blue-950 text-lg p-8 bg-white rounded-lg shadow-inner">
              No head-wise data available for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard