import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Bg from './Assets/download.jpg';
import Logo from './Assets/logo.jpeg';
import LoginForm from './Components/Login';
import Home from './Components/Home';
import AOHome from './Components/AOHome';
import Tharav from './Components/Tharav';
import "./i18n";  // Import i18n setup

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
      {/* Background Image Section */}
      <div
        className="w-full md:w-[65%] h-[40vh] sm:h-[50vh] md:h-full flex items-center justify-center border-2 border-amber-300 relative"
        style={{ 
          backgroundImage: `url(${Bg})`, 
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
        }}
      >
        {/* Black Box - Reduced height and fixed text layout */}
        <div className="text-center text-amber-300 bg-black/78 p-2.5 rounded-4xl itdpfont w-11/12 max-w-[630px] mx-auto">
          <div className="border-2 border-amber-300 rounded-4xl py-6 px-10 w-full">
            <p className="head text-[20px]">महाराष्ट्र शासन आदिवासी विकास विभाग</p><br/>
            <p className="head text-[30px] font-bold">एकात्मिक आदिवासी विकास प्रकल्प, नंदुरबार</p><br/>
            <p className="head margz font-bold text-[18px]">नापूर रोड, ता.नंदुरबार, जि.नंदुरबार</p>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="w-full md:w-[35%] h-[60vh] sm:h-[50vh] md:h-full flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Logo */}
        <img 
          src={Logo} 
          className="w-[115px] h-[128px] mb-4" 
          alt="Logo" 
        />
        
        {/* Login Form */}
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default App;