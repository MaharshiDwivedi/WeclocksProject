import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Plus,
  LogOut,
  CalendarCheck,
  ChartColumnIncreasing,
  FileText,
  IndianRupee,
  Check,
  PlusCircle,
  MinusCircle,
  Languages,
  CirclePower,
  BadgeIndianRupee,
  Download,
} from "lucide-react";
import AODash from "./AODash";
import Documents from "./Documents";
import FundDist from "./FundDist";
import SMCSchools from "./SMCSchools";
import FundReq from "./FundReq";
import GenReport from "./GenReport";
import React from "react";

const AOHome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fontSize, setFontSize] = React.useState(16);
  const [language, setLanguage] = React.useState("en");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const increaseTextSize = () => {
    setFontSize((prev) => Math.min(prev + 2, 24));
  };

  const decreaseTextSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    console.log("Language changed to:", e.target.value);
  };

  const translations = {
    en: {
      dashboard: "Dashboard",
      documents: "Documents",
      fundDist: "Fund Distribution",
      smcSchools: "SMC Done Schools",
      logout: "Logout",
    },
    es: {
      dashboard: "Tablero",
      documents: "Documentos",
      fundDist: "Distribución de Fondos",
      smcSchools: "Escuelas SMC Completadas",
      logout: "Cerrar sesión",
    },
  };

  return (
    <div
      className="flex h-screen bg-white"
      style={{ fontSize: `${fontSize}px` }}
    >
      {/* Sidebar - Full Height */}
      <aside className="w-64 bg-blue-950 text-white flex flex-col min-h-screen h-screen shadow-lg fixed">
        {/* Sidebar Header */}
        <div className="w-full h-[55px] bg-blue-200 text-blue-950 text-[30px]  text-center realfont shadow-md flex items-center justify-center overflow-hidden">
          ITDP Nandurbar
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
            icon={<BadgeIndianRupee size={20} />}
          />

          <NavLink
            to="/aohome/documents"
            label={translations[language].documents}
            path={location.pathname}
            icon={<FileText size={20} />}
          />

<NavLink
            to="/aohome/genreport"
            label="Generate Report"
            path={location.pathname}
            icon={<Download size={20} />}
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
      </aside>

      {/* Page Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Navbar */}
<div className="bg-white p-4 flex justify-between items-center  h-[55px] shadow-md  ">
  {/* Left-aligned text */}
  <div className=" text-[18px] text-blue-950 font2">
    Welcome , Account Officer.
  </div>

  {/* Right-aligned controls */}
  <div className="flex items-center space-x-2">
    <button
      onClick={increaseTextSize}
      className="flex items-center gap-1 px-3 py-2 text-neutral-900 rounded hover:bg-neutral-300"
      title="Increase text size"
    >
      <span>+</span>
      <span>A</span>
    </button>

    <button
      onClick={decreaseTextSize}
      className="flex items-center gap-1 px-3 py-2 text-neutral-900 rounded hover:bg-neutral-300"
      title="Decrease text size"
    >
      <span>-</span>
      <span>A</span>
    </button>

    <select
      value={language}
      onChange={handleLanguageChange}
      className="p-2 text-neutral-800 rounded hover:bg-neutral-300"
      title="Select language"
    >
      <option value="en">EN</option>
      <option value="es">ES</option>
    </select>

    <button
      onClick={handleLogout}
      className="flex items-center justify-center text-white px-2 py-2 rounded-md hover:bg-neutral-300"
    >
      <CirclePower className="mr-2 text-red-500" size={24} />
    </button>
  </div>
</div>


        {/* Routed Content */}
        <div className="flex-1 ">
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
  {/* Smooth background transition */}
  <span
    className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${
      path === to ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
    }`}
  />

  {/* Cyan left border */}
  <span
    className={`absolute left-0 top-0 bottom-0 w-2 bg-cyan-400 transition-all duration-300 ${
      path === to ? "opacity-100" : "opacity-0"
    }`}
  />

  {/* Keep content on top */}
  <span className="relative flex items-center">
    {icon}
    <span className="ml-2">{label}</span>
  </span>
</Link>


);


export default AOHome;
