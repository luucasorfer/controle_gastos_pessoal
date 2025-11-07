import { drizzle } from "drizzle-orm/mysql2";
import { categories } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const defaultCategories = [
  { name: "Moradia", icon: "🏠", userId: 1 },
  { name: "Investimentos", icon: "🏡", userId: 1 },
  { name: "Roupa", icon: "👚", userId: 1 },
  { name: "Empréstimos", icon: "💰", userId: 1 },
  { name: "Estudos", icon: "📚", userId: 1 },
  { name: "Cartões de Crédito", icon: "💳", userId: 1 },
  { name: "Lazer", icon: "🕹️", userId: 1 },
  { name: "Streaming", icon: "🎞️", userId: 1 },
  { name: "Disk/Adega", icon: "🍻", userId: 1 },
  { name: "Saúde", icon: "🚑", userId: 1 },
  { name: "Veículos", icon: "🚗", userId: 1 },
  { name: "Supermercado", icon: "🛒", userId: 1 },
  { name: "Alimentação", icon: "🍴", userId: 1 },
  { name: "Petshop", icon: "🐈", userId: 1 },
  { name: "Delivery", icon: "🛵", userId: 1 },
  { name: "Dívidas com juros altos", icon: "🚨", userId: 1 },
  { name: "Outras despesas", icon: "📌", userId: 1 },
];

async function seed() {
  console.log("Populando categorias padrão...");
  
  for (const cat of defaultCategories) {
    await db.insert(categories).values(cat).onDuplicateKeyUpdate({ set: { name: cat.name } });
  }
  
  console.log("Categorias criadas com sucesso!");
  process.exit(0);
}

seed().catch(console.error);
