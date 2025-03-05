import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Plus, LogOut, CalendarCheck, ChartColumnIncreasing, FileText, IndianRupee, Check, PlusCircle, MinusCircle, Languages, CirclePower } from "lucide-react";
import AODash from "./AODash";
import Documents from "./Documents";
import FundDist from "./FundDist";
import SMCSchools from "./SMCSchools";
import FundReq from "./FundReq";
import React from "react";

const AOHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = React.useState(16);
  const [language, setLanguage] = React.useState('en');

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const increaseTextSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseTextSize = () => {
    setFontSize(prev => Math.max(prev - 2, 12));
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    console.log("Language changed to:", e.target.value);
  };

  const translations = {
    en: {
      greeting: "HELLO, ACCOUNT OFFICER",
      dashboard: "Dashboard",
      documents: "Documents",
      fundDist: "Fund Distribution",
      smcSchools: "SMC Done Schools",
      logout: "Logout"
    },
    es: {
      greeting: "HOLA, OFICIAL DE CUENTAS",
      dashboard: "Tablero",
      documents: "Documentos",
      fundDist: "Distribución de Fondos",
      smcSchools: "Escuelas SMC Completadas",
      logout: "Cerrar sesión"
    }
  };

  return (
    <div className="flex h-screen bg-white" style={{ fontSize: `${fontSize}px` }}>
      {/* Sidebar - Full Height */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed">
        {/* Sidebar Header */}
        <div className="w-full bg-blue-200 text-blue-950 text-1xl font-bold text-center py-4 realfont2 shadow-md">
          {translations[language].greeting}
        </div>

        {/* Sidebar Links */}
        <div className="flex flex-col space-y-4 flex-1 px-3 pt-4 realfont">

        <NavLink 
              to="/aohome/funddist" 
              label={translations[language].fundDist}
              path={location.pathname} 
              icon={<IndianRupee size={20} />}  
            />

<NavLink 
            to="/aohome/fundreq" 
            label="Fund Request"
            path={location.pathname} 
            icon={<IndianRupee size={20} />} 
          />
           






   <NavLink 
            to="/aohome/documents" 
            label={translations[language].documents}
            path={location.pathname} 
            icon={<FileText size={20}/>} 
          />
           




         
          <NavLink 
            to="/aohome/smcschools" 
            label={translations[language].smcSchools}
            path={location.pathname} 
            icon={<Check size={20} />}  
          />

<NavLink 
            to="/aohome/aodashboard" 
            label={translations[language].dashboard}
            path={location.pathname} 
            icon={<ChartColumnIncreasing size={20} />} 
          />
       


        </div>

        {/* Bottom Buttons - Logout */}
        <div className="mt-auto px-3 pb-4">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center mt-4 text-white bg-red-500 px-4 py-2 rounded-md transition hover:bg-red-600 w-full"
          >
            <LogOut className="mr-2" size={18} />
            {translations[language].logout}
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Navbar */}
        <div className="bg-white p-4 flex justify-end items-center shadow-sm h-[55px]">
          <div className="flex items-center space-x-2">
          <button 
  onClick={increaseTextSize}
  className="flex items-center gap-1 px-3 py-2 text-neutral-900 rounded hover:bg-neutral-300  "
  title="Increase text size"
>
  <span>+</span>
  <span>A</span>
</button>

            <button 
              onClick={decreaseTextSize}
              className="flex items-center gap-1 px-3 py-2 text-neutral-900 rounded hover:bg-neutral-300 "
              title="Decrease text size"
            >
              <span>-</span>
  <span>A</span>
            </button>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="p-2  text-neutral-800 rounded hover:bg-neutral-300"
              title="Select language"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>

            <button 
            onClick={handleLogout}
            className="flex items-center justify-center mt-4 text-white px-2 py-2 rounded-md  hover:bg-neutral-300 w-full mb-4"
          >
            <CirclePower className="mr-2 text-red-500 " size={24} />
          </button>


          </div>
        </div>

        {/* Routed Content */}
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Navigate to="aodashboard" />} />
            <Route path="aodashboard" element={<AODash/>} />
            <Route path="documents" element={<Documents/>}/>
            <Route path="funddist" element={<FundDist/>}/>
            <Route path="smcschools" element={<SMCSchools/>}/>
            <Route path="fundreq" element={<FundReq/>}/>
          </Routes>
        </div>
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
        ? "bg-white text-blue-950 font-semibold shadow-md"
        : "text-white hover:bg-gray-700 hover:text-gray-300"
      }`}
  >
    {icon}
    <span className="ml-2">{label}</span>
  </Link>
);

export default AOHome;