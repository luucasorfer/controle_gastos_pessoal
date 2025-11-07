import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, Tag } from "lucide-react";
import { toast } from "sonner";

const EMOJI_SUGGESTIONS = [
  "🏠",
  "🏦",
  "👚",
  "💰",
  "📚",
  "💳",
  "🕹️",
  "🎞️",
  "🍻",
  "🚑",
  "🚗",
  "🛒",
  "🍴",
  "🐈",
  "🛵",
  "🚨",
  "📌",
  "💡",
  "🎯",
  "🎨",
  "🏋️",
  "✈️",
  "🎭",
  "📱",
  "💻",
  "🎓",
  "🏥",
  "🚕",
  "🍕",
  "☕",
];

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery();

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Categoria criada com sucesso!");
      setOpen(false);
      setName("");
      setIcon("");
    },
    onError: error => {
      toast.error("Erro ao criar categoria: " + error.message);
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      toast.success("Categoria excluída com sucesso!");
    },
    onError: error => {
      toast.error("Erro ao excluir categoria: " + error.message);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Digite um nome para a categoria");
      return;
    }
    createMutation.mutate({ name: name.trim(), icon });
  };

  const handleDelete = (id: number, categoryName: string) => {
    if (
      confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)
    ) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Organize seus gastos em categorias personalizadas
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma categoria para organizar seus gastos
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  placeholder="Ex: Alimentação, Transporte..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreate()}
                />
              </div>

              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-3xl">{icon}</div>
                  <span className="text-sm text-muted-foreground">
                    {icon !== "" ? "Selecionado" : "Nenhum ícone selecionado"}
                  </span>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {EMOJI_SUGGESTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`text-2xl p-2 rounded hover:bg-accent transition-colors ${
                        icon === emoji ? "bg-accent" : ""
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhuma categoria cadastrada ainda.
              <br />
              Clique em "Nova Categoria" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <Card
              key={category.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      {/* Manter comentado por enquanto
                      <CardDescription className="text-xs">
                        ID: {category.id}
                      </CardDescription>
                      */}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
