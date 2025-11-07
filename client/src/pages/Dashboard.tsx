import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Dashboard() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: upcomingDueDates } = trpc.alerts.upcomingDueDates.useQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: goals } = trpc.savingsGoals.list.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const isPositiveBalance = (summary?.balance || 0) >= 0;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas finanças de forma clara e objetiva
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, idx) => (
                <SelectItem key={idx} value={(idx + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alertas de Vencimento */}
      {upcomingDueDates && upcomingDueDates.length > 0 && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-lg">Alertas de Vencimento</CardTitle>
            </div>
            <CardDescription>
              {upcomingDueDates.length} {upcomingDueDates.length === 1 ? 'conta vence' : 'contas vencem'} nos próximos 3 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingDueDates.map((expense: any) => {
                const dueDate = new Date(expense.dueDate);
                const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={expense.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-gray-800">
                    <div>
                      <div className="font-medium text-sm">{expense.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Vence em {daysUntilDue} {daysUntilDue === 1 ? 'dia' : 'dias'}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-orange-600">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary?.totalIncomes || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de entradas no período
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(summary?.totalExpenses || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Fixas: {formatCurrency(summary?.totalFixedExpenses || 0)} • 
              Variáveis: {formatCurrency(summary?.totalVariableExpenses || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${isPositiveBalance ? 'border-l-primary' : 'border-l-destructive'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Wallet className={`h-4 w-4 ${isPositiveBalance ? 'text-primary' : 'text-destructive'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositiveBalance ? 'text-primary' : 'text-destructive'}`}>
              {formatCurrency(summary?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserva de Emergência</CardTitle>
            <PiggyBank className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(summary?.reserveBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Saldo total: {formatCurrency(summary?.balanceWithReserve || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metas de Economia */}
      {goals && goals.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Metas de Economia</CardTitle>
                <CardDescription>
                  Acompanhe o progresso dos seus objetivos financeiros
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/savings-goals'}>
                Ver todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {goals.slice(0, 4).map((goal) => {
                const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                const isCompleted = goal.isCompleted === "1";
                
                return (
                  <div key={goal.id} className="space-y-3 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{goal.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{goal.name}</div>
                          {isCompleted && (
                            <div className="text-xs text-accent font-medium">✓ Concluída</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{progress.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isCompleted ? 'bg-accent' : 'bg-primary'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(goal.currentAmount)}</span>
                        <span>{formatCurrency(goal.targetAmount)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gastos por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
          <CardDescription>
            Distribuição das suas despesas em {MONTHS[selectedMonth - 1]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!summary?.categoryBreakdown || summary.categoryBreakdown.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum gasto registrado neste período</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.categoryBreakdown.map((cat) => (
                <div key={cat.categoryId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.categoryIcon}</span>
                      <span className="font-medium">{cat.categoryName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">
                        {cat.percentage.toFixed(1)}%
                      </span>
                      <span className="font-semibold min-w-[100px] text-right">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
