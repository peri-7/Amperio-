import { useState, useContext } from "react";
import api from "../axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  // Inputs state
  const [input, setInput] = useState({ name: "", email: "", password: "" });
  
  // Bring in the Global tools
  const { loginAction } = useContext(AuthContext);
  const navigate = useNavigate(); // To redirect user

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Send data to backend
      const res = await api.post("http://localhost:3001/api/auth/signup", input);
      
      // 2. Get the token and user from the response
      const { token, user } = res.data;
      
      // 3. Save them in the Global Brain
      loginAction(user, token);
      
      // 4. Redirect to Dashboard
      alert("Sign-up Successful!");
      navigate("/profile");

    } catch (err) {
      alert(err.response.data.message || "Error registering");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <h2>Sign-up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input type="text" name="name" onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" onChange={handleChange} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" onChange={handleChange} required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
