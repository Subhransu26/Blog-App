import { Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./pages/Authform";
import Navbar from "./components/NavBar";
import About from "./pages/About"; 

function App() {
  return (
    <div className="pt-10"> {/* top padding to account for fixed navbar */}
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App;
