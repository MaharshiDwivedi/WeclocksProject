import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CalendarCheck,
  ChartColumnIncreasing,
  CirclePower,
  UsersRound,
  BadgeIndianRupee,
  Menu,
  X,
  ClipboardList,
  DownloadIcon,
} from "lucide-react";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";
import NewMember from "./NewMember";
import Tharav from "./Tharav";
import FundReq from "./FundReq";
import GenerateReport from "./GenerateReport";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Absentmember from "./Absentmember";
import Swal from "sweetalert2";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(16);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { i18n, t } = useTranslation();

  // Enhanced responsive detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      // Auto-close sidebar on larger screens
      if (width >= 768) {
        setSidebarOpen(false);
      }
    };

    handleResize(); // Set initial values
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoized handlers for performance
  const changeLanguage = useCallback(
    (event) => {
      const newLang = event.target.value;
      i18n.changeLanguage(newLang);
      localStorage.setItem("i18nextLng", newLang); // Persist language choice
    },
    [i18n]
  );

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t("yes") || 'Yes',
      cancelButtonText: t("no") || 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    });
  }, [navigate, t]);

  const increaseTextSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Max 24px
  }, []);

  const decreaseTextSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Min 12px
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle clicks outside sidebar (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.querySelector("[data-sidebar-toggle]");
      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // Breadcrumbs logic
  const getBreadcrumbs = useCallback(() => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = [{ name: t("headmaster"), path: "/home" }];
  
    if (pathnames.includes("dashboard")) {
      breadcrumbs.push({ name: t("Dashboard"), path: "/home/dashboard" });
    } else if (pathnames.includes("meetings")) {
      breadcrumbs.push({ name: t("Meetings"), path: "/home/meetings" });
      
      if (pathnames.includes("tharav")) {
        const meetingNumber = pathnames[pathnames.indexOf("tharav") + 1];
        
        // Always add Tharav Management breadcrumb
        breadcrumbs.push({ 
          name: t("tharavManagement"), 
          path: `/home/meetings/tharav/${meetingNumber}`,
          state: location.state
        });
        
        // Only add Remarks breadcrumb if we're actually on the remarks page
        if (pathnames.includes("remarks") && pathnames.indexOf("remarks") === pathnames.length - 1) {
          // For the current Remarks page breadcrumb, make it non-clickable
          breadcrumbs.push({ 
            name: t("remarks"), 
            path: null, // This makes it non-clickable
            current: true
          });
        }
      }
    } else if (pathnames.includes("fundreq")) {
      breadcrumbs.push({ name: t("Fund Requests"), path: "/home/fundreq" });
    } else if (pathnames.includes("newmember")) {
      breadcrumbs.push({
        name: t("committeeMembers"),
        path: "/home/newmember",
      });
    } else if (pathnames.includes("absentmember")) {
      breadcrumbs.push({
        name: t("Absentmember"),
        path: "/home/absentmember",
      });
    }
  
    return breadcrumbs;
  }, [location.pathname, t, location.state]);

  return (
    <div
      className="flex min-h-screen bg-[#E5EAF5]"
      style={{ fontSize: `${fontSize}px` }}
      role="main"
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar"
        className={`w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="w-full h-[45px] bg-blue-200 text-blue-950 text-[22px] text-center font2 flex items-center justify-center overflow-hidden">
          ITDP Nandurbar
        </div>

        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-2 right-2 text-white p-2"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close Sidebar"
        >
          <X size={24} className="text-red-500" />
        </button>

        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont text-sm">
          <NavLink
            to="/home/dashboard"
            label={t("Dashboard")}
            path={location.pathname}
            icon={<ChartColumnIncreasing size={18} />}
          />
          <NavLink
            to="/home/meetings"
            label={t("Meetings")}
            path={location.pathname}
            icon={<CalendarCheck size={18} />}
          />
          <NavLink
            to="/home/newmember"
            label={t("committeeMembers")}
            path={location.pathname}
            icon={<UsersRound size={18} />}
          />
          <NavLink
            to="/home/fundreq"
            label={t("Request Funds")}
            path={location.pathname}
            icon={<BadgeIndianRupee size={18} />}
          />

          <NavLink
            to="/home/absentmember"
            label={t("Absentmember")}
            path={location.pathname}
            icon={<ClipboardList size={18} />}
          />
          <button
            onClick={() => setReportModalOpen(true)}
            className={`flex items-center px-3 py-2 transition-all duration-300 ease-in-out font-medium relative overflow-hidden text-sm ${
              location.pathname === "/aohome/genreport"
                ? "text-blue-950 font-semibold shadow-md rounded-r-[5px]"
                : "text-white hover:bg-gray-700 hover:text-gray-300"
            }`}
          >
            <span
              className={`absolute left-0 top-0 bottom-0 w-2 bg-cyan-400 transition-all duration-300 ${
                location.pathname === "/aohome/genreport"
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
            <span className="relative flex items-center">
              <DownloadIcon size={18} />
              <span className="ml-2">{t("Generate Report")}</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <header className="bg-white p-2 flex justify-between items-center h-[45px] shadow-md sticky top-0 z-30">
          <button
            data-sidebar-toggle
            className="md:hidden flex items-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5 text-blue-950" />
          </button>

          <div className="text-[16px] text-blue-950 font2 ml-5">
            {t("welcome")}, {t("headmaster")}.
          </div>
          <div className="flex items-center gap-1.5 p-2">
            <button
              onClick={increaseTextSize}
              className="flex items-center justify-center gap-1 px-2 py-0.5 text-sm text-neutral-900 rounded hover:bg-neutral-300 h-7 w-8"
              title="Increase text size"
            >
              <span>+A</span>
            </button>
            <button
              onClick={decreaseTextSize}
              className="flex items-center justify-center gap-1 px-2 py-0.5 text-sm text-neutral-900 rounded hover:bg-neutral-300 h-7 w-8"
              title="Decrease text size"
            >
              <span>-A</span>
            </button>
            <div className="navbar">
              <select
                onChange={changeLanguage}
                value={i18n.language}
                className="p-1 border rounded realfont text-xs h-7"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center text-white px-2 py-0.5 rounded-md hover:bg-neutral-300 h-7"
            >
              <CirclePower className="text-red-500" size={20} />
            </button>
          </div>
        </header>

        {/*Breadcrumbs with adjusted margin and font size */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-950 px-6 py-3 shadow-sm font2 mt-5 m-9 rounded-lg">
        <nav className="flex" aria-label="Breadcrumb">
  <ol className="inline-flex items-center text-sm">
    {getBreadcrumbs().map((crumb, index) => (
      <li key={index} className="inline-flex items-center">
        {index > 0 && (
          <span className="mx-2 text-blue-400 font-bold">/ </span>
        )}
        {crumb.path ? (
          <Link
            to={{
              pathname: crumb.path,
              state: crumb.state
            }}
            className={`inline-flex items-center px-2 py-1 rounded-[4px] transition-all duration-200 ${
              index === getBreadcrumbs().length - 1
                ? "bg-blue-950 text-white font-semibold shadow-md cursor-default"
                : "text-blue-700 hover:bg-blue-200 hover:text-blue-900"
            }`}
          >
            {crumb.name}
          </Link>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500 text-white font-semibold shadow-md cursor-default">
            {crumb.name}
          </span>
        )}
      </li>
    ))}
  </ol>
</nav>
        </div>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="meetings/tharav/:index/*" element={<Tharav />} />
            <Route path="newmember" element={<NewMember />} />
            <Route path="fundreq" element={<FundReq />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
            <Route path="absentmember" element={<Absentmember />} />
          </Routes>
        </main>
        <footer className="bg-blue-100 text-center text-black font-bold flex items-center justify-center p-3 mt-auto realfont h-16">
          Developed by WeClocks Technology Pvt. Ltd. @ 2025
        </footer>

        {reportModalOpen && (
          <GenerateReport onClose={() => setReportModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

// Custom NavLink Component with reduced font size
const NavLink = ({ to, label, path, icon }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 transition-all duration-300 ease-in-out font-medium relative overflow-hidden text-sm
      ${
        path === to
          ? "text-blue-950 font-semibold shadow-md rounded-r-[5px]"
          : "text-white hover:bg-gray-700 hover:text-gray-300"
      }
    `}
  >
    <span
      className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${
        path === to
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0"
      }`}
    />
    <span
      className={`absolute left-0 top-0 bottom-0 w-2 bg-cyan-400 transition-all duration-300 ${
        path === to ? "opacity-100" : "opacity-0"
      }`}
    />
    <span className="relative flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </span>
  </Link>
);

export default Home;