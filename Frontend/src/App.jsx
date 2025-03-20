import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Bg from "./Assets/download.jpg";
import Logo from "./Assets/logo.jpeg";
import LoginForm from "./Components/Login";
import Home from "./Components/Home";
import AOHome from "./Components/AOHome";
import Tharav from "./Components/Tharav";
import "./i18n"; // Import i18n setup

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home/*" element={<Home />} />
        <Route path="/aohome/*" element={<AOHome />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/home/meeting/Tharav" element={<Tharav />} />
      </Routes>
    </Router>
  );
}

const LoginPage = () => {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Background Image Section - Full screen on mobile */}
      <div
        className="w-full md:w-[65%] h-[40vh] sm:h-[45vh] md:h-full flex items-center justify-center border-2 border-amber-300 relative"
        style={{
          backgroundImage: `url(${Bg})`,
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "center",
        }}
      >
        {/* Black Box - Larger size with shadow */}
        <div className="text-center text-amber-300 bg-black/80 p-3 sm:p-4 rounded-4xl itdpfont w-[95%] sm:w-[90%] max-w-[700px] mx-auto shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="border-2 border-amber-300 rounded-4xl py-5 sm:py-8 px-5 sm:px-12 w-full shadow-[inset_0_0_10px_rgba(255,191,0,0.3)]">
            <p className="head text-[18px] sm:text-[22px] md:text-[24px]">
              महाराष्ट्र शासन आदिवासी विकास विभाग
            </p>
            <br />
            <p className="head text-[24px] sm:text-[32px] md:text-[36px] font-bold">
              एकात्मिक आदिवासी विकास प्रकल्प, नंदुरबार
            </p>
            <br />
            <p className="head margz font-bold text-[16px] sm:text-[20px] md:text-[22px]">
              नापूर रोड, ता.नंदुरबार, जि.नंदुरबार
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full md:w-[35%] h-[60vh] sm:h-[55vh] md:h-full flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Logo - Larger size */}
        <img
          src={Logo || "/placeholder.svg"}
          className="w-[110px] h-[120px] sm:w-[150px] sm:h-[145px] mb-6 shadow-md rounded-md"
          alt="Logo"
        />

        {/* Login Form */}
        <div className="w-full max-w-xs sm:max-w-sm flex justify-center bg-white rounded-lg shadow-md shadow-gray-200 ">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default App;
