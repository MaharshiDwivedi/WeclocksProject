import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Users, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import SkeletonLoader from "./SkeletonLoader";

export default function AbsentMembers() {
  const { t } = useTranslation();
  const [absentMembers, setAbsentMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchAbsentMembers();
  }, []);

  const fetchAbsentMembers = async () => {
    try {
      setLoading(true);

      const schoolId = localStorage.getItem("school_id");
      if (!schoolId) {
        console.error("School ID not found");
        return;
      }

      const meetingsResponse = await fetch(
        `http://localhost:5000/api/meeting?school_id=${schoolId}`
      );
      const meetingsData = await meetingsResponse.json();

      const sortedMeetings = meetingsData
        .sort((a, b) => new Date(b.meeting_date) - new Date(a.meeting_date))
        .slice(0, 3);

      const attendedMemberIds = new Set();
      sortedMeetings.forEach((meeting) => {
        if (meeting.member_id) {
          meeting.member_id.split(",").forEach((id) => attendedMemberIds.add(id.trim()));
        }
      });

      const membersResponse = await fetch("http://localhost:5000/api/member");
      const membersData = await membersResponse.json();

      const absentMembersData = membersData
        .filter((member) => {
          const memberId = member.member_id.toString();
          const recordData = member.member_record.split("|");
          const memberSchoolId = recordData[4];
          return memberSchoolId === schoolId && !attendedMemberIds.has(memberId);
        })
        .map((member) => {
          const recordData = member.member_record.split("|");
          return {
            name: recordData[0] || "N/A",
            mobile: recordData[1] || "N/A",
            representative: recordData[2] || "N/A",
            cast: recordData[3] || "N/A",
            designation: recordData[8] || "N/A",
            gender: recordData[9] || "N/A",
            year: recordData[10] || "N/A",
          };
        });

      setAbsentMembers(absentMembersData);
      setFilteredMembers(absentMembersData);
    } catch (error) {
      console.error("Error fetching absent members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = searchTerm
      ? absentMembers.filter((member) =>
          Object.values(member).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      : absentMembers;
    setFilteredMembers(filtered);
  }, [searchTerm, absentMembers]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const columns = [
    {
      name: t("Sr. No."),
      selector: (row, index) => index + 1,
      sortable: false,
      width: "80px",
      hide: "sm",
    },
    {
      name: t("name"),
      selector: (row) => row.name,
      sortable: true,
      minWidth: "120px",
      wrap: true,
      cell: (row) => (
        <div
          className="py-2 truncate max-w-[100px] sm:max-w-[150px] md:max-w-full"
          title={row.name}
        >
          {row.name}
        </div>
      ),
    },
    {
      name: t("mobile"),
      selector: (row) => row.mobile,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: t("representative"),
      selector: (row) => row.representative,
      sortable: true,
      minWidth: "150px",
      cell: (row) => (
        <div
          className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px] lg:max-w-full"
          title={row.representative}
        >
          {row.representative}
        </div>
      ),
    },
    {
      name: t("designation"),
      selector: (row) => row.designation,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: t("gender"),
      selector: (row) => row.gender,
      sortable: true,
      minWidth: "60px",
    },
    {
      name: t("year"),
      selector: (row) => row.year,
      sortable: true,
      minWidth: "80px",
    },
    {
      name: t("cast"),
      selector: (row) => row.cast,
      sortable: true,
      minWidth: "70px",
    },
  ];


  if (loading) {
    return <SkeletonLoader />;
  }
  

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-10">
      <div className="bg-white shadow-lg rounded-[14px] overflow-hidden">
        <div className="bg-blue-950 text-white p-3 md:p-4 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold realfont2 flex items-center gap-2">
            <Users size={isMobile ? 16 : 18} />
            {t("Absentmember")}
          </h2>
        </div>

        <div className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="relative flex-grow max-w-full sm:max-w-[300px]">
            <input
              type="text"
              placeholder={t("Search")}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left transition-all duration-200"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
          <div className="text-base sm:text-md md:text-md text-gray-600 font-medium">
            {t("totalAbsentMembers")} :{""}
            <span className="text-blue-950 font-bold px-2">
              {filteredMembers.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredMembers}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            defaultSortFieldId={1}
            progressPending={loading}
            className="realfont"
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: "#f3f4f6",
                  fontSize: "16px",
                  fontWeight: "600",
                  justifyContent: "center",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                },
              },
              cells: {
                style: {
                  fontSize: "14px",
                  color: "#333",
                  justifyContent: "center",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  fontFamily: "Poppins",
                  fontWeight: "400",
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
            }}
          />
        </div>

        {filteredMembers.length === 0 && !loading && (
          <div className="text-center p-4 md:p-8 text-gray-500">
            {t("noAbsentMembersFound")}
          </div>
        )}
      </div>
    </div>
  );
}