"use client";
import { useMemo, useState } from "react";
import { BUDGET, CATS, DAYS, SHOCKS, compute, initial, inr, type Item, type State } from "@/lib/finance";

const riskStyle: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-900",
  Medium: "bg-amber-100 text-amber-900",
  High: "bg-red-100 text-red-900",
};
const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5";

export default function Home() {
  const [s, setS] = useState<State>(initial);
  const [label, setLabel] = useState("");
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState(CATS[0]);
  const now = useMemo(() => compute(s), [s]);
  const amount = Number(amt) || 0;
  const sim = useMemo(
    () => (amount > 0 ? compute({ ...s, expenses: [...s.expenses, { id: -1, label: "sim", amount, day: s.day, cat }] }) : null),
    [s, amount, cat],
  );

  const addExpense = (l: string, a: number, c: string) =>
    setS((p) => ({ ...p, expenses: [{ id: Date.now(), label: l, amount: a, day: p.day, cat: c }, ...p.expenses] }));
  const toggle = (key: "commitments" | "subs", id: string) =>
    setS((p) => ({ ...p, [key]: p[key].map((i) => (i.id === id ? { ...i, active: !i.active } : i)) }));
  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    addExpense(label.trim() || cat, amount, cat);
    setLabel(""); setAmt("");
  };
  const shock = () => {
    const x = SHOCKS[Math.floor(Math.random() * SHOCKS.length)];
    addExpense(x.label, x.amount, "Emergency");
  };
  const byCat = CATS.map((c) => ({ c, v: s.expenses.filter((e) => e.cat === c).reduce((a, e) => a + e.amount, 0) }));
  const maxCat = Math.max(1, ...byCat.map((x) => x.v));

  const rows = sim
    ? [
        ["Balance", inr(now.balance), inr(sim.balance)],
        ["Daily allowance", inr(now.allowance), inr(sim.allowance)],
        ["Month-end forecast", inr(now.projected), inr(sim.projected)],
        ["Goal still needed", inr(Math.max(0, s.goal.target - s.goal.saved)), inr(Math.max(0, s.goal.target - s.goal.saved))],
        ["Risk", now.risk, sim.risk],
        ["Health", `${now.health}/100`, `${sim.health}/100`],
      ]
    : [];

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Broke But Functional</h1>
          <p className="text-slate-600">₹{BUDGET.toLocaleString("en-IN")} · {DAYS} days · every decision has a price tag.</p>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">
          Day {s.day} of {DAYS}
          <input type="range" min={1} max={DAYS} value={s.day} onChange={(e) => setS({ ...s, day: Number(e.target.value) })} className="accent-[#5b3df5]" />
        </label>
      </header>

      <section aria-labelledby="allow" className="rounded-3xl bg-[#1b1b2f] p-6 text-white sm:p-8">
        <h2 id="allow" className="text-sm font-medium text-violet-200">You can spend today</h2>
        <p className={`text-6xl font-extrabold tracking-tight sm:text-8xl ${now.allowance < 0 ? "text-red-300" : ""}`}>{inr(now.allowance)}</p>
        <p className="mt-2 text-violet-200">
          {now.free < 0 ? "You're over budget. Cancel a subscription or skip a spend." : `${now.daysLeft} days left, ${inr(now.free)} free after bills and savings.`}
        </p>
        <div className="mt-5 grid grid-cols-10 gap-1 sm:grid-cols-30" role="img" aria-label={`Day ${s.day} of ${DAYS}`} style={{ gridTemplateColumns: `repeat(${DAYS}, minmax(0,1fr))` }}>
          {Array.from({ length: DAYS }, (_, i) => (
            <span key={i} className={`h-3 rounded-sm ${i < s.day ? "bg-violet-400" : "bg-white/15"}`} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2" aria-label="Spend simulator">
        <form onSubmit={confirm} className={card}>
          <h2 className="text-lg font-bold">Try a spend before you make it</h2>
          <div className="mt-3 space-y-3">
            <label className="block text-sm font-medium">What is it?
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Biryani with friends" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <div className="flex gap-3">
              <label className="block flex-1 text-sm font-medium">Amount (₹)
                <input type="number" min={0} inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
              </label>
              <label className="block flex-1 text-sm font-medium">Category
                <select value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                  {CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={amount <= 0} className="rounded-lg bg-[#5b3df5] px-4 py-2 font-semibold text-white disabled:opacity-40">Spend it</button>
              <button type="button" onClick={shock} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold">Something came up</button>
            </div>
          </div>
        </form>

        <div className={card} aria-live="polite">
          <h2 className="text-lg font-bold">What changes</h2>
          {sim ? (
            <table className="mt-3 w-full text-sm">
              <thead><tr className="text-left text-slate-500"><th className="py-1 font-medium">Metric</th><th className="font-medium">Now</th><th className="font-medium">After</th></tr></thead>
              <tbody>
                {rows.map(([k, a, b]) => (
                  <tr key={k} className="border-t border-slate-100"><td className="py-2">{k}</td><td>{a}</td><td className="font-bold">{b}</td></tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-slate-600">Enter an amount to see how it moves your balance, daily allowance, forecast, risk and health.</p>
          )}
          {sim && sim.free < 0 && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-900">This pushes you past your safe limit. Cancel a subscription to recover.</p>}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Summary">
        {[
          ["Balance", inr(now.balance)],
          ["Month-end forecast", inr(now.projected)],
          ["Spent so far", inr(now.spent)],
        ].map(([k, v]) => (
          <div key={k} className={card}><p className="text-sm text-slate-600">{k}</p><p className="text-2xl font-extrabold">{v}</p></div>
        ))}
        <div className={card}>
          <p className="text-sm text-slate-600">Risk · Health</p>
          <p className="text-2xl font-extrabold">{now.health}<span className="text-base font-medium">/100</span></p>
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${riskStyle[now.risk]}`}>{now.risk} risk</span>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {([["Commitments", "commitments", s.commitments], ["Subscriptions", "subs", s.subs]] as [string, "commitments" | "subs", Item[]][]).map(([title, key, items]) => (
          <div key={key} className={card}>
            <h2 className="text-lg font-bold">{title}</h2>
            <ul className="mt-2 divide-y divide-slate-100">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2">
                  <span className={i.active ? "" : "text-slate-400 line-through"}>{i.label} · {inr(i.amount)}</span>
                  <button onClick={() => toggle(key, i.id)} aria-pressed={i.active} className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium">
                    {i.active ? (key === "subs" ? "Cancel" : "Skip") : "Restore"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className={card}>
          <h2 className="text-lg font-bold">{s.goal.label}</h2>
          <progress className="mt-3 h-3 w-full accent-[#5b3df5]" value={s.goal.saved} max={s.goal.target} aria-label="Savings progress" />
          <p className="mt-1 text-sm text-slate-600">{inr(s.goal.saved)} of {inr(s.goal.target)}</p>
          <button onClick={() => setS((p) => ({ ...p, goal: { ...p.goal, saved: Math.min(p.goal.target, p.goal.saved + 100) } }))} className="mt-3 rounded-lg bg-[#5b3df5] px-4 py-2 font-semibold text-white">Save ₹100</button>
        </div>
        <div className={card}>
          <h2 className="text-lg font-bold">Where it went</h2>
          <ul className="mt-2 space-y-2">
            {byCat.map(({ c, v }) => (
              <li key={c} className="text-sm">
                <div className="flex justify-between"><span>{c}</span><span>{inr(v)}</span></div>
                <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-[#5b3df5]" style={{ width: `${(v / maxCat) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={card}>
        <h2 className="text-lg font-bold">Spending log</h2>
        {s.expenses.length === 0 ? (
          <p className="mt-2 text-slate-600">Nothing spent yet. Try a spend above to see what it costs you.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100">
            {s.expenses.map((e) => (
              <li key={e.id} className="flex justify-between py-2 text-sm"><span>Day {e.day} · {e.label} ({e.cat})</span><span className="font-semibold">{inr(e.amount)}</span></li>
            ))}
          </ul>
        )}
      </section>
      <button onClick={() => setS(initial)} className="text-sm font-medium underline">Start the month over</button>
    </main>
  );
}
