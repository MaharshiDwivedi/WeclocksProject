"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertCircle, Search, IndianRupee} from "lucide-react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

const FundDemand = () => {
  const [demands, setDemands] = useState([]);
  const [filteredDemands, setFilteredDemands] = useState([]);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedDemandId, setSelectedDemandId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDemands = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/fundreqhm");
      const formattedDemands = response.data.map((request) => {
        const recordData = request.demand_master_record.split("|");
        return {
          id: request.demand_master_id,
          school_name: request.school_name || "N/A",
          demandedDate: recordData[1] || "N/A",
          amount: recordData[2] || "N/A",
          status: request.demand_status,
        };
      });
      setDemands(formattedDemands);
      setFilteredDemands(formattedDemands);
    } catch {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("Failed to fetch demands"),
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDemands();
  }, [fetchDemands]);

  // Search functionality
  useEffect(() => {
    const filtered = searchTerm
      ? demands.filter((demand) =>
          Object.values(demand).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      : demands;
    setFilteredDemands(filtered);
  }, [searchTerm, demands]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleAccept = async (demandId) => {
    Swal.fire({
      title: t("Are you sure?"),
      text: t("Do you want to accept this demand?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes, Accept"),
      cancelButtonText: t("Cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `http://localhost:5000/api/fundreqhm/accept/${demandId}`
          );
          Swal.fire({
            icon: "success",
            title: t("Accepted"),
            text: t("Demand accepted successfully"),
            timer: 1500,
          });
          fetchDemands();
        } catch {
          Swal.fire({
            icon: "error",
            title: t("Error"),
            text: t("Failed to accept demand"),
          });
        }
      }
    });
  };

  const handleReject = (demandId) => {
    setSelectedDemandId(demandId);
    setIsRejectModalOpen(true);
  };

  const submitRejectReason = async () => {
    if (!rejectReason.trim()) {
      setErrors({ reason: t("Reason is required") });
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/fundreqhm/reject/${selectedDemandId}`,
        { reason: rejectReason }
      );
      Swal.fire({
        icon: "success",
        title: t("Rejected"),
        text: t("Demand rejected successfully"),
        timer: 1000,
      });
      fetchDemands();
      setIsRejectModalOpen(false);
      setRejectReason("");
      setErrors({});
    } catch {
      Swal.fire({
        icon: "error",
        title: t("Error"),
        text: t("Failed to reject demand"),
      });
    }
  };

  const columns = [
    {
      name: t("Sr. No."),
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
      compact: true,
    },
    {
      name: t("School Name"),
      selector: (row) => row.school_name,
      sortable: true,
      minWidth: "200px",
      cell: (row) => (
        <div
          className="py-2 truncate max-w-[150px] sm:max-w-full"
          title={row.school_name}
        >
          {row.school_name}
        </div>
      ),
    },
    {
      name: t("Demanded Date"),
      selector: (row) => row.demandedDate,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: t("Amount"),
      selector: (row) => `₹ ${row.amount}`,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: t("status"),
      selector: (row) => row.status,
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-md`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: t("Action"),
      cell: (row) => (  
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 sm:py-2">
          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleAccept(row.id)}
                className="text-green-600 px-3 py-2 cursor-pointer rounded-md hover:bg-green-600 hover:text-white transition-colors font2 sm:text-sm text-center"
                title={t("Accept")}
              >
                {t("Accept")}
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="text-red-600 px-3 cursor-pointer py-2 rounded-md hover:bg-red-600 hover:text-white transition-colors font2  sm:text-sm text-center"
                title={t("Reject")}
              >
                {t("Reject")}
              </button>
            </>
          )}
        </div>
      ),
      minWidth: "120px",
      allowOverflow: true,
    },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10 realfont">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-1 sm:gap-2">
            <IndianRupee size={isMobile ? 16 : 18} />
            {t("Demand Management")}
          </h2>
        </div>

        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="relative w-full sm:w-[300px]">
            <input
              type="text"
              placeholder={t("search")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="text-base sm:text-md md:text-md text-gray-600 font-medium">
            {t("Total Demands")} : <span className="text-blue-950 font-bold px-2">{filteredDemands.length}</span>
          </div>
        </div>

        {/* Table container with horizontal scrolling */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredDemands}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            defaultSortFieldId={1}
            progressPending={loading}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#f3f4f6",
                  fontSize: "14px",
                  fontWeight: "600",
                  fontFamily: "Poppins",
                  justifyContent: "center",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  borderRight: "1px solid rgba(229, 231, 235, 0.5)",
                  borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  fontFamily: "Poppins",
                  color: "#333",
                  justifyContent: "center",
                  paddingLeft: "6px",
                  paddingRight: "6px",
                  borderRight: "1px solid rgba(229, 231, 235, 0.5)",
                  borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
                },
              },
              rows: {
                style: {
                  fontSize: "14px",
                  fontFamily: "Poppins",
                },
                stripedStyle: {
                  backgroundColor: "rgba(249, 250, 251, 0.5)",
                },
              },
              pagination: {
                style: {
                  fontSize: "14px",
                  minHeight: "56px",
                  borderTopStyle: "solid",
                  borderTopWidth: "1px",
                  borderTopColor: "rgba(229, 231, 235, 0.5)",
                  fontWeight:500,
                },
              },
              table: {
                style: {
                  border: "1px solid rgba(229, 231, 235, 0.5)",
                },
              },
            }}
          />
        </div>

        {filteredDemands.length === 0 && !loading && (
          <div className="text-center p-4 md:p-8 text-gray-500">
            {t("No demands found")}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center">
                {t("Reject Reason")}
              </h2>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                  setErrors({});
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 sm:mb-1.5 text-gray-700">
                  {t("Reason")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className={`w-full p-2 sm:p-2.5 border ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm h-24 text-sm sm:text-base`}
                  placeholder={t("Enter reason here...")}
                />
                {errors.reason && (
                  <p className="text-red-500 text-xs mt-1 sm:mt-1.5 flex items-center">
                    <AlertCircle className="mr-1" size={12} /> {errors.reason}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectReason("");
                    setErrors({});
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={submitRejectReason}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t("Submit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundDemand;
