import { useEffect, useMemo, useState } from "react";
import { api, normalizeError } from "../lib/api";

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("PRESENT");
  const [filterDate, setFilterDate] = useState("");

  const [saving, setSaving] = useState(false);

  async function init() {
    setLoading(true); setErr("");
    try {
      const [empRes, attRes] = await Promise.all([
        api.get("/api/employees/"),
        api.get("/api/attendance/"),
      ]);
      setEmployees(empRes.data);
      setRecords(attRes.data);
      if (!employeeId && empRes.data[0]) setEmployeeId(empRes.data[0].employee_id);
    } catch (e) {
      setErr(normalizeError(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { init(); }, []);

  async function markAttendance(e) {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      await api.post("/api/attendance/mark/", { employee_id: employeeId, date, status });
      await loadAttendance();
    } catch (e2) {
      const details = e2.response?.data?.details;
      setErr(details ? JSON.stringify(details) : normalizeError(e2));
    } finally {
      setSaving(false);
    }
  }

  async function loadAttendance() {
    const params = {};
    if (filterDate) params.date = filterDate;
    setErr("");
    try {
      const res = await api.get("/api/attendance/", { params });
      setRecords(res.data);
    } catch (e) {
      setErr(normalizeError(e));
    }
  }

  const presentCounts = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      if (r.status === "PRESENT") {
        const k = r.employee.employee_id;
        map.set(k, (map.get(k) || 0) + 1);
      }
    }
    return map;
  }, [records]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-2 bg-white border rounded-2xl p-4">
        <h2 className="font-semibold">Mark Attendance</h2>
        <p className="text-sm text-slate-500 mb-4">Record daily attendance.</p>

        {err && <div className="mb-3 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{err}</div>}

        <form onSubmit={markAttendance} className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Employee</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.employee_id}>
                  {e.employee_id} — {e.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Date</label>
            <input className="border rounded-lg px-3 py-2" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Status</label>
            <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>

          <button
            disabled={saving || employees.length === 0}
            className="mt-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm disabled:opacity-60"
          >
            {saving ? "Saving…" : "Mark Attendance"}
          </button>

          {employees.length === 0 && (
            <div className="text-sm text-slate-500">
              Add employees first to mark attendance.
            </div>
          )}
        </form>
      </section>

      <section className="lg:col-span-3 bg-white border rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Attendance Records</h2>
            <p className="text-sm text-slate-500">Filter by date and view total presents.</p>
          </div>

          <div className="flex gap-2 items-center">
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <button className="border rounded-lg px-3 py-2 text-sm" onClick={loadAttendance}>
              Apply
            </button>
            <button className="border rounded-lg px-3 py-2 text-sm" onClick={() => { setFilterDate(""); init(); }}>
              Reset
            </button>
          </div>
        </div>

        {loading && <div className="mt-4 text-sm text-slate-500">Loading attendance…</div>}
        {!loading && records.length === 0 && (
          <div className="mt-4 text-sm text-slate-500">No attendance records found.</div>
        )}

        {!loading && records.length > 0 && (
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th className="text-right">Total Presents</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.date}</td>
                    <td className="font-medium">{r.employee.employee_id} — {r.employee.full_name}</td>
                    <td>{r.status === "PRESENT" ? "Present" : "Absent"}</td>
                    <td className="text-right">{presentCounts.get(r.employee.employee_id) || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}