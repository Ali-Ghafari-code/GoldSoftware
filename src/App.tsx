import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ensureSeed } from "@/lib/seed";

import DashboardPage from "@/pages/Dashboard";
import SalesPage from "@/pages/Sales";
import PurchasesPage from "@/pages/Purchases";
import CustomersPage from "@/pages/Customers";
import SuppliersPage from "@/pages/Suppliers";
import InventoryPage from "@/pages/Inventory";
import LedgerPage from "@/pages/Ledger";
import CoinsPage from "@/pages/Coins";
import ChecksPage from "@/pages/Checks";
import CalculatorPage from "@/pages/Calculator";
import ReportsPage from "@/pages/Reports";
import SettingsPage from "@/pages/Settings";

export default function App() {
  useEffect(() => {
    ensureSeed();
  }, []);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/purchases" element={<PurchasesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/coins" element={<CoinsPage />} />
        <Route path="/checks" element={<ChecksPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
