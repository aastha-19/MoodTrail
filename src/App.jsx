import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./components/Chatbot";
import SOSButton from "./components/SOSButton";
import { Sun, Moon } from "lucide-react";
import "./App.css";

function App() {
  const [dark, setDark] = useState(false);

  // optional: remember preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") setDark(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", dark);
    if (dark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div>
      <button
        className="dark-toggle"
        onClick={() => setDark(!dark)}
        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
        <span>{dark ? "Light Mode" : "Dark Mode"}</span>
      </button>


      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Chatbot />
        <SOSButton />
      </BrowserRouter>
    </div>
  );
}

export default App;
