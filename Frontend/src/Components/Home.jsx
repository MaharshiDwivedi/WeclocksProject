import React, { useState, useEffect, useCallback } from "react";
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
  CirclePower,
  UsersRound,
  ListCollapse,
  BarChartBigIcon as ChartColumnBig,
  X,
  BadgeIndianRupee,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";
import NewMember from "./NewMember";
import Tharav from "./Tharav";
import FundReq from "./FundReq"


const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [fontSize, setFontSize] = useState(16); // Default font size in pixels
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (
      window.confirm(t("confirmLogout") || "Are you sure you want to logout?")
    ) {
      localStorage.clear(); // Clear all localStorage items
      navigate("/login", { replace: true }); // Replace history to prevent back navigation
    }
  }, [navigate, t]);

  const increaseTextSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, 24)); // Max 24px
  }, []);

  const decreaseTextSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, 12)); // Min 12px
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

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

  // Handle window resize for sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close sidebar on desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Breadcrumbs logic
  const getBreadcrumbs = useCallback(() => {
    const pathnames = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: t("headmaster"), path: "/home" }];

    if (pathnames.includes("dashboard")) {
      breadcrumbs.push({ name: t("Dashboard"), path: "/home/dashboard" });
    } else if (pathnames.includes("meetings")) {
      breadcrumbs.push({ name: t("Meetings"), path: "/home/meetings" });
      if (pathnames.includes("tharav")) {
        breadcrumbs.push({
          name: t("tharavManagement"),
          path: location.pathname,
        });
      }
      if (pathnames.includes("remarks")) {
        breadcrumbs.push({ name: t("remarks"), path: location.pathname });
      }
    }
    else if (pathnames.includes("fundreq")) {
      breadcrumbs.push({ name: t("Fund Requests"), path: "/home/fundreq" })
    }  else if (pathnames.includes("newmember")) {
      breadcrumbs.push({
        name: t("Committee Members"),
        path: "/home/newmember",
      });
    }

    return breadcrumbs;
  }, [location.pathname, t]);

  return (
    <div
      className="flex min-h-screen bg-[#E5EAF5]"
      style={{ fontSize: `${fontSize}px` }}
      role="main"
    >
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={` realfont fixed md:sticky top-0 w-[300px] md:w-[300px] bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-xl z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className=" realfont2 w-full h-[60px] bg-blue-200 text-blue-950 text-[16px] md:text-[26px] lg:text-[30px] text-center shadow-md flex items-center justify-center overflow-hidden font-semibold">
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

        <div className="flex flex-col space-y-5 flex-1 px-5 pt-8 mt-6 overflow-y-auto">
          <h1 className="text-[18px] md:text-[22px] mb-3">{t("Dashboard")}</h1>
          <NavLink
            to="/home/dashboard"
            label={t("Dashboard")}
            path={location.pathname}
            icon={<ChartColumnBig size={28} />}
          />

          <h1 className="text-[18px] md:text-[22px] mb-3">{t("Meetings")}</h1>
          <NavLink
            to="/home/meetings"
            label={t("Meetings")}
            path={location.pathname}
            icon={<CalendarCheck size={28} />}
          />

          <h1 className="text-[18px] md:text-[22px] mb-3">
            {t("Committee")}
          </h1>
          <NavLink
            to="/home/newmember"
            label={t("committeeMembers")}
            path={location.pathname}
            icon={<UsersRound size={28} />}
          />


<NavLink
            to="/home/fundreq"
            label={t("Fund Requests")}
            path={location.pathname}
            icon={<BadgeIndianRupee size={20} />}
          />


          
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        {/* Navbar */}
        <header className="bg-white p-3 md:p-4 flex justify-between items-center h-[60px] shadow-lg sticky top-0 z-30">
          <button
            data-sidebar-toggle
            className="md:hidden flex items-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
            aria-expanded={sidebarOpen}
          >
            <ListCollapse className="h-7 w-7 text-blue-950" />
          </button>

          <div className="text-[16px] md:text-[20px] lg:text-[22px] text-blue-950 font2  md:block font-medium">
            {t("welcome")}, {t("headmaster")}.
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex gap-3">
              <button
                onClick={increaseTextSize}
                disabled={fontSize >= 24}
                className="flex items-center justify-center gap-2 px-4 py-2 text-neutral-900 text-lg font-semibold rounded-lg hover:bg-gray-300 hover:text-white transition duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
                title={t("increaseTextSize")}
                aria-label={t("increaseTextSize")}
              >
                <span className="realfont2">+A</span>
              </button>
              <button
                onClick={decreaseTextSize}
                disabled={fontSize <= 12}
                className="flex items-center justify-center gap-2 px-4 text-neutral-900 text-lg font-semibold rounded-lg hover:bg-gray-300 hover:text-white transition duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
                title={t("decreaseTextSize")}
                aria-label={t("decreaseTextSize")}
              >
                <span className="realfont2">-A</span>
              </button>
            </div>

            <div className="navbar">
              <select
                onChange={changeLanguage}
                value={i18n.language}
                className="p-1.5 md:p-2 border rounded realfont text-sm md:text-base"
                aria-label={t("selectLanguage")}
              >
                <option value="en">{t("english")}</option>
                <option value="hi">{t("hindi")}</option>
                <option value="mr">{t("marathi")}</option>
              </select>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center text-white px-4 md:px-3 py-1.5 md:py-2 rounded-md hover:bg-neutral-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
              title={t("logout")}
              aria-label={t("logout")}
            >
              <CirclePower className="text-red-500" size={24} />
            </button>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-gradient-to-r mt-3 md:mt-6 from-blue-100 to-blue-800 md:px-2 py-2 md:py-4 shadow-md font2 overflow-x-auto whitespace-nowrap">
          <nav className="flex px-2 md:px-10" aria-label={t("breadcrumbs")}>
            <ol className="inline-flex items-center space-x-1 md:space-x-1 text-sm md:text-base">
              {getBreadcrumbs().map((crumb, index) => (
                <li
                  key={crumb.path}
                  className="inline-flex items-center text-base md:text-xl"
                  aria-current={
                    index === getBreadcrumbs().length - 1 ? "page" : undefined
                  }
                >
                  {index > 0 && (
                    <span className="mx-1 md:mx-2 text-blue-400 font-bold">
                      /
                    </span>
                  )}
                  <Link
                    to={crumb.path}
                    className={`inline-flex items-center ml-1 px-2 md:px-3 py-1.5 rounded-[2px] transition-all duration-200 ${
                      index === getBreadcrumbs().length - 1
                        ? "bg-blue-500 text-white font-semibold shadow-md"
                        : "text-blue-700 hover:bg-blue-200 hover:text-blue-900"
                    }`}
                  >
                    {crumb.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Routed Content */}
        <main className="flex-1 px-3 md:px-8 py-5">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="meetings/tharav/:index/*" element={<Tharav />} />
            <Route path="newmember" element={<NewMember />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
            <Route path="fundreq" element={<FundReq />} />
          </Routes>
        </main>

        <footer className="bg-blue-100 text-neutral-500 p-3 md:p-4 mt-auto realfont text-sm md:text-base text-center shadow-inner">
          {t("developedBy")} WeClocks Technology Pvt. Ltd. &copy; 2025
        </footer>
      </div>
    </div>
  );
};

// Custom NavLink Component
const NavLink = ({ to, label, path, icon }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-3 font-medium md:py-3 transition-all duration-200 ease-in-out font-lg relative overflow-hidden ${
      path === to
        ? "text-blue-950 shadow-md rounded-r-[7px]"
        : "text-white hover:text-cyan-400 hover:bg-gray-600/30"
    }`}
    aria-label={label}
  >
    <span
      className={`absolute inset-0 bg-white transition-transform duration-500 ease-in-out ${
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
    <span className="relative flex items-center space-x-4">
      {icon}
      <span className="md:text-[20px] font-md">{label}</span>
    </span>
  </Link>
);

export default Home;