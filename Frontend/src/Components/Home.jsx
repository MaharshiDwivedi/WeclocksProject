import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";
import NewMember from "./NewMember";
import Tharav from "./Tharav"; // Import Tharav Component

import { Plus } from "lucide-react";

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT token
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-blue-950 px-6 py-2 flex items-center justify-between shadow-md">
        
        {/* Left Side - Navigation Links */}
        <div className="flex space-x-10">
          <NavLink to="/home/meetings" label="Meetings" path={location.pathname} />
          <NavLink to="/home/dashboard" label="Dashboard" path={location.pathname} />
        </div>

        {/* Right Side - Add Member & Logout */}
        <div className="flex items-center space-x-4">
          
          {/* Add Committee Member */}
          <Link
            to="/home/newmember"
            className={`flex items-center text-blue-950 bg-white px-3 py-1.5 rounded-md shadow-md transition 
              ${location.pathname === "/home/newmember" ? "border-2 border-blue-500" : "hover:bg-gray-100"}`}
          >
            <Plus className="mr-2" size={18} />
            Add Committee Member
          </Link>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="text-white bg-red-500 px-4 py-1.5 rounded-md transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Page Content (Adds Padding to Avoid Overlap) */}
      <div className="flex-1 flex items-center justify-center pt-14"> 
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
const NavLink = ({ to, label, path }) => (
  <Link
    to={to}
    className={`text-white pb-2 transition border-b-2 
      ${path === to ? "border-white font-semibold" : "border-transparent hover:border-gray-400"}`}
  >
    {label}
  </Link>
);

export default Home;

