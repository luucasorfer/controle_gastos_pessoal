import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de metas de economia
 */
export const savingsGoals = mysqlTable("savings_goals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: int("targetAmount").notNull(), // em centavos
  currentAmount: int("currentAmount").default(0).notNull(), // em centavos
  deadline: timestamp("deadline"),
  icon: varchar("icon", { length: 10 }).default("🎯"),
  isCompleted: mysqlEnum("isCompleted", ["0", "1"]).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = typeof savingsGoals.$inferInsert;

/**
 * Tabela de contribuições para metas
 */
export const goalContributions = mysqlTable("goal_contributions", {
  id: int("id").autoincrement().primaryKey(),
  goalId: int("goalId").notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // em centavos
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GoalContribution = typeof goalContributions.$inferSelect;
export type InsertGoalContribution = typeof goalContributions.$inferInsert;

/**
 * Tabela de categorias de gastos (Moradia, Investimentos, etc.)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 10 }).notNull(), // emoji icon
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Tipos de pagamento (Crédito, Débito, Pix, Dinheiro)
 */
export const paymentTypes = mysqlTable("payment_types", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentType = typeof paymentTypes.$inferSelect;
export type InsertPaymentType = typeof paymentTypes.$inferInsert;

/**
 * Gastos fixos mensais (aluguel, condomínio, etc.)
 */
export const fixedExpenses = mysqlTable("fixed_expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: int("categoryId").notNull(),
  amount: int("amount").notNull(), // valor em centavos
  dueDay: int("dueDay").notNull(), // dia do vencimento (1-31)
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FixedExpense = typeof fixedExpenses.$inferSelect;
export type InsertFixedExpense = typeof fixedExpenses.$inferInsert;

/**
 * Gastos variáveis (compras, parcelamentos, etc.)
 */
export const variableExpenses = mysqlTable("variable_expenses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  categoryId: int("categoryId").notNull(),
  amount: int("amount").notNull(), // valor em centavos
  paymentTypeId: int("paymentTypeId"),
  date: timestamp("date").notNull(),
  installments: int("installments").default(1).notNull(), // número de parcelas
  currentInstallment: int("currentInstallment").default(1).notNull(), // parcela atual
  isPaid: boolean("isPaid").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VariableExpense = typeof variableExpenses.$inferSelect;
export type InsertVariableExpense = typeof variableExpenses.$inferInsert;

/**
 * Entradas/Receitas (salário, outros)
 */
export const incomes = mysqlTable("incomes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  amount: int("amount").notNull(), // valor em centavos
  date: timestamp("date").notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = typeof incomes.$inferInsert;

/**
 * Reserva de emergência (histórico de movimentações)
 */
export const emergencyReserve = mysqlTable("emergency_reserve", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // valor em centavos (positivo = depósito, negativo = retirada)
  date: timestamp("date").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmergencyReserve = typeof emergencyReserve.$inferSelect;
export type InsertEmergencyReserve = typeof emergencyReserve.$inferInsert;

/**
 * Meses fiscais para organização de gastos
 */
export const fiscalMonths = mysqlTable("fiscal_months", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FiscalMonth = typeof fiscalMonths.$inferSelect;
export type InsertFiscalMonth = typeof fiscalMonths.$inferInsert;
