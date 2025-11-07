import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Target, TrendingUp, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function SavingsGoals() {
  const [open, setOpen] = useState(false);
  const [contributionOpen, setContributionOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [icon, setIcon] = useState("🎯");
  
  // Contribution form states
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionDescription, setContributionDescription] = useState("");

  const utils = trpc.useUtils();
  const { data: goals, isLoading } = trpc.savingsGoals.list.useQuery();

  const createMutation = trpc.savingsGoals.create.useMutation({
    onSuccess: () => {
      utils.savingsGoals.list.invalidate();
      toast.success("Meta criada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao criar meta: " + error.message);
    },
  });

  const updateMutation = trpc.savingsGoals.update.useMutation({
    onSuccess: () => {
      utils.savingsGoals.list.invalidate();
      toast.success("Meta atualizada com sucesso!");
      resetForm();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar meta: " + error.message);
    },
  });

  const deleteMutation = trpc.savingsGoals.delete.useMutation({
    onSuccess: () => {
      utils.savingsGoals.list.invalidate();
      toast.success("Meta excluída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao excluir meta: " + error.message);
    },
  });

  const addContributionMutation = trpc.savingsGoals.addContribution.useMutation({
    onSuccess: () => {
      utils.savingsGoals.list.invalidate();
      toast.success("Contribuição adicionada com sucesso!");
      resetContributionForm();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar contribuição: " + error.message);
    },
  });

  const resetForm = () => {
    setOpen(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setTargetAmount("");
    setDeadline("");
    setIcon("🎯");
  };

  const resetContributionForm = () => {
    setContributionOpen(false);
    setSelectedGoalId(null);
    setContributionAmount("");
    setContributionDescription("");
  };

  const handleSubmit = () => {
    if (!name.trim() || !targetAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const amountInCents = Math.round(parseFloat(targetAmount) * 100);
    const deadlineDate = deadline ? new Date(deadline + 'T00:00:00') : undefined;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: name.trim(),
        description: description.trim() || undefined,
        targetAmount: amountInCents,
        deadline: deadlineDate,
        icon,
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        targetAmount: amountInCents,
        deadline: deadlineDate,
        icon,
      });
    }
  };

  const handleEdit = (goal: any) => {
    setEditingId(goal.id);
    setName(goal.name);
    setDescription(goal.description || "");
    setTargetAmount((goal.targetAmount / 100).toFixed(2));
    setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "");
    setIcon(goal.icon || "🎯");
    setOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a meta "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleAddContribution = (goalId: number) => {
    setSelectedGoalId(goalId);
    setContributionOpen(true);
  };

  const handleSubmitContribution = () => {
    if (!selectedGoalId || !contributionAmount) {
      toast.error("Preencha o valor da contribuição");
      return;
    }

    const amountInCents = Math.round(parseFloat(contributionAmount) * 100);

    addContributionMutation.mutate({
      goalId: selectedGoalId,
      amount: amountInCents,
      description: contributionDescription.trim() || undefined,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Sem prazo";
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter(g => g.isCompleted === "1").length || 0;
  const totalSaved = goals?.reduce((sum, g) => sum + g.currentAmount, 0) || 0;
  const totalTarget = goals?.reduce((sum, g) => sum + g.targetAmount, 0) || 0;

  const commonIcons = ["🎯", "🏠", "🚗", "✈️", "💍", "🎓", "💻", "📱", "🎮", "🏖️"];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metas de Economia</h1>
          <p className="text-muted-foreground mt-1">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>

        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar" : "Criar"} Meta de Economia</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize as informações da meta" : "Defina um novo objetivo financeiro"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Meta *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Viagem para Europa, Carro novo..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ícone</Label>
                <div className="flex gap-2 flex-wrap">
                  {commonIcons.map((emoji) => (
                    <Button
                      key={emoji}
                      type="button"
                      variant={icon === emoji ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIcon(emoji)}
                      className="text-xl"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Valor Alvo (R$) *</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Adicione detalhes sobre esta meta..."
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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingId ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total de Metas</div>
                <div className="text-2xl font-bold">{totalGoals}</div>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Metas Concluídas</div>
                <div className="text-2xl font-bold text-accent">{completedGoals}</div>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Total Economizado</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(totalSaved)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    de {formatCurrency(totalTarget)}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Metas */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : !goals || goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma meta cadastrada ainda.</p>
            <p className="text-sm mt-2">Crie sua primeira meta de economia!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const isCompleted = goal.isCompleted === "1";
            
            return (
              <Card key={goal.id} className={isCompleted ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{goal.name}</CardTitle>
                        {goal.description && (
                          <CardDescription className="mt-1">{goal.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id, goal.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-muted-foreground mt-1 text-right">
                      {progress.toFixed(1)}% concluído
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(goal.deadline)}
                    </div>
                    {isCompleted ? (
                      <Badge variant="default" className="bg-accent">
                        ✓ Concluída
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAddContribution(goal.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Contribuir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Contribuição */}
      <Dialog open={contributionOpen} onOpenChange={(o) => { setContributionOpen(o); if (!o) resetContributionForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Contribuição</DialogTitle>
            <DialogDescription>
              Registre um valor que você economizou para esta meta
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contributionAmount">Valor (R$) *</Label>
              <Input
                id="contributionAmount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contributionDescription">Descrição</Label>
              <Textarea
                id="contributionDescription"
                placeholder="De onde veio este valor..."
                value={contributionDescription}
                onChange={(e) => setContributionDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetContributionForm}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitContribution} 
              disabled={addContributionMutation.isPending}
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
