import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Edit, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function VariableExpenses() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [installments, setInstallments] = useState("1");
  const [currentInstallment, setCurrentInstallment] = useState("1");
  const [notes, setNotes] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

  const utils = trpc.useUtils();
  const { data: expenses, isLoading: expensesLoading } = trpc.variableExpenses.list.useQuery({
    startDate,
    endDate,
  });
  const { data: categories } = trpc.categories.list.useQuery();

  const createMutation = trpc.variableExpenses.create.useMutation({
    onSuccess: () => {
      utils.variableExpenses.list.invalidate();
      toast.success("Gasto variável criado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar gasto: " + error.message);
    },
  });

  const updateMutation = trpc.variableExpenses.update.useMutation({
    onSuccess: () => {
      utils.variableExpenses.list.invalidate();
      toast.success("Gasto variável atualizado com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar gasto: " + error.message);
    },
  });

  const deleteMutation = trpc.variableExpenses.delete.useMutation({
    onSuccess: () => {
      utils.variableExpenses.list.invalidate();
      toast.success("Gasto variável excluído com sucesso!");
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
    setDate(new Date().toISOString().split('T')[0]);
    setInstallments("1");
    setCurrentInstallment("1");
    setNotes("");
    setIsPaid(false);
  };

  const handleSubmit = () => {
    if (!name.trim() || !categoryId || !amount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const amountInCents = Math.round(parseFloat(amount) * 100);
    const dateObj = new Date(date + 'T00:00:00');

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: name.trim(),
        categoryId: parseInt(categoryId),
        amount: amountInCents,
        date: dateObj,
        installments: parseInt(installments),
        currentInstallment: parseInt(currentInstallment),
        isPaid,
        notes: notes.trim() || undefined,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        categoryId: parseInt(categoryId),
        amount: amountInCents,
        date: dateObj,
        installments: parseInt(installments),
        currentInstallment: parseInt(currentInstallment),
        isPaid,
        notes: notes.trim() || undefined,
      });
    }
  };

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setName(expense.name);
    setCategoryId(expense.categoryId.toString());
    setAmount((expense.amount / 100).toFixed(2));
    setDate(new Date(expense.date).toISOString().split('T')[0]);
    setInstallments(expense.installments.toString());
    setCurrentInstallment(expense.currentInstallment.toString());
    setNotes(expense.notes || "");
    setIsPaid(expense.isPaid);
    setOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const togglePaid = (id: number, currentStatus: boolean) => {
    updateMutation.mutate({ id, isPaid: !currentStatus });
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

  const getCategoryName = (catId: number) => {
    const cat = categories?.find(c => c.id === catId);
    return cat ? `${cat.icon} ${cat.name}` : 'Desconhecida';
  };

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalPaid = expenses?.filter(e => e.isPaid).reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalPending = totalExpenses - totalPaid;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gastos Variáveis</h1>
          <p className="text-muted-foreground mt-1">
            Registre compras, parcelamentos e gastos eventuais
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Criar"} Gasto Variável</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize as informações do gasto" : "Adicione um novo gasto variável"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Compra no supermercado, Netflix..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentInstallment">Parcela Atual</Label>
                  <Input
                    id="currentInstallment"
                    type="number"
                    min="1"
                    value={currentInstallment}
                    onChange={(e) => setCurrentInstallment(e.target.value)}
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
                  id="isPaid"
                  checked={isPaid}
                  onCheckedChange={(checked) => setIsPaid(checked as boolean)}
                />
                <Label htmlFor="isPaid" className="cursor-pointer">
                  Marcar como pago
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Total do Mês</div>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Pago</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-1">Pendente</div>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalPending)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {expensesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : !expenses || expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum gasto variável cadastrado neste mês.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Parcelas</TableHead>
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
                    <TableCell>{formatDate(expense.date)}</TableCell>
                    <TableCell>
                      {expense.installments > 1 
                        ? `${expense.currentInstallment}/${expense.installments}` 
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={expense.isPaid ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => togglePaid(expense.id, expense.isPaid)}
                      >
                        {expense.isPaid ? "Pago" : "Pendente"}
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
