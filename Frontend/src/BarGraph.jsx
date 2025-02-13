import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarGraph = ({ width, height, actualExpense, expectedExpense }) => {
  const [chartData, setChartData] = useState({
    labels: ["Total Expense"],
    datasets: [
      { label: "Actual Expense", data: [actualExpense], backgroundColor: "green" },
      { label: "Expected Expense", data: [expectedExpense], backgroundColor: "gray" },
    ],
  });

  useEffect(() => {
    setChartData({
      labels: ["Total Expense"],
      datasets: [
        { label: "Actual Expense", data: [actualExpense], backgroundColor: "green" },
        { label: "Expected Expense", data: [expectedExpense], backgroundColor: "gray" },
      ],
    });
  }, [actualExpense, expectedExpense]);

  return (
    <div style={{ width, height }}>
      <h2 className="text-2xl font-bold text-blue-950">Total SMC Expense</h2>
      <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default BarGraph;
