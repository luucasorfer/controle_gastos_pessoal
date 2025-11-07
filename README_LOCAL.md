# Controle de Gastos - Instalação Local

Guia completo para executar o projeto **Controle de Gastos** localmente na sua máquina.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior ([Download](https://nodejs.org/))
- **pnpm** (gerenciador de pacotes) - Instale com: `npm install -g pnpm`
- **MySQL** ou **MariaDB** ([Download MySQL](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com/downloads))

---

## 🚀 Passo a Passo para Instalação

### 1. Baixar os Arquivos do Projeto

Você pode baixar o projeto de duas formas:

**Opção A: Pela Interface do Manus**
- Clique no botão "Code" no painel de gerenciamento
- Clique em "Download All Files" para baixar um arquivo ZIP
- Extraia o ZIP em uma pasta de sua escolha

**Opção B: Via Git (se disponível)**
```bash
git clone [URL_DO_REPOSITORIO]
cd controle_gastos_pessoal
```

### 2. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
pnpm install
```

### 3. Configurar Banco de Dados

#### 3.1 Criar o Banco de Dados

Acesse o MySQL e crie um banco de dados:

```sql
CREATE DATABASE controle_gastos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 3.2 Criar Usuário (opcional, mas recomendado)

```sql
CREATE USER 'controle_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON controle_gastos.* TO 'controle_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Database Configuration
DATABASE_URL=mysql://controle_user:sua_senha_segura@localhost:3306/controle_gastos

# JWT Secret (gere uma string aleatória de pelo menos 32 caracteres)
JWT_SECRET=minha_chave_super_secreta_de_pelo_menos_32_caracteres_aqui

# App Configuration
VITE_APP_TITLE=Controle de Gastos
VITE_APP_LOGO=https://placehold.co/128x128/10b981/ffffff?text=CG

# OAuth Configuration (OPCIONAL - apenas se quiser usar autenticação Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=
OWNER_OPEN_ID=
OWNER_NAME=Seu Nome
```

**⚠️ IMPORTANTE:** 
- Substitua `sua_senha_segura` pela senha que você definiu no MySQL
- Gere uma string aleatória segura para `JWT_SECRET`
- Se não usar autenticação Manus, você pode deixar os campos OAuth vazios

### 5. Aplicar Migrações do Banco de Dados

Execute o comando para criar as tabelas no banco:

```bash
pnpm db:push
```

Este comando irá criar todas as tabelas necessárias (users, categories, fixedExpenses, variableExpenses, incomes, emergencyReserve, savingsGoals, etc.)

### 6. (Opcional) Popular Categorias Padrão

Se quiser começar com categorias pré-definidas, execute:

```bash
node seed-categories.mjs
```

### 7. Iniciar o Servidor de Desenvolvimento

Execute o comando:

```bash
pnpm dev
```

O servidor iniciará em: **http://localhost:3000**

**⚠️ Nota para usuários Windows:** O projeto já está configurado com `cross-env` para compatibilidade total com Windows. Se você baixou uma versão antiga, certifique-se de que o `package.json` usa `cross-env` nos scripts.

---

## 🎯 Usando a Aplicação

### Sem Autenticação OAuth

Se você não configurou o OAuth do Manus, a aplicação funcionará em modo local. Você pode:

1. Acessar diretamente as páginas
2. Criar categorias personalizadas
3. Adicionar gastos fixos e variáveis
4. Registrar receitas
5. Gerenciar reserva de emergência
6. Criar metas de economia

### Com Autenticação OAuth (Opcional)

Se configurou o OAuth:

1. Acesse http://localhost:3000
2. Clique em "Entrar"
3. Faça login com sua conta Manus
4. Todos os dados ficarão vinculados ao seu usuário

---

## 📦 Scripts Disponíveis

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Compilar para produção
pnpm build

# Visualizar build de produção
pnpm preview

# Aplicar mudanças no schema do banco
pnpm db:push

# Gerar migrações
pnpm db:generate

# Verificar tipos TypeScript
pnpm typecheck

# Limpar cache e reinstalar
pnpm clean && pnpm install
```

---

## 🗂️ Estrutura do Projeto

```
controle_gastos_pessoal/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Configurações (tRPC, etc)
│   │   └── hooks/         # Custom hooks
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Rotas da API
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Configurações do servidor
├── drizzle/               # Schema e migrações do banco
│   └── schema.ts          # Definição das tabelas
├── shared/                # Código compartilhado
└── package.json           # Dependências do projeto
```

---

## 🔧 Solução de Problemas

### Erro de Conexão com o Banco de Dados

**Problema:** `Error: connect ECONNREFUSED`

**Solução:**
1. Verifique se o MySQL está rodando: `sudo systemctl status mysql` (Linux) ou verifique nos serviços do Windows
2. Confirme que a `DATABASE_URL` no `.env` está correta
3. Teste a conexão manualmente com: `mysql -u controle_user -p`

### Erro "Table doesn't exist"

**Problema:** Tabelas não foram criadas

**Solução:**
```bash
pnpm db:push
```

### Porta 3000 já em uso

**Problema:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solução:**
- Altere a porta no arquivo `server/_core/index.ts` ou
- Mate o processo usando a porta: `lsof -ti:3000 | xargs kill` (Mac/Linux) ou `netstat -ano | findstr :3000` (Windows)

### Erro de Permissão no MySQL

**Problema:** `Access denied for user`

**Solução:**
```sql
GRANT ALL PRIVILEGES ON controle_gastos.* TO 'controle_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🌐 Build para Produção

Para gerar uma versão otimizada para produção:

```bash
# 1. Compilar o projeto
pnpm build

# 2. Testar o build localmente
pnpm preview

# 3. Para deploy em servidor
# Os arquivos compilados estarão em:
# - client/dist/ (frontend)
# - server/ (backend já está pronto)
```

---

## 📝 Funcionalidades Disponíveis

✅ **Dashboard Financeiro**
- Resumo mensal de receitas, despesas e saldo
- Filtros por mês e ano
- Alertas de vencimento (3 dias antes)
- Visualização de metas em destaque
- Gráficos de gastos por categoria

✅ **Gestão de Categorias**
- Criar categorias personalizadas com ícones
- Organizar gastos por tipo

✅ **Gastos Fixos**
- Despesas recorrentes mensais
- Controle de vencimento
- Status de pagamento

✅ **Gastos Variáveis**
- Compras parceladas
- Múltiplos cartões de crédito
- Controle de prestações

✅ **Receitas**
- Múltiplas fontes de renda
- Salário e outras entradas

✅ **Reserva de Emergência**
- Histórico de movimentações
- Depósitos e retiradas

✅ **Metas de Economia**
- Objetivos financeiros com prazos
- Sistema de contribuições
- Acompanhamento visual de progresso

✅ **Interface Premium**
- Modo escuro/claro
- Design responsivo
- Tema verde esmeralda elegante

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs no terminal onde executou `pnpm dev`
2. Confirme que todas as dependências foram instaladas
3. Verifique se o banco de dados está acessível
4. Consulte a documentação do tRPC: https://trpc.io
5. Consulte a documentação do Drizzle ORM: https://orm.drizzle.team

---

## 📄 Licença

Este projeto foi desenvolvido como uma aplicação de controle financeiro pessoal.

---

**Desenvolvido com ❤️ usando React, TypeScript, tRPC, Drizzle ORM e Tailwind CSS**
