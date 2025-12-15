import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoutes";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Map from "./pages/Map";

function App() {
  return (
    <Router>
      <AuthProvider>

        <Routes>
  {/* Default */}
  <Route path="/" element={<Navigate to="/map" replace />} />

  {/* Public */}
  <Route path="/map" element={<Map />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  {/* Private */}
  <Route element={<PrivateRoute />}>
    <Route path="/profile" element={<Profile />} />
  </Route>
</Routes>


      </AuthProvider>
    </Router>
  );
}

export default App;
