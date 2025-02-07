import { useState } from "react";
import axios from "axios";
import { User, Lock, Eye, EyeOff } from "lucide-react"; // Importing Lucide icons

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/login", { username, password });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="bg-white p-8 w-96 rounded-lg">
      <h2 className="text-center text-2xl font-semibold mb-4">Login</h2>

      <form onSubmit={handleLogin}>

        <div className="mb-4 relative">
          <span className="absolute left-3 top-3 text-gray-500">
            <User size={18} />
          </span>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-red-400 rounded-lg outline-none focus:border-red-600"
          />
        </div>

      
      
        <div className="mb-4 relative">
          <span className="absolute left-3 top-3 text-gray-500">
            <Lock size={18} />
          </span>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-red-400 rounded-lg outline-none focus:border-red-600"
          />

          {/* Eye Toggle Button */}
          <button
            type="button"
            className="absolute right-0 top-0 h-full bg-[#e3535c] px-3 rounded-r-lg flex items-center justify-center hover:bg-[#8fbd56e6] hover:cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} color="white" /> : <Eye size={18} color="white" />}
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-[#e3535c] text-white py-2 rounded-lg font-semibold hover:bg-[#8fbd56e6] hover:cursor-pointer"
        >
          Login
        </button>
      </form>

      {/* Display Login Message */}
      {message && <p className="text-center mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default LoginForm;
