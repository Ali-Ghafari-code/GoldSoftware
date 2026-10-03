# مدیریت طلا و جواهر — Gold & Jewelry Business Web App

A professional Persian (RTL) web application for Iranian gold, jewelry, bullion
and coin shops. Built with React, TypeScript, Vite, Tailwind CSS and shadcn/ui
primitives. Entirely frontend — all data is stored in the browser's
`localStorage`, so there is no backend to deploy.

## Features

- **داشبورد** with KPIs, quick actions and alerts
- **فروش** — multi-line sales invoices with the gold calculation engine,
  mixed payments (cash, POS, transfer, check, credit, gold), tax and discount
- **خرید** — purchase invoices with supplier, karat, weights and auto totals
- **انبار و ویترین** — jewelry/bullion/coin inventory with weights, karat,
  location, barcode and jewelry number
- **مشتریان** و **تأمین‌کنندگان** with opening Rial and gold balances
- **دفتر طلا و ریال** — unified ledger of Rial and gold debits/credits
- **سکه** — multi-type coin management with per-type balances
- **چک‌ها** — received and paid cheques with status workflow
- **ماشین حساب طلا** — transparent breakdown (net weight, fine gold,
  gold value, making charge, profit, tax, discount, final amount)
- **گزارش‌ها** — daily sales/purchases, inventory by karat, party summaries
- **تنظیمات** — company info, default gold price, karat, making charge,
  profit, tax, data reset
- Jalali date formatting and Persian numerals throughout
- Keyboard-friendly forms with shadcn components
- No backend — all data persists in `localStorage`

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Tech stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- shadcn/ui primitives (Dialog, Select, Table, Tabs, Toast, etc.)
- Radix UI
- Lucide icons
- React Router v6
- Vazirmatn font (Google Fonts) for Persian

## Data model (summary)

Core entities, all stored in `localStorage` under the `goldshop:` prefix:

- `customers`, `suppliers`, `products`
- `sales`, `purchases`
- `coins`, `checks`
- `ledger` (unified Rial + gold ledger)
- `settings`

## Project structure

```
src/
├── components/
│   ├── common/      # PageHeader, EmptyState
│   ├── layout/      # AppLayout, Sidebar, Header
│   └── ui/          # shadcn primitives
├── lib/
│   ├── calc.ts      # Gold calculation engine
│   ├── hooks.ts     # useCollection hook
│   ├── jalali.ts    # Jalali date + Persian number helpers
│   ├── seed.ts      # Default settings and demo data
│   ├── storage.ts   # localStorage persistence
│   ├── types.ts     # Shared TypeScript types
│   └── utils.ts
├── pages/           # One file per route
├── App.tsx          # Router
├── main.tsx
└── index.css
```
