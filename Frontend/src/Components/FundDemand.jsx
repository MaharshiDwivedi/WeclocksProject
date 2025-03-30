"use client";

import { useState, useEffect } from "react";
import { Check, X, AlertCircle, Search, IndianRupee} from "lucide-react";
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

  const fetchDemands = async () => {
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: t("error"),
        text: t("Failed to fetch demands"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

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
        } catch (error) {
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
    } catch (error) {
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
          className={`px-2 py-1 rounded-full text-xs`}
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
                className="text-green-600 px-3 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors font2 sm:text-sm text-center"
                title={t("Accept")}
              >
                {t("Accept")}
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="text-red-600 px-3 py-2 rounded-md hover:bg-red-600 hover:text-white transition-colors font2  sm:text-sm text-center"
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
    <div className="px-2 sm:px-4 py-3 md:py-6 realfont">
      <div className="bg-white shadow-md rounded-[4px] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-950 text-white px-3 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 realfont2">
          <h2 className="flex items-center gap-1 sm:gap-2 sm:text-lg md:text-lg font-bold font2">
            <IndianRupee size={isMobile ? 16 : 18}  />
            {t("Demand Management")}
          </h2>
        </div>

        <div className="px-2 sm:px-2 py-1 flex flex-col sm:flex-row gap-2 sm:gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64 md:w-[250px] text-base sm:text-md md:text-md py-1">
            <input
              type="text"
              placeholder={t("search")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-7 sm:pl-8 pr-3 sm:pr-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-6 sm:h-8 text-base sm:text-lg md:text-md"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={isMobile ? 14 : 16}
            />
          </div>
          <div className="text-base sm:text-md md:text-md text-gray-600 font-medium">
            {t("Total Demands")} :{" "}
            <span className="text-blue-950 font-bold px-2">
              {filteredDemands.length}
            </span>
          </div>
        </div>

        {/* Table container with horizontal scrolling */}
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
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
                  backgroundColor: "#eceef1",
                  fontWeight: "600",
                  fontFamily: "Montserrat",
                  justifyContent: "center",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  borderRight: "1px solid #f0f0f0",
                  fontSize: "16px",
                },  
              },
              cells: {
                style: {
                  fontFamily: "Poppins",
                  color: "#333",
                  justifyContent: "center",
                  paddingLeft: "2px",
                  paddingRight: "2px",
                  borderRight: "1px solid #f9f9f9",
                  fontSize: "14px",
                },
              },
              rows: {
                
                stripedStyle: {
                  backgroundColor: "#f8f9fa",
                },
              },
              pagination: {
                style: {
                  fontSize: "13px",
                  minHeight: "56px",
                  borderTopStyle: "solid",
                  borderTopWidth: "1px",
                  borderTopColor: "#f3f4f6",
                },
              },
              table: {
                style: {
                  width: "100%",
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
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-[95vw] md:max-w-[850px] max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-indigo-900 flex items-center">
                {t("Reject Reason")}
              </h2>
              <button
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectReason("");
                  setErrors({});
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-100"
              >
                <X size={isMobile ? 16 : 18} />
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-6">
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
