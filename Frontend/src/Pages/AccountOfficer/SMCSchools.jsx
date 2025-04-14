import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";

const SMCSchools = () => {
  const [schools, setSchools] = useState([]);
  const [meetingschool, setSchoolmeeting] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const meetingvar = schools.map((data) => data);
  const fetchtotalmeeting = meetingschool.map((data) => String(data.school_id)); 

  // Filter meetingvar based on school_id existence in fetchtotalmeeting
  const totalmeetingdata = meetingvar.filter((data) => fetchtotalmeeting.includes(String(data.school_id)));
  
  console.log("Filtered Meeting Data:", totalmeetingdata);

  useEffect(() => {
    let mounted = true;
    const fetchSchools = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/schools-with-smc",

          {
            timeout: 5000, // Add timeout to prevent hanging
          }
        );

        if (mounted) {
          setSchools(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error fetching schools:", err);
          setError(err.response?.data?.message || "Failed to fetch schools");
          setLoading(false);
        }
      }
    };
    fetchSchools();
    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    let mounted = true;
    const fetchSchoolsmeeting = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/meeting/meetingall",

          {
            timeout: 5000, // Add timeout to prevent hanging
          }
        );

        if (mounted) {
          setSchoolmeeting(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error fetching schools:", err);
          setError(err.response?.data?.message || "Failed to fetch schools");
          setLoading(false);
        }
      }
    };
    fetchSchoolsmeeting();
    // Cleanup function to prevent memory leaks
    return () => {
      mounted = false;
    };
  }, []);

  // Define columns for DataTable
  const columns = [
    {
      name: t("schoolId"),
      selector: (row) => row.school_id,
      sortable: true,
    },
    {
      name: t("schoolName"),
      selector: (row) => row.school_name,
      sortable: true,
      wrap: true,
      grow: 2,
    },
  ];



  const smcWithSchool = schools
  .filter((data) => fetchtotalmeeting.includes(String(data.school_id)))
  .map((school) => school.school_name);

const smcWithoutSchool = schools
  .filter((data) => !fetchtotalmeeting.includes(String(data.school_id)) && !data.smc)
  .map((school) => school.school_name);

// Making sure both lists are of the same length
const maxLength = Math.max(smcWithSchool.length, smcWithoutSchool.length);

// Filling the table row by row
const formattedSmcData = Array.from({ length: maxLength }, (_, index) => ({
  smc_with_school: smcWithSchool[index] || "", // Fill empty rows with ""
  smc_without_school: smcWithoutSchool[index] || "", // Fill empty rows with ""
}));
  
  

  // Define columns for DataTable (Second Table)
  const smcColumns = [
    {
      name: t("smc School list"),
      selector: (row) => row.smc_with_school,
      sortable: true,
      wrap: true, //Added wrap
      grow: 2, //Added grow
    },
    {
      name: t("smc Not Done School List"),
      selector: (row) => row.smc_without_school,
      sortable: true,
      wrap: true, //Added wrap
      grow: 2, //Added grow
    },
  ];

  // Custom styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f9fafb",
        borderBottom: "1px solid #e5e7eb",
        minHeight: "56px",
      },
    },
    headCells: {
      style: {
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#6b7280",
        textTransform: "uppercase",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        letterSpacing: "0.025em",
      },
    },
    rows: {
      style: {
        minHeight: "48px",
        "&:hover": {
          backgroundColor: "#f3f4f6",
          transition: "all 0.2s ease-in-out",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem",
        fontSize: "0.95rem",
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-center p-8 max-w-2xl mx-auto">
        <div className="text-xl mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-sm"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  // Empty state
  if (schools.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 text-xl">
        {t("no Schools Found")}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1920px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-20">
        {/* First Table */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-bold mb-6 realfont2 text-gray-800">
            {t("Schools with SMC Meetings")}
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <DataTable
              columns={columns}
              data={schools}
              customStyles={customStyles}
              pagination
              highlightOnHover
              responsive
              striped
              noHeader
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30]}
            />
          </div>
        </div>

        {/* Second Table */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-2xl font-bold mb-6 realfont2 text-gray-800">
            {t("Schools Enroll or not Enrolled Schools")}
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <DataTable
              columns={smcColumns}
              data={formattedSmcData}
              customStyles={customStyles}
              pagination
              highlightOnHover
              responsive
              striped
              noHeader
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SMCSchools;
