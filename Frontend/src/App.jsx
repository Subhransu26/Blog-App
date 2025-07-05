import { Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "./pages/Authform";
import Navbar from "./components/NavBar";
import About from "./pages/About"; 
import Blogs from "./pages/Blogs";
import AddBlog from "./pages/AddBlog";
import BlogDetail from "./pages/BlogDetail";

function App() {
  return (
    <div className="pt-10 overflow-auto scrollbar-none"> {/* top padding to account for fixed navbar */}
      <Navbar /> {/* Always visible */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/add-blog" element={<AddBlog />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />


      </Routes>
    </div>
  );
}

export default App;
