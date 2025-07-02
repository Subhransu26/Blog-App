import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthForm from "./pages/Authform";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthForm type={"login"} />} />
        <Route path="/signup" element={<AuthForm type={"signup"} />} />
      </Routes>
    </div>
  );
}

export default App;
