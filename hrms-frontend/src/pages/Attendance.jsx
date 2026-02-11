import { useEffect, useMemo, useState } from "react";
import { api, normalizeError } from "../lib/api";

function toISODate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Attendance() {
  const today = useMemo(() => toISODate(new Date()), []);
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("PRESENT");

  useEffect(() => {
    (async () => {
      setErr("");
      try {
        const [empRes, attRes] = await Promise.all([
          api.get("/api/employees/"),
          api.get("/api/attendance/"),
        ]);
        setEmployees(empRes.data || []);
        setRecords(attRes.data || []);
      } catch (e) {
        setErr(normalizeError(e));
        setEmployees([]);
        setRecords([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rule enforcement:
  // - if selected date is NOT today => force status to ABSENT (present today only)
  useEffect(() => {
    if (!date) return;
    if (date !== today && status === "PRESENT") {
      setStatus("ABSENT");
    }
  }, [date, today, status]);

  async function refreshAttendance() {
    try {
      const res = await api.get("/api/attendance/");
      setRecords(res.data || []);
    } catch (e) {
      setErr(normalizeError(e));
    }
  }

  async function submitAttendance(e) {
    e.preventDefault();
    setErr("");

    if (!employeeId) return setErr("Please select an employee.");
    if (!date) return setErr("Please select a date.");
    if (date > today) return setErr("Future dates are not allowed.");
    if (status === "PRESENT" && date !== today) {
      return setErr("Present can be marked only for today.");
    }

    setSaving(true);
    try {
      await api.post("/api/attendance/mark/", { employee_id: employeeId, date, status });
      await refreshAttendance();
    } catch (e2) {
      const details = e2.response?.data?.details;
      setErr(details ? JSON.stringify(details) : normalizeError(e2));
    } finally {
      setSaving(false);
    }
  }

  const { presentCounts, absentCounts } = useMemo(() => {
  const present = new Map();
  const absent = new Map();

  for (const r of records) {
    const k = r.employee?.employee_id;
    if (!k) continue;

    if (r.status === "PRESENT") {
      present.set(k, (present.get(k) || 0) + 1);
    } else if (r.status === "ABSENT") {
      absent.set(k, (absent.get(k) || 0) + 1);
    }
  }

  return { presentCounts: present, absentCounts: absent };
  }, [records]);


  const isToday = date === today;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-2 bg-white border rounded-2xl p-4">
        <h2 className="font-semibold">Mark Attendance</h2>
        <p className="text-sm text-slate-500 mb-4">
          Absent can be marked for any past date or today. Present can be marked only for today. No future dates.
        </p>

        {err && <div className="mb-3 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{err}</div>}

        <form onSubmit={submitAttendance} className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Employee</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="" disabled>
+               Select employee
+             </option>
              {employees.map((e) => (
                <option key={e.id} value={e.employee_id}>
                  {e.employee_id} — {e.full_name}
                </option>
              ))}
            </select>
            {employees.length === 0 && (
              <div className="text-sm text-slate-500">No employees found. Add employees first.</div>
            )}
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Date</label>
            <input
              className="border rounded-lg px-3 py-2"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={today} // ✅ blocks future dates
              required
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="border rounded-lg px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="PRESENT" disabled={!isToday}>
                Present (today only)
              </option>
              <option value="ABSENT">Absent</option>
            </select>
            {!isToday && (
              <div className="text-xs text-slate-500">
                Present is disabled because the selected date is not today.
              </div>
            )}
          </div>

          <button
            disabled={saving || employees.length === 0 || !employeeId}
            className="mt-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Submit Attendance
          </button>
        </form>
      </section>

      <section className="lg:col-span-3 bg-white border rounded-2xl p-4">
        <h2 className="font-semibold">Attendance Records</h2>
        <p className="text-sm text-slate-500 mb-4">Totals show present days per employee.</p>

        {records.length === 0 ? (
          <div className="text-sm text-slate-500">No attendance records.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th>Employee</th>
                  <th>Status</th>
                  <th className="text-right">Total Present</th>
                  <th className="text-right">Total Absent</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.date}</td>
                    <td className="font-medium">
                      {r.employee?.employee_id} — {r.employee?.full_name}
                    </td>
                    <td>{r.status === "PRESENT" ? "Present" : "Absent"}</td>
                    <td className="text-right">{presentCounts.get(r.employee?.employee_id) || 0}</td>
                    <td className="text-right">{absentCounts.get(r.employee?.employee_id) || 0}</td>
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