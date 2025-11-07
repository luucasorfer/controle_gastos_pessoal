import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function FixedExpenses() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [dueDay, setDueDay] = useState("1");

  const utils = trpc.useUtils();
  const { data: expenses, isLoading: expensesLoading } = trpc.fixedExpenses.list.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  const createMutation = trpc.fixedExpenses.create.useMutation({
    onSuccess: () => {
      utils.fixedExpenses.list.invalidate();
      toast.success("Gasto fixo criado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar gasto: " + error.message);
    },
  });

  const updateMutation = trpc.fixedExpenses.update.useMutation({
    onSuccess: () => {
      utils.fixedExpenses.list.invalidate();
      toast.success("Gasto fixo atualizado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar gasto: " + error.message);
    },
  });

  const deleteMutation = trpc.fixedExpenses.delete.useMutation({
    onSuccess: () => {
      utils.fixedExpenses.list.invalidate();
      toast.success("Gasto fixo excluído com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir gasto: " + error.message);
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
    setCategoryId("");
    setAmount("");
    setDueDay("1");
  };

  const handleSubmit = () => {
    if (!name.trim() || !categoryId || !amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: name.trim(),
        categoryId: parseInt(categoryId),
        amount: amountInCents,
        dueDay: parseInt(dueDay),
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        categoryId: parseInt(categoryId),
        amount: amountInCents,
        dueDay: parseInt(dueDay),
      });
    }
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setName(expense.name);
    setCategoryId(expense.categoryId.toString());
    setAmount((expense.amount / 100).toFixed(2));
    setDueDay(expense.dueDay.toString());
    setOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const toggleActive = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, isActive: !currentStatus });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getCategoryName = (catId: number) => {
    const cat = categories?.find(c => c.id === catId);
    return cat ? `${cat.icon} ${cat.name}` : 'Desconhecida';
  };

  const totalActive = expenses?.filter(e => e.isActive).reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos Fixos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas despesas mensais recorrentes
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Gasto Fixo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Criar"} Gasto Fixo</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize as informações do gasto" : "Adicione um novo gasto fixo mensal"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Aluguel, Condomínio..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="dueDay">Dia do Vencimento</Label>
                  <Select value={dueDay} onValueChange={setDueDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          Dia {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              Total de gastos fixos ativos
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalActive)}
            </div>
          </div>

          {expensesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !expenses || expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum gasto fixo cadastrado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.name}</TableCell>
                    <TableCell>{getCategoryName(expense.categoryId)}</TableCell>
                    <TableCell>Dia {expense.dueDay}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(expense.id, expense.isActive)}
                      >
                        {expense.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id, expense.name)}
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
