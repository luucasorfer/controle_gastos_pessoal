import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
  }),

  // ========== CATEGORIES ==========
  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCategories(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        icon: z.string().max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createCategory({
          userId: ctx.user.id,
          name: input.name,
          icon: input.icon,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteCategory(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ========== PAYMENT TYPES ==========
  paymentTypes: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserPaymentTypes(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(50),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createPaymentType({
          userId: ctx.user.id,
          name: input.name,
        });
        return { success: true };
      }),
  }),

  // ========== FIXED EXPENSES ==========
  fixedExpenses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserFixedExpenses(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        categoryId: z.number(),
        amount: z.number(), // em centavos
        dueDay: z.number().min(1).max(31),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createFixedExpense({
          userId: ctx.user.id,
          name: input.name,
          categoryId: input.categoryId,
          amount: input.amount,
          dueDay: input.dueDay,
          isActive: true,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        categoryId: z.number().optional(),
        amount: z.number().optional(),
        dueDay: z.number().min(1).max(31).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateFixedExpense(id, ctx.user.id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFixedExpense(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ========== VARIABLE EXPENSES ==========
  variableExpenses: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserVariableExpenses(
          ctx.user.id,
          input?.startDate,
          input?.endDate
        );
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        categoryId: z.number(),
        amount: z.number(),
        paymentTypeId: z.number().optional(),
        date: z.date(),
        installments: z.number().default(1),
        currentInstallment: z.number().default(1),
        isPaid: z.boolean().default(false),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createVariableExpense({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        categoryId: z.number().optional(),
        amount: z.number().optional(),
        paymentTypeId: z.number().optional(),
        date: z.date().optional(),
        installments: z.number().optional(),
        currentInstallment: z.number().optional(),
        isPaid: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateVariableExpense(id, ctx.user.id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteVariableExpense(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ========== INCOMES ==========
  incomes: router({
    list: protectedProcedure
      .input(z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        return db.getUserIncomes(
          ctx.user.id,
          input?.startDate,
          input?.endDate
        );
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        amount: z.number(),
        date: z.date(),
        isRecurring: z.boolean().default(false),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createIncome({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        amount: z.number().optional(),
        date: z.date().optional(),
        isRecurring: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        await db.updateIncome(id, ctx.user.id, updates);
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteIncome(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ========== EMERGENCY RESERVE ==========
  emergencyReserve: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserEmergencyReserve(ctx.user.id);
    }),
    
    balance: protectedProcedure.query(async ({ ctx }) => {
      return db.getEmergencyReserveBalance(ctx.user.id);
    }),
    
    addTransaction: protectedProcedure
      .input(z.object({
        amount: z.number(), // positivo = depósito, negativo = retirada
        date: z.date(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createEmergencyReserveTransaction({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteEmergencyReserveTransaction(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ========== DASHBOARD SUMMARY ==========
  dashboard: router({
    summary: protectedProcedure
      .input(z.object({
        month: z.number().min(1).max(12),
        year: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const startDate = new Date(input.year, input.month - 1, 1);
        const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

        const [fixedExpenses, variableExpenses, incomes, categories, reserveBalance] = await Promise.all([
          db.getUserFixedExpenses(ctx.user.id),
          db.getUserVariableExpenses(ctx.user.id, startDate, endDate),
          db.getUserIncomes(ctx.user.id, startDate, endDate),
          db.getUserCategories(ctx.user.id),
          db.getEmergencyReserveBalance(ctx.user.id),
        ]);

        // Calcular totais
        const totalFixedExpenses = fixedExpenses
          .filter(e => e.isActive)
          .reduce((sum, e) => sum + e.amount, 0);
        
        const totalVariableExpenses = variableExpenses
          .reduce((sum, e) => sum + e.amount, 0);
        
        const totalIncomes = incomes
          .reduce((sum, i) => sum + i.amount, 0);

        const totalExpenses = totalFixedExpenses + totalVariableExpenses;
        const balance = totalIncomes - totalExpenses;
        const balanceWithReserve = balance + reserveBalance;

        // Gastos por categoria
        const expensesByCategory: Record<number, number> = {};
        
        fixedExpenses.filter(e => e.isActive).forEach(e => {
          expensesByCategory[e.categoryId] = (expensesByCategory[e.categoryId] || 0) + e.amount;
        });
        
        variableExpenses.forEach(e => {
          expensesByCategory[e.categoryId] = (expensesByCategory[e.categoryId] || 0) + e.amount;
        });

        const categoryBreakdown = Object.entries(expensesByCategory).map(([categoryId, amount]) => {
          const category = categories.find(c => c.id === parseInt(categoryId));
          return {
            categoryId: parseInt(categoryId),
            categoryName: category?.name || 'Desconhecida',
            categoryIcon: category?.icon || '📌',
            amount,
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
          };
        }).sort((a, b) => b.amount - a.amount);

        return {
          totalIncomes,
          totalFixedExpenses,
          totalVariableExpenses,
          totalExpenses,
          balance,
          reserveBalance,
          balanceWithReserve,
          categoryBreakdown,
        };
      }),
  }),

  // Alertas e Notificações
  alerts: router({
    upcomingDueDates: protectedProcedure
      .input(z.object({
        month: z.number().int().min(1).max(12),
        year: z.number().int(),
      }))
      .query(async ({ ctx, input }) => {
        const fixedExpenses = await db.getUserFixedExpenses(ctx.user.id);
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const upcomingExpenses = fixedExpenses.filter(expense => {
          if (!expense.dueDay) return false;
          
          const dueDate = new Date(input.year, input.month - 1, expense.dueDay);
          
          // Verifica se está dentro do período de alerta
          return dueDate >= today && dueDate <= threeDaysFromNow;
        }).map(expense => ({
          ...expense,
          dueDate: new Date(input.year, input.month - 1, expense.dueDay),
        }));

        return upcomingExpenses;
      }),
  }),

  // Metas de Economia
  savingsGoals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserGoals(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        targetAmount: z.number().int().positive(),
        deadline: z.date().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createGoal({
          ...input,
          userId: ctx.user.id,
          currentAmount: 0,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number().int(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        targetAmount: z.number().int().positive().optional(),
        deadline: z.date().optional(),
        icon: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...updates } = input;
        return db.updateGoal(id, ctx.user.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteGoal(input.id, ctx.user.id);
      }),

    getContributions: protectedProcedure
      .input(z.object({ goalId: z.number().int() }))
      .query(async ({ input }) => {
        return db.getGoalContributions(input.goalId);
      }),

    addContribution: protectedProcedure
      .input(z.object({
        goalId: z.number().int(),
        amount: z.number().int().positive(),
        description: z.string().optional(),
        date: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.addGoalContribution({
          ...input,
          userId: ctx.user.id,
          date: input.date || new Date(),
        });
      }),

    deleteContribution: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteGoalContribution(input.id, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
