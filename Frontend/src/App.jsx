// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthForm from "./pages/AuthForm";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Blogs from "./pages/Blogs";
import AddBlog from "./pages/AddBlog";
import BlogDetail from "./pages/BlogDetail";
import EditBlog from "./pages/EditBlog";
import PrivateRoute from "./components/PrivateRoute";
import Home from "./pages/Home";
import VerifyUser from "./components/VerifyUser";

function App() {
  const token = useSelector((state) => state.user.token);

  return (
    <div className="overflow-x-hidden pt-10 overflow-auto scrollbar-none">
      <Navbar />
      <Routes>
        {/* Redirect root based on auth */}
        <Route
          path="/"
          element={<Navigate to={token ? "/home" : "/login"} />}
        />

        {/* Public routes */}
        <Route path="/login" element={<AuthForm type="login" />} />
        <Route path="/signup" element={<AuthForm type="signup" />} />
        <Route path="/about" element={<About />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route
          path="/verify-email/:verificationToken"
          element={<VerifyUser />}
        ></Route>

        {/* Private routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-blog"
          element={
            <PrivateRoute>
              <AddBlog />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-blog/:id"
          element={
            <PrivateRoute>
              <EditBlog />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
