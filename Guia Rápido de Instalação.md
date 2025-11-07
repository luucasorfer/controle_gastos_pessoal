# 🚀 Guia Rápido de Instalação

## Versão Sem Autenticação - Uso Local

Este guia apresenta os passos essenciais para colocar a aplicação em funcionamento rapidamente.

---

## ⚡ Instalação Rápida (5 minutos)

### 1️⃣ Pré-requisitos

Certifique-se de ter instalado:
- Node.js 18+ ([baixar](https://nodejs.org/))
- MySQL ou MariaDB ([baixar](https://dev.mysql.com/downloads/mysql/))
- pnpm: `npm install -g pnpm`

### 2️⃣ Banco de Dados

Abra o MySQL e execute:

```sql
CREATE DATABASE controle_gastos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'controle_user'@'localhost' IDENTIFIED BY 'minhasenha123';
GRANT ALL PRIVILEGES ON controle_gastos.* TO 'controle_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3️⃣ Configuração

```bash
# 1. Instalar dependências
pnpm install

# 2. Criar arquivo .env
cp .env.example .env

# 3. Editar .env com suas configurações
# Altere DATABASE_URL e JWT_SECRET
```

**Arquivo `.env` mínimo:**
```env
DATABASE_URL=mysql://controle_user:minhasenha123@localhost:3306/controle_gastos
JWT_SECRET=sua_chave_secreta_de_pelo_menos_32_caracteres_aqui
VITE_APP_TITLE=Controle de Gastos
```

**💡 Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ Inicialização

```bash
# 1. Criar tabelas no banco
pnpm db:push

# 2. Criar usuário local padrão
pnpm init:local

# 3. (Opcional) Popular categorias padrão
node seed-categories.mjs
```

### 5️⃣ Executar

```bash
pnpm dev
```

Acesse: **http://localhost:3000** 🎉

---

## 🔧 Comandos Úteis

```bash
pnpm dev          # Modo desenvolvimento
pnpm build        # Compilar para produção
pnpm start        # Executar produção
pnpm check        # Verificar tipos
pnpm db:push      # Atualizar banco de dados
pnpm init:local   # Recriar usuário local
```

---

## ❓ Problemas Comuns

### MySQL não conecta
```bash
# Verificar se está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u controle_user -p
```

### Porta 3000 ocupada
O servidor tentará usar outra porta automaticamente, ou defina no `.env`:
```env
PORT=3001
```

### Tabelas não criadas
```bash
pnpm db:push
```

### Erro "User not found"
```bash
pnpm init:local
```

---

## 📋 Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] MySQL instalado e rodando
- [ ] Banco de dados `controle_gastos` criado
- [ ] Usuário MySQL criado com permissões
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Arquivo `.env` configurado
- [ ] Migrações aplicadas (`pnpm db:push`)
- [ ] Usuário local criado (`pnpm init:local`)
- [ ] Servidor iniciado (`pnpm dev`)
- [ ] Aplicação acessível em http://localhost:3000

---

## 🎯 Próximos Passos

Após a instalação:

1. **Crie suas categorias** personalizadas
2. **Adicione gastos fixos** (aluguel, contas, etc.)
3. **Registre suas receitas** mensais
4. **Configure metas de economia**
5. **Acompanhe seu progresso** no dashboard

---

## 📚 Documentação Completa

Para mais detalhes, consulte o [README.md](README.md) completo.

---

**Desenvolvido com ❤️ para facilitar o controle das suas finanças!**
