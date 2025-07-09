import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      className="transition-all duration-300 ease-in-out flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full shadow-md"
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="text-yellow-400 w-5 h-5 " />
      ) : (
        <Moon className="text-gray-800 dark:text-gray-100 w-5 h-5 " />
      )}
    </button>
  );
}
