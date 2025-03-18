"use client"

import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import {
  CalendarCheck,
  CodeIcon as ChartColumnIncreasing,
  CirclePower,
  UsersRound,
  Minimize,
  ListCollapse,
  ChartColumnBig,
} from "lucide-react"
import Meetings from "./Meetings"
import Dashboard from "./Dashboard"
import NewMember from "./NewMember"
import Tharav from "./Tharav"
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

const Home = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [fontSize, setFontSize] = React.useState(16)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { i18n, t } = useTranslation()

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

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value)
  }

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

  // Breadcrumbs logic
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x)
    const breadcrumbs = [{ name: "Headmaster", path: "/home" }]

    if (pathnames.includes("dashboard")) {
      breadcrumbs.push({ name: "Dashboard", path: "/home/dashboard" })
    } else if (pathnames.includes("meetings")) {
      breadcrumbs.push({ name: "Meetings", path: "/home/meetings" })
      if (pathnames.includes("tharav")) {
        breadcrumbs.push({ name: "Tharav", path: location.pathname })
      }

      if (pathnames.includes("remarks")) {
        breadcrumbs.push({ name: "Remarks", path: location.pathname })
      }
    } else if (pathnames.includes("newmember")) {
      breadcrumbs.push({ name: "Committee Members", path: "/home/newmember" })
    }

    return breadcrumbs
  }

  return (
    <div className="flex min-h-screen bg-[#E5EAF5]" style={{ fontSize: `${fontSize}px` }}>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="w-full h-[55px] bg-blue-200 text-blue-950 text-[22px] md:text-[30px] text-center realfont shadow-md flex items-center justify-center overflow-hidden">
          ITDP Nandurbar
        </div>

        {/* Close button for mobile */}
        <button className="md:hidden absolute top-2 right-2 text-white p-2" onClick={() => setSidebarOpen(false)}>
          <Minimize size={24} color="red" />
        </button>

        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont overflow-y-auto">
          <NavLink
            to="/home/dashboard"
            label={t("Dashboard")}
            path={location.pathname}
            icon={<ChartColumnBig size={20} />}
          />
          <NavLink
            to="/home/meetings"
            label={t("Meetings")}
            path={location.pathname}
            icon={<CalendarCheck size={20} />}
          />
          <NavLink
            to="/home/newmember"
            label={t("Committee Members")}
            path={location.pathname}
            icon={<UsersRound size={20} />}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col w-full">
        {/* Navbar with hamburger menu for mobile */}
        <div className="bg-white p-2 md:p-4 flex justify-between items-center h-[55px] shadow-md">
          {/* Mobile menu button */}
          <button data-sidebar-toggle className="md:hidden flex items-center" onClick={() => setSidebarOpen(true)}>
            <ListCollapse className="h-6 w-6 text-blue-950" />
          </button>

          {/* Left-aligned text */}
          <div className="text-[16px] md:text-[18px] text-blue-950 font2 hidden md:block">
            {t("welcome")}, {t("headmaster")}.
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
            <div className="navbar">
              <select
                onChange={changeLanguage}
                value={i18n.language}
                className="p-1 md:p-2 border rounded realfont text-xs md:text-sm"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center text-white px-1 md:px-2 py-1 md:py-2 rounded-md hover:bg-neutral-300"
              title="Logout"
            >
              <CirclePower className="text-red-500" size={20} />
            </button>
          </div>
        </div>

        {/*Breadcrumbs */}
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
            <Route path="/" element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="meetings/tharav/:index/*" element={<Tharav />} /> {/* Allow nested routes */}
            <Route path="newmember" element={<NewMember />} />
          </Routes>
        </div>
        <footer className="bg-blue-100 text-neutral-500 p-2 md:p-3 mt-auto realfont text-xs md:text-sm text-center">
          Developed by WeClocks Technology Pvt. Ltd. @ 2025
        </footer>
      </div>
    </div>
  )
}

// Custom NavLink Component
const NavLink = ({ to, label, path, icon }) => (
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

export default Home

