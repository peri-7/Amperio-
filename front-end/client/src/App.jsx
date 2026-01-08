import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// context
import { AuthProvider } from "./context/AuthContext";
// Routes
import PrivateRoute from "./components/PrivateRoutes";
import AdminRoute from "./components/AdminRoutes"; 
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import Unauthorized from "./pages/Unauthorized";
import AdminStats from "./pages/AdminStats";

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
					<Route path="/unauthorized" element={<Unauthorized />} />
					
					{/* Private */}
					<Route element={<PrivateRoute />}>

						<Route path="/profile" element={<Profile />} />
					</Route>

					{/* Admin */}
					<Route element={<AdminRoute />}>
						<Route path="/stats" element={<AdminStats/>} />
					</Route>
					
				</Routes>


			</AuthProvider>
		</Router>
	);
}

export default App;
