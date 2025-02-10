import { useState } from "react";
import BarGraph from "./BarGraph";

const Dashboard = () => {
  const [values, setValues] = useState({ actualExpense: 100000, expectedExpense: 251000 });

  return (
    <div className="flex  px-10 mb-[180px] mr-[400px] gap-[100px]">
      <div className="w-[500px] h-[400px] -ml-[300px]">
        <BarGraph width="600px" height="400px" setValues={setValues} />
      </div>

      {/* Expense Section */}
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-5 -mr-[800px] text-blue-950">Total Expense</h2>

        <div className="flex gap-8 -mr-[800px] mt-[60px]">
          {/* Actual Expense Card */}
          <div className="relative border-2 border-blue-950 rounded-lg p-6 w-44 text-center">
            <p className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-blue-950 text-sm">
              Actual Exp
            </p>
            <p className="text-3xl font-bold text-blue-950">
              {values.actualExpense.toLocaleString()+"Lakh"}
            </p>
          </div>

          {/* Expected Expense Card */}
          <div className="relative border-2 border-blue-950 rounded-lg p-6 w-44 text-center">
            <p className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-2 text-blue-950 text-sm">
              Expected Exp
            </p>
            <p className="text-3xl font-bold text-blue-950">
              {values.expectedExpense.toLocaleString()+"Lakh"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
