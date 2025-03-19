"use client"

import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import {
  FileText,
  IndianRupee,
  Check,
  CirclePower,
  BadgeIndianRupee,
  Minimize,
  ListCollapse,
  DownloadIcon,
  BarChartBigIcon as ChartColumnBig,
} from "lucide-react"
import AODash from "./AODash"
import Documents from "./Documents"
import FundDist from "./FundDist"
import SMCSchools from "./SMCSchools"
import FundReq from "./FundReq"
import GenReport, { generatePDF } from "./GenReport"

import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

const AOHome = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [fontSize, setFontSize] = React.useState(16)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { t, i18n } = useTranslation() // Use the useTranslation hook

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar")
      if (sidebarOpen && sidebar && !sidebar.contains(event.target) && !event.target.closest("[data-sidebar-toggle]")) {
        setSidebarOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarOpen])

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token")
      navigate("/login")
    }
  }

  const increaseTextSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24))
  }

  const decreaseTextSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12))
  }

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value)
  }

  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x)
    const breadcrumbs = [{ name: "Account Officer", path: "/aohome" }]

    if (pathnames.includes("aodashboard")) {
      breadcrumbs.push({ name: t("Dashboard"), path: "/aohome/aodashboard" })
    } else if (pathnames.includes("funddist")) {
      breadcrumbs.push({ name: t("Fund Distribution"), path: "/aohome/funddist" })
    } else if (pathnames.includes("fundreq")) {
      breadcrumbs.push({ name: t("Fund Request"), path: "/aohome/fundreq" })
    } else if (pathnames.includes("documents")) {
      breadcrumbs.push({ name: t("Documents"), path: "/aohome/documents" })
    } else if (pathnames.includes("genreport")) {
      breadcrumbs.push({ name: t("Generate Report"), path: "/aohome/genreport" })
    } else if (pathnames.includes("smcschools")) {
      breadcrumbs.push({ name: t("SMC Schools"), path: "/aohome/smcschools" })
    }

    return breadcrumbs
  }

  return (
    <div className="flex min-h-screen bg-[#E5EAF5]" style={{ fontSize: `${fontSize}px` }}>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar - Full Height */}
      <aside
        id="sidebar"
        className={`w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="w-full h-[55px] bg-blue-200 text-blue-950 text-[22px] md:text-[30px] text-center realfont shadow-md flex items-center justify-center overflow-hidden">
          ITDP Nandurbar
        </div>

        {/* Close button for mobile */}
        <button className="md:hidden absolute top-2 right-2 text-white p-2" onClick={() => setSidebarOpen(false)}>
          <Minimize size={24} color="red" />
        </button>

        {/* Sidebar Links */}
        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont overflow-y-auto">
          <NavLink
            to="/aohome/funddist"
            label={t("Fund Distribution")}
            path={location.pathname}
            icon={<IndianRupee size={20} />}
          />

          <NavLink
            to="/aohome/fundreq"
            label={t("Fund Request")}
            path={location.pathname}
            icon={<BadgeIndianRupee size={20} />}
          />

          <NavLink
            to="/aohome/documents"
            label={t("Documents")}
            path={location.pathname}
            icon={<FileText size={20} />}
          />

          <NavLink
            to="/aohome/genreport"
            label={t("Generate Report")}
            path={location.pathname}
            icon={<DownloadIcon size={20} />}
            onClick={generatePDF}
            isButton={true}
          />

          <NavLink
            to="/aohome/smcschools"
            label={t("SMC Schools")}
            path={location.pathname}
            icon={<Check size={20} />}
          />

          <NavLink
            to="/aohome/aodashboard"
            label={t("Dashboard")}
            path={location.pathname}
            icon={<ChartColumnBig size={20} />}
          />
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 md:ml-64 flex flex-col w-full">
        {/* Navbar with hamburger menu for mobile */}
        <div className="bg-white p-2 md:p-4 flex justify-between items-center h-[55px] shadow-md">
          {/* Mobile menu button */}
          <button data-sidebar-toggle className="md:hidden flex items-center" onClick={() => setSidebarOpen(true)}>
            <ListCollapse className="h-6 w-6 text-blue-950" />
          </button>

          {/* Left-aligned text */}
          <div className="text-sm md:text-[18px] text-blue-950 font2 inline-block">
            {t("Welcome, Account Officer.")}
          </div>

          {/* Right-aligned controls - make more compact on mobile */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={increaseTextSize}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 text-neutral-900 rounded hover:bg-neutral-300"
              title="Increase text size"
            >
              <span>+</span>
              <span className="realfont2">A</span>
            </button>

            <button
              onClick={decreaseTextSize}
              className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 text-neutral-900 rounded hover:bg-neutral-300"
              title="Decrease text size"
            >
              <span>-</span>
              <span className="realfont2">A</span>
            </button>

            <select
              value={i18n.language}
              onChange={changeLanguage}
              className="p-1 md:p-2 border rounded text-neutral-800 hover:bg-neutral-300 realfont2 text-xs md:text-sm"
              title="Select language"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center text-white px-1 md:px-2 py-1 md:py-2 rounded-md hover:bg-neutral-300"
              title="Logout"
            >
              <CirclePower className="text-red-500" size={20} />
            </button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-800 px-2 md:px-6 py-2 md:py-3 shadow-sm font2 overflow-x-auto whitespace-nowrap">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm md:text-base">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && <span className="mx-1 md:mx-2 text-blue-400 font-bold">/</span>}
                  <Link
                    to={crumb.path}
                    className={`inline-flex items-center px-1 md:px-2 py-1 rounded-[2px] transition-all duration-200 ${
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
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="aodashboard" />} />
            <Route path="aodashboard" element={<AODash />} />
            <Route path="documents" element={<Documents />} />
            <Route path="funddist" element={<FundDist />} />
            <Route path="smcschools" element={<SMCSchools />} />
            <Route path="fundreq" element={<FundReq />} />
            <Route path="genreport" element={<GenReport />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="bg-blue-100 text-neutral-500 p-2 md:p-3 mt-auto realfont text-xs md:text-sm text-center">
          Developed by WeClocks Technology Pvt. Ltd. @ 2025
        </footer>
      </div>
    </div>
  )
}

// Custom NavLink Component
const NavLink = ({ to, label, path, icon, onClick, isButton }) => {
  if (isButton) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center px-4 py-2 transition-all duration-200 ease-in-out font-medium relative overflow-hidden w-full text-left
          ${path === to ? "text-blue-950 font-semibold shadow-md rounded-r-[7px]" : "text-white hover:text-cyan-400"}
        `}
      >
        <span
          className={`absolute inset-0 bg-white transition-transform duration-500 ease-in-out ${
            path === to ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
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
      </button>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 transition-all duration-200 ease-in-out font-medium relative overflow-hidden
        ${path === to ? "text-blue-950 font-semibold shadow-md rounded-r-[7px]" : "text-white hover:text-cyan-400"}
      `}
    >
      <span
        className={`absolute inset-0 bg-white transition-transform duration-500 ease-in-out ${
          path === to ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
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
  )
}

export default AOHome

