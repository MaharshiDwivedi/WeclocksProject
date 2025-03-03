import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { User, Lock, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
  
      const data = res.data;
      if (data.token) {
        // ✅ Store values properly
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("school_id", data.school_id);
        localStorage.setItem("category_id", data.category_id);
        localStorage.setItem("username", data.user.username);
  
        console.log("Logged in as:", data.user.username);
        console.log("Category ID:", data.category_id);
  
        // ✅ Redirect based on category_id
        if (data.category_id === 37) {
          navigate("/aohome"); // Redirect to AOHOME
        } else {
          navigate("/home"); // Redirect to Home
        }
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setMessage(err.response?.data?.error || "Login failed");
    }
  };
  

  return (
    <div className="bg-white p-8 w-96 rounded-lg">
      <h2 className="text-center text-2xl font-semibold mb-4 realfont">Login</h2>

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
            className="w-full pl-10 pr-4 py-2 border border-red-400 rounded-[4px] outline-none focus:border-red-600 realfont"
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
            className="w-full pl-10 pr-12 py-2 border border-red-400 rounded-[4px] outline-none focus:border-red-600 realfont"
          />

          <button
            type="button"
            className="absolute right-0 top-0 h-full bg-[#e3535c] px-3 rounded-r-[4px] flex items-center justify-center hover:bg-[#8fbd56e6] hover:cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} color="white" />
            ) : (
              <Eye size={18} color="white" />
            )}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#e3535c] text-white py-2 rounded-[4px] font-semibold hover:bg-[#8fbd56e6] hover:cursor-pointer realfont "
        >
          Login
        </button>
      </form>

      {message && <p className="text-center mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default LoginForm;
