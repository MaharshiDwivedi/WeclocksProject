import { Routes, Route, Link, Navigate } from "react-router-dom";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";

const Home = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <nav className="bg-gray-800 p-4 flex justify-center space-x-4">
        <Link to="/home/meetings" className="text-white">Meetings</Link>
        <Link to="/home/dashboard" className="text-white">Dashboard</Link>
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
