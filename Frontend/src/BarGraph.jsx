import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarGraph = ({ width, height, actualExpense, expectedExpense }) => {
  const data = {
    labels: ["Total Expense"],
    datasets: [
      {
        label: "Actual Expense",
        data: [actualExpense],
        backgroundColor: "green",
      },
      {
        label: "Expected Expense",
        data: [expectedExpense],
        backgroundColor: "gray",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          callback: (value) => `${value} Lakh`,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  return (
    <div style={{ width, height }}>
      <h2 className="text-2xl font-bold text-blue-950">Total SMC Expense</h2><br/>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarGraph;
