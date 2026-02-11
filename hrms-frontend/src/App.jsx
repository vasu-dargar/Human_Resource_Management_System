import { useState } from "react";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

export default function App() {
  const [tab, setTab] = useState("employees");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">HRMS Lite</h1>
            <p className="text-sm text-slate-500">Employee & Attendance Management</p>
          </div>
          <nav className="flex gap-2">
            <button
              className={`px-3 py-2 rounded-lg text-sm ${tab==="employees" ? "bg-slate-900 text-white" : "bg-slate-100"}`}
              onClick={() => setTab("employees")}
            >
              Employees
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm ${tab==="attendance" ? "bg-slate-900 text-white" : "bg-slate-100"}`}
              onClick={() => setTab("attendance")}
            >
              Attendance
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "employees" ? <Employees /> : <Attendance />}
      </main>
    </div>
  );
}