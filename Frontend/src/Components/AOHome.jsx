import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FileText,
  IndianRupee,
  Check,
  CirclePower,
  Minimize,
  ListCollapse,
  DownloadIcon,
  BarChartBigIcon as ChartColumnBig,
  X,
} from "lucide-react";
import AODash from "./AODash";
import Documents from "./Documents";
import FundDist from "./FundDist";
import SMCSchools from "./SMCSchools";
import GenerateReport from "./GenerateReport"; //sdjddis
import FundDemand from "./FundDemand";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const AOHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = React.useState(16);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        !event.target.closest("[data-sidebar-toggle]")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const increaseTextSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const decreaseTextSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = [{ name: `${t("Ao")}`, path: "/aohome" }];

    if (pathnames.includes("aodashboard")) {
      breadcrumbs.push({ name: t("Dashboard"), path: "/aohome/aodashboard" });
    } else if (pathnames.includes("funddist")) {
      breadcrumbs.push({
        name: t("Fund Distribution"),
        path: "/aohome/funddist",
      });
    } else if (pathnames.includes("funddemand")) {
      breadcrumbs.push({
        name: t("Fund Demand"),
        path: "/aohome/funddemand",
      });
    } else if (pathnames.includes("documents")) {
      breadcrumbs.push({ name: t("Documents"), path: "/aohome/documents" });
    } else if (pathnames.includes("smcschools")) {
      breadcrumbs.push({ name: t("SMC Schools"), path: "/aohome/smcschools" });
    }

    return breadcrumbs;
  };

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
        <div className="w-full h-[40px] bg-blue-200 text-blue-950 text-[22px] text-center font2 flex items-center justify-center overflow-hidden">
          ITDP Nandurbar
        </div>

        <button
          className="md:hidden absolute top-2 right-2 text-white p-2"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close Sidebar"
        >
          <Minimize size={24} className="text-red-500" />
        </button>

        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont text-sm">
          <NavLink
            to="/aohome/aodashboard"
            label={t("Dashboard")}
            path={location.pathname}
            icon={<ChartColumnBig size={18} />}
          />
          <NavLink
            to="/aohome/funddist"
            label={t("Fund Distribution")}
            path={location.pathname}
            icon={<IndianRupee size={18} />}
          />
          <NavLink
            to="/aohome/funddemand"
            label={t("Fund Demand")}
            path={location.pathname}
            icon={<IndianRupee size={18} />}
          />
          <NavLink
            to="/aohome/documents"
            label={t("Documents")}
            path={location.pathname}
            icon={<FileText size={18} />}
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
                location.pathname === "/aohome/genreport" ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="relative flex items-center">
              <DownloadIcon size={18} />
              <span className="ml-2"> {t("Generated Report")}</span>
            </span>
          </button>
          <NavLink
            to="/aohome/smcschools"
            label={t("SMC Schools")}
            path={location.pathname}
            icon={<Check size={18} />}
          />
        </div>
      </aside>

      <div className="flex-1 ml-0 md:ml-64 flex flex-col">
        <header className="bg-white p-2 flex justify-between items-center h-[40px] shadow-md sticky top-0 z-30">
          <button
            data-sidebar-toggle
            className="md:hidden flex items-center"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Sidebar"
            aria-expanded={sidebarOpen}
          >
            <ListCollapse className="h-5 w-5 text-blue-950" />
          </button>

          <div className="text-[16px] text-blue-950 font2">
            {t("welcome")}, {t("Ao")}.
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

        <div className="bg-gradient-to-r from-blue-100 to-blue-800 px-6 py-3 shadow-sm font2 mt-5">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <span className="mx-2 text-blue-400 font-bold">/ </span>
                  )}
                  <Link
                    to={crumb.path}
                    className={`inline-flex items-center px-2 py-1 rounded-md transition-all duration-200 ${
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

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="aodashboard" />} />
            <Route path="aodashboard" element={<AODash />} />
            <Route path="documents" element={<Documents />} />
            <Route path="funddist" element={<FundDist />} />
            <Route path="funddemand" element={<FundDemand />} />
            <Route path="smcschools" element={<SMCSchools />} />
            <Route path="*" element={<Navigate to="aodashboard" replace />} />
          </Routes>
        </main>
        
        <footer className="bg-blue-100 text-center text-neutral-500 p-3 mt-auto realfont">
          Developed by WeClocks Technology Pvt. Ltd. @ 2025
        </footer>

        {reportModalOpen && (
          <GenerateReport onClose={() => setReportModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

const NavLink = ({ to, label, path, icon }) => {
  return (
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
};

export default AOHome;