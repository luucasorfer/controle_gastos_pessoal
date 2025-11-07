# Controle de Gastos Pessoal

Sistema completo de gerenciamento financeiro pessoal desenvolvido com React, TypeScript, tRPC e MySQL.

## 🎯 Funcionalidades

- **Dashboard Financeiro**: Resumo mensal de receitas, despesas e saldo
- **Categorias Personalizadas**: Organize seus gastos por categoria com ícones
- **Gastos Fixos**: Controle de despesas recorrentes mensais
- **Gastos Variáveis**: Gerenciamento de compras parceladas e únicas
- **Receitas**: Registro de múltiplas fontes de renda
- **Reserva de Emergência**: Histórico completo de movimentações
- **Metas de Economia**: Defina objetivos financeiros e acompanhe o progresso
- **Gráficos e Relatórios**: Visualizações detalhadas dos seus gastos
- **Tema Claro/Escuro**: Interface moderna e responsiva

## 📋 Pré-requisitos

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **pnpm** - Instale com: `npm install -g pnpm`
- **MySQL** ou **MariaDB** ([Download](https://dev.mysql.com/downloads/mysql/))

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/luucasorfer/controle_gastos_pessoal.git
cd controle_gastos_pessoal
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure o Banco de Dados

Acesse o MySQL e crie o banco de dados:

```sql
CREATE DATABASE controle_gastos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Opcionalmente, crie um usuário específico:

```sql
CREATE USER 'controle_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON controle_gastos.* TO 'controle_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configure as Variáveis de Ambiente

Copie o arquivo de exemplo e edite com suas configurações:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
DATABASE_URL=mysql://controle_user:sua_senha_segura@localhost:3306/controle_gastos
JWT_SECRET=sua_chave_secreta_de_pelo_menos_32_caracteres
VITE_APP_TITLE=Controle de Gastos
```

**💡 Dica**: Gere uma chave secreta segura com:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Aplique as Migrações do Banco

```bash
pnpm db:push
```

### 6. Inicialize o Usuário Local

```bash
node init-local-user.mjs
```

### 7. (Opcional) Popule Categorias Padrão

```bash
node seed-categories.mjs
```

### 8. Inicie o Servidor

```bash
pnpm dev
```

Acesse: **http://localhost:3000**

## 📦 Scripts Disponíveis

```bash
pnpm dev          # Iniciar servidor de desenvolvimento
pnpm build        # Compilar para produção
pnpm start        # Executar build de produção
pnpm check        # Verificar tipos TypeScript
pnpm db:push      # Aplicar migrações do banco
```

## 🗂️ Estrutura do Projeto

```
controle_gastos_pessoal/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Configurações (tRPC, utils)
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Rotas da API
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Configurações do servidor
├── drizzle/               # Schema e migrações
│   └── schema.ts          # Definição das tabelas
└── shared/                # Código compartilhado
```

## 🔧 Solução de Problemas

### Erro de Conexão com o Banco

Verifique se o MySQL está rodando e se a `DATABASE_URL` no `.env` está correta.

```bash
# Linux/Mac
sudo systemctl status mysql

# Testar conexão
mysql -u controle_user -p
```

### Tabelas não Criadas

Execute novamente:

```bash
pnpm db:push
```

### Porta 3000 em Uso

O servidor tentará automaticamente usar outra porta disponível, ou você pode definir uma porta específica no `.env`:

```env
PORT=3001
```

## 🌐 Build para Produção

```bash
# Compilar o projeto
pnpm build

# Testar o build
pnpm preview

# Executar em produção
pnpm start
```

## 💡 Uso Local Simplificado

Esta versão foi **otimizada para uso local** e não requer autenticação OAuth. Todos os dados são armazenados localmente no seu banco de dados MySQL e vinculados a um usuário padrão.

**Características:**
- ✅ Sem necessidade de login
- ✅ Acesso direto às funcionalidades
- ✅ Dados armazenados localmente
- ✅ Totalmente funcional offline (exceto instalação inicial)

## 🛠️ Stack Tecnológica

- **Frontend**: React 19, TypeScript, TailwindCSS, Radix UI
- **Backend**: Node.js, Express, tRPC
- **Banco de Dados**: MySQL/MariaDB com Drizzle ORM
- **Gráficos**: Recharts
- **Build**: Vite

## 📄 Licença

MIT License - Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para ajudar você a ter controle total das suas finanças!**
