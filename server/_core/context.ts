import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Usuário padrão para uso local sem autenticação
const DEFAULT_LOCAL_USER = {
  openId: "local-user",
  name: "Usuário Local",
  email: "local@localhost",
  loginMethod: "local",
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Buscar ou criar usuário local padrão
    user = await db.getUserByOpenId(DEFAULT_LOCAL_USER.openId);
    
    if (!user) {
      // Criar usuário local se não existir
      await db.upsertUser({
        openId: DEFAULT_LOCAL_USER.openId,
        name: DEFAULT_LOCAL_USER.name,
        email: DEFAULT_LOCAL_USER.email,
        loginMethod: DEFAULT_LOCAL_USER.loginMethod,
        lastSignedIn: new Date(),
      });
      user = await db.getUserByOpenId(DEFAULT_LOCAL_USER.openId);
    }
  } catch (error) {
    console.error("[Context] Erro ao obter usuário local:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
