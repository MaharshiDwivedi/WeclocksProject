import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";

const Home = () => {
  const location = useLocation(); // Get current URL path

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4 flex justify-center space-x-4 gap-[90px]">
        <Link
          to="/home/meetings"
          className={`text-white pb-2 ${
            location.pathname === "/home/meetings" ? "border-b-7 border-white" : ""
          }`}
        >
          Meetings
        </Link>
        
        <Link
          to="/home/dashboard"
          className={`text-white pb-2 ${
            location.pathname === "/home/dashboard" ? "border-b-7 border-white" : ""
          }`}
        >
          Dashboard
        </Link>
      </nav>

      {/* Page Content */}
      <div className="flex-1 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Navigate to="meetings" />} /> {/* Default to Meetings */}
          <Route path="meetings" element={<Meetings />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;
