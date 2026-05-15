"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

const initialState = {
  email: "",
  password: "",
  employeeCode: "",
  fullName: "",
  department: "",
  position: "",
  manager: ""
};

export function CreateEmployeeForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function update(name: keyof typeof initialState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "创建失败。");
      return;
    }

    setMessage("员工账号已创建。");
    setForm(initialState);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="surface rounded-lg p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-bridge-gold">Create Employee</p>
          <h2 className="mt-2 text-xl font-black text-white">新增员工账号</h2>
        </div>
        <UserPlus className="h-5 w-5 text-bridge-cyan" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="input" type="email" placeholder="员工邮箱" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        <input className="input" type="password" placeholder="初始密码" value={form.password} onChange={(event) => update("password", event.target.value)} required />
        <input className="input" placeholder="员工编号" value={form.employeeCode} onChange={(event) => update("employeeCode", event.target.value)} required />
        <input className="input" placeholder="员工姓名" value={form.fullName} onChange={(event) => update("fullName", event.target.value)} required />
        <input className="input" placeholder="部门" value={form.department} onChange={(event) => update("department", event.target.value)} />
        <input className="input" placeholder="职位" value={form.position} onChange={(event) => update("position", event.target.value)} />
        <input className="input md:col-span-2" placeholder="直属经理" value={form.manager} onChange={(event) => update("manager", event.target.value)} />
      </div>
      {message ? <p className="mt-4 text-sm text-blue-100">{message}</p> : null}
      <button className="btn-primary mt-5" disabled={loading} type="submit">
        <UserPlus className="h-4 w-4" />
        {loading ? "正在创建..." : "创建员工"}
      </button>
    </form>
  );
}
