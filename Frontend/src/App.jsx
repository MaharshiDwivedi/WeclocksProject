import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Bg from './download.jpg';
import Logo from './logo.jpeg';
import LoginForm from './Login';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-screen">  

<div 
  className=" w-[65%] h-full flex items-center justify-center border-2 border-amber-300"
  style={{ backgroundImage: `url(${Bg})`, backgroundRepeat: 'repeat' }}
>
<div className="self-center text-center text-amber-300 bg-black/78 p-7 rounded-4xl">
      <div className="pmg self-center text-center">
        <div className="pmg2">
          <p className="head text-[20px]">
            महाराष्ट्र शासन आदिवासी विकास विभाग
          </p>

          <p className="head text-[30px] font-bold">
            एकात्मिक आदिवासी विकास प्रकल्प, नंदुरबार
          </p>

          <p className="head margz font-bold">
            नापूर रोड, ता.नंदुरबार, जि.नंदुरबार
          </p>
        </div>
      </div>
    </div>










</div>

























      <div className="w-[35%] flex flex-col items-center justify-center">
        {/* Logo */}
        <img src={Logo} className="w-[115] h-[128px] mb-4" alt="Logo" />
        
     

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}

export default App;
