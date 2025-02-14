import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

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

  // 🔹 Determine max value and unit (Lakhs or Thousands)
  const highestValue = Math.max(actualExpense, expectedExpense) || 1; // Prevent 0
  const isLakh = highestValue >= 1;  // If any value >= 1L, use Lakhs
  const unit = isLakh ? "L" : "K";
  const scaleFactor = isLakh ? 1 : 100;  // If using 'K', multiply by 100

  // 🔹 Convert values based on scale
  const convertedActual = actualExpense * scaleFactor;
  const convertedExpected = expectedExpense * scaleFactor;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Ensure at least 2
        ticks: {
          stepSize: 2, // Always step in 2 units
          callback: (value) => `${value} ${unit}`, // Display correct unit
        },
      },
    },
  };

  return (
    <div style={{ width, height }}>
      <Bar
        data={{
          labels: ["Total Expense"],
          datasets: [
            { label: "Actual Expense", data: [convertedActual], backgroundColor: "green" },
            { label: "Expected Expense", data: [convertedExpected], backgroundColor: "gray" },
          ],
        }}
        options={options}
      />
    </div>
  );
};

export default BarGraph;