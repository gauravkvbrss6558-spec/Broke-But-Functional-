export type Expense = { id: number; label: string; amount: number; day: number; cat: string };
export type Item = { id: string; label: string; amount: number; active: boolean };
export type State = {
  day: number; expenses: Expense[]; commitments: Item[]; subs: Item[];
  goal: { label: string; target: number; saved: number };
};

export const BUDGET = 10000;
export const DAYS = 30;
export const CATS = ["Food", "Transport", "Fun", "Shopping", "Study", "Emergency"];
export const SHOCKS = [
  { label: "Friend's birthday gift", amount: 400 },
  { label: "Auto fare surge", amount: 250 },
  { label: "Medicine", amount: 350 },
  { label: "Lost earphones", amount: 500 },
];

export const initial: State = {
  day: 1,
  expenses: [],
  commitments: [
    { id: "pg", label: "PG / room share", amount: 2500, active: true },
    { id: "mess", label: "Mess / tiffin", amount: 1500, active: true },
    { id: "recharge", label: "Phone recharge", amount: 299, active: true },
  ],
  subs: [
    { id: "netflix", label: "Netflix", amount: 199, active: true },
    { id: "spotify", label: "Spotify", amount: 119, active: true },
    { id: "gym", label: "Gym", amount: 500, active: true },
  ],
  goal: { label: "Goa trip fund", target: 1500, saved: 0 },
};

export const inr = (n: number) => (n < 0 ? "-" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");

export function compute(s: State) {
  const spent = s.expenses.reduce((a, e) => a + e.amount, 0);
  const balance = BUDGET - spent - s.goal.saved;
  const bills = [...s.commitments, ...s.subs].filter((i) => i.active).reduce((a, i) => a + i.amount, 0);
  const reserved = bills + Math.max(0, s.goal.target - s.goal.saved);
  const free = balance - reserved;
  const daysLeft = DAYS - s.day + 1;
  const allowance = free / daysLeft;
  const projected = balance - reserved - (spent / s.day) * (DAYS - s.day);
  const risk = free < 0 || projected < 0 ? "High" : projected < BUDGET * 0.1 ? "Medium" : "Low";
  const raw = 60 + (projected / BUDGET) * 100 + (s.goal.saved / s.goal.target) * 20 - (free < 0 ? 30 : 0);
  const health = Math.max(0, Math.min(100, Math.round(raw)));
  return { spent, balance, bills, reserved, free, daysLeft, allowance, projected, risk, health };
}
