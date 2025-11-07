import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Edit, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Incomes() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState("");

  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

  const utils = trpc.useUtils();
  const { data: incomes, isLoading } = trpc.incomes.list.useQuery({
    startDate,
    endDate,
  });

  const createMutation = trpc.incomes.create.useMutation({
    onSuccess: () => {
      utils.incomes.list.invalidate();
      utils.dashboard.summary.invalidate();
      toast.success("Receita criada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar receita: " + error.message);
    },
  });

  const updateMutation = trpc.incomes.update.useMutation({
    onSuccess: () => {
      utils.incomes.list.invalidate();
      utils.dashboard.summary.invalidate();
      toast.success("Receita atualizada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar receita: " + error.message);
    },
  });

  const deleteMutation = trpc.incomes.delete.useMutation({
    onSuccess: () => {
      utils.incomes.list.invalidate();
      utils.dashboard.summary.invalidate();
      toast.success("Receita excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir receita: " + error.message);
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setNotes("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    const dateObj = new Date(date + 'T00:00:00');

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: name.trim(),
        amount: amountInCents,
        date: dateObj,
        isRecurring,
        notes: notes.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        amount: amountInCents,
        date: dateObj,
        isRecurring,
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleEdit = (income: any) => {
    setEditingId(income.id);
    setName(income.name);
    setAmount((income.amount / 100).toFixed(2));
    setDate(new Date(income.date).toISOString().split('T')[0]);
    setIsRecurring(income.isRecurring);
    setNotes(income.notes || "");
    setOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
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
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const totalIncomes = incomes?.reduce((sum, i) => sum + i.amount, 0) || 0;
  const recurringIncomes = incomes?.filter(i => i.isRecurring).reduce((sum, i) => sum + i.amount, 0) || 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receitas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas entradas e fontes de renda
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Criar"} Receita</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize as informações da receita" : "Adicione uma nova fonte de renda"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Salário, Freelance, Bônus..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione informações extras..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                />
                <Label htmlFor="isRecurring" className="cursor-pointer">
                  Receita recorrente (mensal)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total do Mês</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(totalIncomes)}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Receitas Recorrentes</div>
                <div className="text-2xl font-bold text-accent">{formatCurrency(recurringIncomes)}</div>
              </div>
              <Calendar className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !incomes || incomes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma receita cadastrada neste mês.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell className="font-medium">
                      {income.name}
                      {income.notes && (
                        <div className="text-xs text-muted-foreground mt-1">{income.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(income.date)}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {formatCurrency(income.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={income.isRecurring ? "default" : "secondary"}>
                        {income.isRecurring ? "Recorrente" : "Pontual"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(income)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(income.id, income.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
