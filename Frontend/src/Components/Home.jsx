import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";
import NewMember from "./NewMember";
import Tharav from "./Tharav"; // Import Tharav Component
import { Plus, LogOut, CalendarCheck, ChartColumnIncreasing } from "lucide-react";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT token
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Full Height */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed">
        
        {/* Sidebar Header - Full Width */}
        <div className="w-full  bg-blue-200 text-blue-950 text-4xl font-bold text-center py-4 realfont shadow-md">
          ITDP Nandurbar
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont">
          <NavLink 
            to="/home/dashboard" 
            label="Dashboard" 
            path={location.pathname} 
            icon={<ChartColumnIncreasing size={20} />} 
          />

          <NavLink 
            to="/home/meetings" 
            label="Meetings" 
            path={location.pathname} 
            icon={<CalendarCheck size={20} />} 
          />
        </div>

        {/* Bottom Buttons - Add Member & Logout */}
        <div className="mt-auto px-3 pb-4">
          {/* Add Member Button */}
          <Link
            to="/home/newmember"
            className={`flex items-center text-blue-950 realfont2 bg-white px-3 py-2 rounded-md shadow-md transition 
              ${location.pathname === "/home/newmember" ? "border-2 border-blue-500" : "hover:bg-gray-100"}`}
          >
            <Plus className="mr-2" size={18} />
            Committee Members
          </Link>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center  realfont2 mt-4 text-white bg-red-500 px-4 py-2 rounded-md transition hover:bg-red-600 w-full"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </div>

      </aside>

      {/* Page Content */}
      <div className="flex-1 p-6 ml-64">
        <Routes>
          <Route path="/" element={<Navigate to="meetings" />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="meetings/tharav/:index" element={<Tharav />} /> 
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="newmember" element={<NewMember />} />
        </Routes>
      </div>
    </div>
  );
};

// Custom NavLink Component
const NavLink = ({ to, label, path, icon }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 rounded-md transition font-medium 
      ${path === to 
        ? "bg-white text-blue-950 font-semibold shadow-md"  // ✅ Dark text when active
        : "text-white hover:bg-gray-700 hover:text-gray-300" // ✅ Normal & hover states
      }`}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </Link>
);

export default Home;