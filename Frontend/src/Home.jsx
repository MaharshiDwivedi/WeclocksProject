import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Meetings from "./Meetings";
import Dashboard from "./Dashboard";
import NewMember from "./NewMember";
import { Plus } from "lucide-react";

const Home = () => {
  const location = useLocation(); // Get current URL path
  const navigate = useNavigate(); // Navigation hook

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT token
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="flex flex-col h-screen">
      <nav className="bg-blue-950 p-4 flex justify-center space-x-4 gap-[90px]">
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

        <Link
  to="/home/newmember"
  className={`flex items-center text-blue-950 bg-white pl-2 pr-2 rounded-[5px] ${
    location.pathname === "/home/newmember" ? "border-[2px] border-[#00FFFF]" : ""
  }`}
>
  <Plus className="mr-2" /> {/* Adds spacing to the right of the icon */}
  Add Committee Member
</Link>










        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-white ml-auto bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      {/* Page Content */}
      <div className="flex-1 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Navigate to="meetings" />} /> {/* Default to Meetings */}
          <Route path="meetings" element={<Meetings />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="newmember" element={<NewMember/>}/>
        </Routes>
      </div>
    </div>
  );
};

export default Home;
