import { useEffect, useState } from "react";
import { api, normalizeError } from "../lib/api";

export default function Employees() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setErr("");
    try {
      const res = await api.get("/api/employees/");
      setItems(res.data);
    } catch (e) {
      setErr(normalizeError(e));
      setItems([]); // safe fallback
    }
  }

  useEffect(() => { load(); }, []);

  async function addEmployee(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      await api.post("/api/employees/", form);
      setForm({ employee_id: "", full_name: "", email: "", department: "" });
      await load();
    } catch (e2) {
      const details = e2.response?.data?.details;
      setErr(details ? JSON.stringify(details) : normalizeError(e2));
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(id) {
    if (!confirm("Delete this employee? Attendance records will also be removed.")) return;
    setErr("");
    try {
      await api.delete(`/api/employees/${id}/`);
      await load();
    } catch (e) {
      setErr(normalizeError(e));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="lg:col-span-2 bg-white border rounded-2xl p-4">
        <h2 className="font-semibold">Add Employee</h2>
        <p className="text-sm text-slate-500 mb-4">Create a new employee record.</p>

        {err && <div className="mb-3 rounded-lg bg-red-50 text-red-700 p-3 text-sm">{err}</div>}

        <form onSubmit={addEmployee} className="grid gap-3">
          {["employee_id","full_name","email","department"].map((k) => (
            <div key={k} className="grid gap-1">
              <label className="text-sm font-medium">{k.replace("_"," ").toUpperCase()}</label>
              <input
                className="border rounded-lg px-3 py-2"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                type={k === "email" ? "email" : "text"}
                required
              />
            </div>
          ))}

          <button
            disabled={saving}
            className="mt-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add Employee
          </button>
        </form>
      </section>

      <section className="lg:col-span-3 bg-white border rounded-2xl p-4">
        <h2 className="font-semibold">Employees</h2>
        <p className="text-sm text-slate-500 mb-4">Manage employee list.</p>

        {items.length === 0 ? (
          <div className="text-sm text-slate-500">No employees found.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Emp ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="py-2 font-medium">{e.employee_id}</td>
                    <td>{e.full_name}</td>
                    <td>{e.email}</td>
                    <td>{e.department}</td>
                    <td className="text-right">
                      <button className="text-red-600 hover:underline" onClick={() => deleteEmployee(e.id)}>
                        Delete
                      </button>
                    </td>
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