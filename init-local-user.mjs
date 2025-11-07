import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const DEFAULT_LOCAL_USER = {
  openId: "local-user",
  name: "Usuário Local",
  email: "local@localhost",
  loginMethod: "local",
  role: "user",
};

async function initLocalUser() {
  console.log("🔧 Inicializando usuário local padrão...");

  try {
    // Conectar ao banco de dados
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const db = drizzle(connection);

    // Verificar se o usuário já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, DEFAULT_LOCAL_USER.openId))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("✅ Usuário local já existe no banco de dados");
      console.log(`   ID: ${existingUser[0].id}`);
      console.log(`   Nome: ${existingUser[0].name}`);
      console.log(`   Email: ${existingUser[0].email}`);
    } else {
      // Criar usuário local
      await db.insert(users).values({
        openId: DEFAULT_LOCAL_USER.openId,
        name: DEFAULT_LOCAL_USER.name,
        email: DEFAULT_LOCAL_USER.email,
        loginMethod: DEFAULT_LOCAL_USER.loginMethod,
        role: DEFAULT_LOCAL_USER.role,
      });

      console.log("✅ Usuário local criado com sucesso!");
      console.log(`   Nome: ${DEFAULT_LOCAL_USER.name}`);
      console.log(`   Email: ${DEFAULT_LOCAL_USER.email}`);
    }

    await connection.end();
    console.log("\n🎉 Inicialização concluída! Você pode executar 'pnpm dev' agora.");
  } catch (error) {
    console.error("❌ Erro ao inicializar usuário local:", error);
    process.exit(1);
  }
}

initLocalUser();
