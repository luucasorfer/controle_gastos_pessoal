import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import FixedExpenses from "./pages/FixedExpenses";
import VariableExpenses from "./pages/VariableExpenses";
import Incomes from "./pages/Incomes";
import EmergencyReserve from "./pages/EmergencyReserve";
import SavingsGoals from "./pages/SavingsGoals";
import { LayoutDashboard, Tag, Receipt, TrendingUp, Wallet, PiggyBank, Target } from "lucide-react";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Categorias",
    href: "/categories",
    icon: Tag,
  },
  {
    title: "Gastos Fixos",
    href: "/fixed-expenses",
    icon: Receipt,
  },
  {
    title: "Gastos Variáveis",
    href: "/variable-expenses",
    icon: TrendingUp,
  },
  {
    title: "Receitas",
    href: "/incomes",
    icon: Wallet,
  },
  {
    title: "Reserva de Emergência",
    href: "/emergency-reserve",
    icon: PiggyBank,
  },
  {
    title: "Metas de Economia",
    href: "/savings-goals",
    icon: Target,
  },
];

function Router() {
  return (
    <Switch>
      <Route path="/">
        <DashboardLayout navItems={NAV_ITEMS}>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path="/categories">
        <DashboardLayout navItems={NAV_ITEMS}>
          <Categories />
        </DashboardLayout>
      </Route>
      <Route path="/fixed-expenses">
        <DashboardLayout navItems={NAV_ITEMS}>
          <FixedExpenses />
        </DashboardLayout>
      </Route>
      <Route path="/variable-expenses">
        <DashboardLayout navItems={NAV_ITEMS}>
          <VariableExpenses />
        </DashboardLayout>
      </Route>
      <Route path="/incomes">
        <DashboardLayout navItems={NAV_ITEMS}>
          <Incomes />
        </DashboardLayout>
      </Route>
      <Route path="/emergency-reserve">
        <DashboardLayout navItems={NAV_ITEMS}>
          <EmergencyReserve />
        </DashboardLayout>
      </Route>
      <Route path="/savings-goals">
        <DashboardLayout navItems={NAV_ITEMS}>
          <SavingsGoals />
        </DashboardLayout>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
