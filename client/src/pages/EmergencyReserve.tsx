import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

export default function EmergencyReserve() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isDeposit, setIsDeposit] = useState(true);

  const utils = trpc.useUtils();
  const { data: transactions, isLoading: transactionsLoading } = trpc.emergencyReserve.list.useQuery();
  const { data: balance, isLoading: balanceLoading } = trpc.emergencyReserve.balance.useQuery();

  const addTransactionMutation = trpc.emergencyReserve.addTransaction.useMutation({
    onSuccess: () => {
      utils.emergencyReserve.list.invalidate();
      utils.emergencyReserve.balance.invalidate();
      utils.dashboard.summary.invalidate();
      toast.success("Transação registrada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao registrar transação: " + error.message);
    },
  });

  const deleteMutation = trpc.emergencyReserve.delete.useMutation({
    onSuccess: () => {
      utils.emergencyReserve.list.invalidate();
      utils.emergencyReserve.balance.invalidate();
      utils.dashboard.summary.invalidate();
      toast.success("Transação excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir transação: " + error.message);
    },
  });

  const resetForm = () => {
    setOpen(false);
    setAmount("");
    setDescription("");
    setIsDeposit(true);
  };

  const handleSubmit = () => {
    if (!amount) {
      toast.error("Digite um valor para a transação");
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    const finalAmount = isDeposit ? amountInCents : -amountInCents;

    addTransactionMutation.mutate({
      amount: finalAmount,
      date: new Date(),
      description: description.trim() || undefined,
    });
  };

  const handleDelete = (id: number, desc: string) => {
    if (confirm(`Tem certeza que deseja excluir esta transação${desc ? ` (${desc})` : ''}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date));
  };

  const totalDeposits = transactions?.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalWithdrawals = Math.abs(transactions?.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0) || 0);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reserva de Emergência</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua reserva financeira para imprevistos
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Transação</DialogTitle>
              <DialogDescription>
                Adicione um depósito ou retirada da reserva de emergência
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={isDeposit ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setIsDeposit(true)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Depósito
                </Button>
                <Button
                  variant={!isDeposit ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setIsDeposit(false)}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Retirada
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Motivo da transação..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={addTransactionMutation.isPending}
              >
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {balanceLoading ? "..." : formatCurrency(balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Disponível para emergências
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Depositado</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(totalDeposits)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todos os depósitos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retirado</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totalWithdrawals)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todas as retiradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            Todas as movimentações da sua reserva de emergência
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma transação registrada ainda.</p>
              <p className="text-sm mt-2">Comece a construir sua reserva de emergência!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const isDeposit = transaction.amount > 0;
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        {transaction.description || (
                          <span className="text-muted-foreground italic">Sem descrição</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isDeposit ? "default" : "secondary"}>
                          {isDeposit ? (
                            <>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Depósito
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3 mr-1" />
                              Retirada
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${isDeposit ? 'text-primary' : 'text-destructive'}`}>
                        {isDeposit ? '+' : ''}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id, transaction.description || "")}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
