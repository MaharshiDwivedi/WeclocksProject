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
import { useTranslation } from "react-i18next";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarGraph = ({ width, height, actualExpense, expectedExpense  }) => {
  const [maxScale, setMaxScale] = useState(1000000); // Default 0L - 10L
  const [stepSize, setStepSize] = useState(200000); // Default 2L step
  const [unit, setUnit] = useState("L");

  // ✅ Ensure values are valid
  const actual = actualExpense || 0;
  const expected = expectedExpense || 0;

  const { t } = useTranslation();

  useEffect(() => {
    const maxValue = Math.max(actual, expected);

    if (maxValue === 0) {
      // Default scale when values are 0
      setMaxScale(1000000);
      setStepSize(200000);
      setUnit("L");
    } else if (maxValue < 10000) {
      setMaxScale(10000);
      setStepSize(2000);
      setUnit("K");
    } else if (maxValue <= 50000) {
      setMaxScale(100000);
      setStepSize(20000);
      setUnit("K");
    } else if (maxValue <= 1000000) {
      setMaxScale(1000000);
      setStepSize(200000);
      setUnit("L");
    } else if (maxValue <= 10000000) {
      setMaxScale(10000000);
      setStepSize(2000000);
      setUnit("L");
    } else {
      setMaxScale(100000000);
      setStepSize(20000000);
      setUnit("L");
    }
  }, [actual, expected]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: maxScale,
        ticks: {
          stepSize: stepSize,
          callback: (value) =>
            unit === "K" ? `${value / 1000}K` : `${value / 100000}L`,
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
          },
          color: "#555",
        },
      },
      x: {
        ticks: {
          font: {
            family: "'Poppins', sans-serif",
            size: 12,
          },
          color: "#333",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          generateLabels: (chart) => {
            return chart.data.datasets.map((dataset, i) => {
              const text = dataset.label;
              return {
                text,
                fillStyle: dataset.backgroundColor,
                hidden: !chart.isDatasetVisible(i),
                index: i,
                fontColor: "#333",
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                lineWidth: 2,
                lineCap: "round",
                className: "realfont", // ✅ Apply realfont class
              };
            });
          },
          font: {
            family: "'Poppins', sans-serif",
            size: 14,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };




  const data = {
    labels: [t("totalExpense")],
    datasets: [
        {
            label: t("actualExpense"),
            data: [actual],
            backgroundColor: "darkgreen",
        },
        {
            label: t("expectedExpense"),
            data: [expected],
            backgroundColor: "gray",
        },
    ],
};









  return (
    
    <div style={{ width, height } } >
      <Bar data={data} options={options}  />
    </div>
  );
};

export default BarGraph;