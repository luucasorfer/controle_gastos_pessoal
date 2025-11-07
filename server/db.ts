import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  categories, 
  InsertCategory,
  paymentTypes,
  InsertPaymentType,
  fixedExpenses,
  InsertFixedExpense,
  variableExpenses,
  InsertVariableExpense,
  incomes,
  InsertIncome,
  emergencyReserve,
  InsertEmergencyReserve
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== CATEGORIES ==========

export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

export async function deleteCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// ========== PAYMENT TYPES ==========

export async function getUserPaymentTypes(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentTypes).where(eq(paymentTypes.userId, userId));
}

export async function createPaymentType(paymentType: InsertPaymentType) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(paymentTypes).values(paymentType);
  return result;
}

// ========== FIXED EXPENSES ==========

export async function getUserFixedExpenses(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fixedExpenses).where(eq(fixedExpenses.userId, userId)).orderBy(fixedExpenses.dueDay);
}

export async function createFixedExpense(expense: InsertFixedExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fixedExpenses).values(expense);
  return result;
}

export async function updateFixedExpense(id: number, userId: number, updates: Partial<InsertFixedExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(fixedExpenses).set(updates).where(and(eq(fixedExpenses.id, id), eq(fixedExpenses.userId, userId)));
}

export async function deleteFixedExpense(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(fixedExpenses).where(and(eq(fixedExpenses.id, id), eq(fixedExpenses.userId, userId)));
}

// ========== VARIABLE EXPENSES ==========

export async function getUserVariableExpenses(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(variableExpenses).where(eq(variableExpenses.userId, userId));
  
  if (startDate && endDate) {
    return db.select().from(variableExpenses)
      .where(and(
        eq(variableExpenses.userId, userId),
        gte(variableExpenses.date, startDate),
        lte(variableExpenses.date, endDate)
      ))
      .orderBy(desc(variableExpenses.date));
  }
  
  return query.orderBy(desc(variableExpenses.date));
}

export async function createVariableExpense(expense: InsertVariableExpense) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(variableExpenses).values(expense);
  return result;
}

export async function updateVariableExpense(id: number, userId: number, updates: Partial<InsertVariableExpense>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(variableExpenses).set(updates).where(and(eq(variableExpenses.id, id), eq(variableExpenses.userId, userId)));
}

export async function deleteVariableExpense(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(variableExpenses).where(and(eq(variableExpenses.id, id), eq(variableExpenses.userId, userId)));
}

// ========== INCOMES ==========

export async function getUserIncomes(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  if (startDate && endDate) {
    return db.select().from(incomes)
      .where(and(
        eq(incomes.userId, userId),
        gte(incomes.date, startDate),
        lte(incomes.date, endDate)
      ))
      .orderBy(desc(incomes.date));
  }
  
  return db.select().from(incomes).where(eq(incomes.userId, userId)).orderBy(desc(incomes.date));
}

export async function createIncome(income: InsertIncome) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(incomes).values(income);
  return result;
}

export async function updateIncome(id: number, userId: number, updates: Partial<InsertIncome>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(incomes).set(updates).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
}

export async function deleteIncome(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(incomes).where(and(eq(incomes.id, id), eq(incomes.userId, userId)));
}

// ========== EMERGENCY RESERVE ==========

export async function getUserEmergencyReserve(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emergencyReserve).where(eq(emergencyReserve.userId, userId)).orderBy(desc(emergencyReserve.date));
}

export async function getEmergencyReserveBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ total: sql<number>`SUM(${emergencyReserve.amount})` })
    .from(emergencyReserve)
    .where(eq(emergencyReserve.userId, userId));
  
  return result[0]?.total || 0;
}

export async function createEmergencyReserveTransaction(transaction: InsertEmergencyReserve) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emergencyReserve).values(transaction);
  return result;
}

export async function deleteEmergencyReserveTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(emergencyReserve).where(and(eq(emergencyReserve.id, id), eq(emergencyReserve.userId, userId)));
}

// ===== Metas de Economia =====

export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { savingsGoals } = await import("../drizzle/schema");
  return db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId));
}

export async function getGoalById(goalId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { savingsGoals } = await import("../drizzle/schema");
  const result = await db.select().from(savingsGoals).where(eq(savingsGoals.id, goalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGoal(goal: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { savingsGoals } = await import("../drizzle/schema");
  const result = await db.insert(savingsGoals).values(goal);
  return result;
}

export async function updateGoal(id: number, userId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { savingsGoals } = await import("../drizzle/schema");
  await db.update(savingsGoals)
    .set(updates)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)));
}

export async function deleteGoal(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { savingsGoals } = await import("../drizzle/schema");
  await db.delete(savingsGoals).where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)));
}

export async function getGoalContributions(goalId: number) {
  const db = await getDb();
  if (!db) return [];
  const { goalContributions } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  return db.select().from(goalContributions).where(eq(goalContributions.goalId, goalId)).orderBy(desc(goalContributions.date));
}

export async function addGoalContribution(contribution: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { goalContributions, savingsGoals } = await import("../drizzle/schema");
  
  // Adicionar contribuição
  await db.insert(goalContributions).values(contribution);
  
  // Atualizar currentAmount da meta
  const goal = await getGoalById(contribution.goalId);
  if (goal) {
    const newAmount = goal.currentAmount + contribution.amount;
    const isCompleted = newAmount >= goal.targetAmount ? "1" : "0";
    await db.update(savingsGoals)
      .set({ 
        currentAmount: newAmount,
        isCompleted: isCompleted as any
      })
      .where(eq(savingsGoals.id, contribution.goalId));
  }
}

export async function deleteGoalContribution(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { goalContributions, savingsGoals } = await import("../drizzle/schema");
  
  // Buscar a contribuição antes de deletar
  const contrib = await db.select().from(goalContributions).where(eq(goalContributions.id, id)).limit(1);
  if (contrib.length === 0) return;
  
  const contribution = contrib[0];
  
  // Deletar contribuição
  await db.delete(goalContributions).where(and(eq(goalContributions.id, id), eq(goalContributions.userId, userId)));
  
  // Atualizar currentAmount da meta
  const goal = await getGoalById(contribution.goalId);
  if (goal) {
    const newAmount = Math.max(0, goal.currentAmount - contribution.amount);
    const isCompleted = newAmount >= goal.targetAmount ? "1" : "0";
    await db.update(savingsGoals)
      .set({ 
        currentAmount: newAmount,
        isCompleted: isCompleted as any
      })
      .where(eq(savingsGoals.id, contribution.goalId));
  }
}
