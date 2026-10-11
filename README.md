# Broke But Functional — Survive the Month
Gen Z personal finance simulator for a ₹10,000 / 30-day budget.

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS v4, next/font.

**Features:** daily allowance, spend simulator (before/after on balance, allowance, forecast, risk, health), commitments, cancellable subscriptions, savings goal, surprise expenses, category breakdown, day slider.

**Logic:** all calculations live in `lib/finance.ts`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```
Deploy: push to GitHub, import on Vercel.
