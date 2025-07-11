import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function VerifyUser() {
  const { verificationToken } = useParams();            
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");      

  useEffect(() => {
    if (!verificationToken) return;

    const verifyUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/verify-email/${verificationToken}`
        );
        toast.success(res.data.message || "Email verified successfully!");
        setStatus("success");
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Verification failed. Please try again."
        );
        setStatus("error");
      } finally {
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    verifyUser();
  }, [verificationToken, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-purple-600 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
            ></path>
          </svg>
          <span className="text-lg font-medium">Verifying your email…</span>
        </div>
      )}

      {status === "success" && (
        <span className="text-lg font-medium">Email verified! Redirecting…</span>
      )}

      {status === "error" && (
        <span className="text-lg font-medium text-red-600">
          Verification failed. Redirecting…
        </span>
      )}
    </div>
  );
}

export default VerifyUser;
