import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import Loader from "./Loader";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      const data = res.data;
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("school_id", data.school_id);
        localStorage.setItem("category_id", data.category_id);
        localStorage.setItem("username", data.user.username);

        console.log("Logged in as:", data.user.username);
        console.log("Category ID:", data.category_id);

        await new Promise((resolve) => setTimeout(resolve, 4000));


        if (data.category_id === 37) {
          navigate("/aohome");
        } else {
          navigate("/home");
        }
      } else {
        setMessage(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setMessage(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-8 w-full max-w-xs sm:max-w-sm rounded-lg shadow-lg">
      <h2 className="text-center text-2xl sm:text-3xl font-semibold mb-6 realfont">Enter Details</h2>

      <form onSubmit={handleLogin}>
        <div className="mb-5 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <User size={20} />
          </span>
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-red-400 rounded-[4px] outline-none focus:border-red-600 realfont text-base shadow-sm"
          />
        </div>

        <div className="mb-6 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <Lock size={20} />
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-red-400 rounded-[4px] outline-none focus:border-red-600 realfont text-base shadow-sm"
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full bg-[#e3535c] px-3 rounded-r-[4px] flex items-center justify-center hover:bg-[#8fbd56e6] transition-colors duration-200"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} color="white" /> : <Eye size={20} color="white" />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-[#e3535c] text-white py-3 rounded-[4px] font-semibold hover:bg-[#8fbd56e6] transition-colors duration-200 realfont text-base shadow-md"
        >
          Login
        </button>
      </form>

      {message && <p className="text-center mt-4 text-red-500  realfont text-[15px]">{message} !</p>}
      {loading && (
        <div className="flex justify-center mt-4">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default LoginForm;