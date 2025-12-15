import { useState, useContext } from "react";
import api from "../axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Login = () => {
  const [input, setInput] = useState({ identifier: "", password: "" });
  const { loginAction } = useContext(AuthContext);

  const navigate = useNavigate();
  const location = useLocation();

  // if we come from a page go there, else go to profile
  const from = location.state?.from?.pathname || "/profile";
	
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("http://localhost:3001/api/auth/login", input);
      const { token, user } = res.data;
      
      loginAction(user, token);
      navigate(from, {replace: true});
      
    } catch (err) {
      alert(err.response.data.message || "Error logging in");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email/Username:</label>
          <input type="text" name="identifier" onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" onChange={handleChange} required />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
