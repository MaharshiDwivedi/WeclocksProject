import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Plus, LogOut, CalendarCheck, ChartColumnIncreasing, FileText } from "lucide-react";



import AODash from "./AODash";
import Documents from "./Documents";


const AOHome = () => {
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
          ITDP-Nandurbar
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont">
          <NavLink 
            to="/aohome/aodashboard" 
            label="Dashboard" 
            path={location.pathname} 
            icon={<ChartColumnIncreasing size={20} />} 
          />

<NavLink 
            to="/aohome/documents" 
            label="Documents" 
            path={location.pathname} 
            icon={<FileText size={20}/>} 
          />

       
        </div>

        {/* Bottom Buttons - Add Member & Logout */}
        <div className="mt-auto px-3 pb-4">
       
       

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center mt-4 text-white bg-red-500 px-4 py-2 rounded-md transition hover:bg-red-600 w-full"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </div>

      </aside>

      {/* Page Content */}
      <div className="flex-1 p-6 ml-64">
        <Routes>
        <Route path="/" element={<Navigate to="aodashboard" />} />

          <Route path="aodashboard" element={<AODash/>} />

          <Route path="documents" element={<Documents/>}/>
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

export default AOHome;