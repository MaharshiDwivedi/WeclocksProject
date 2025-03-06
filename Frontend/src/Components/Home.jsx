import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  LogOut,
  CalendarCheck,
  ChartColumnIncreasing,
  CirclePower,
  UsersRound,
} from "lucide-react";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";
import NewMember from "./NewMember";
import Tharav from "./Tharav";
import React from "react";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = React.useState(16);
  const [language, setLanguage] = React.useState("en");

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

  return (
    <div className="flex h-screen bg-white" style={{ fontSize: `${fontSize}px` }}>
      {/* Sidebar */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed">
        <div className="w-full h-[55px] bg-blue-200 text-blue-950 text-[30px] text-center realfont shadow-md flex items-center justify-center overflow-hidden">
          ITDP Nandurbar
        </div>

        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont">
          <NavLink to="/home/dashboard" label="Dashboard" path={location.pathname} icon={<ChartColumnIncreasing size={20} />} />
          <NavLink to="/home/meetings" label="Meetings" path={location.pathname} icon={<CalendarCheck size={20} />} />
          <NavLink to="/home/newmember" label="Commitee Members" path={location.pathname} icon={<UsersRound size={20} />} />

        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Navbar */}
        <div className="bg-white p-4 flex justify-between items-center h-[55px] shadow-md">
          <div className=" text-[18px] text-blue-950 font2">Welcome, HeadMaster.</div>
          <div className="flex items-center space-x-2">
            <button onClick={increaseTextSize} className="flex items-center gap-1 px-3 py-2 text-neutral-900 rounded hover:bg-neutral-300" title="Increase text size">
              <span>+</span>
              <span>A</span>
            </button>
            <button onClick={decreaseTextSize} className="flex items-center gap-1 px-3 py-2 text-neutral-900 rounded hover:bg-neutral-300" title="Decrease text size">
              <span>-</span>
              <span>A</span>
            </button>
            <button onClick={handleLogout} className="flex items-center justify-center text-white px-2 py-2 rounded-md hover:bg-neutral-300">
              <CirclePower className="mr-2 text-red-500" size={24} />
            </button>
          </div>
        </div>

        {/* Routed Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="meetings/tharav/:index" element={<Tharav />} />
            <Route path="newmember" element={<NewMember />} />
          </Routes>
        </div>
        <footer className="bg-blue-100 text-neutral-500 p-3 mt-auto realfont">
        Developed by WeClocks Technology Pvt. Ltd. @ 2025
  </footer>


        
      </div>
    </div>
  );
};

// Custom NavLink Component
const NavLink = ({ to, label, path, icon }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 transition-all duration-300 ease-in-out font-medium relative overflow-hidden
      ${path === to ? "text-blue-950 font-semibold shadow-md rounded-r-[5px]" : "text-white hover:bg-gray-700 hover:text-gray-300"}
    `}
  >
    <span className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${path === to ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`} />
    <span className={`absolute left-0 top-0 bottom-0 w-2 bg-cyan-400 transition-all duration-300 ${path === to ? "opacity-100" : "opacity-0"}`} />
    <span className="relative flex items-center">
      {icon}
      <span className="ml-2">{label}</span>
    </span>
  </Link>
);

export default Home;
