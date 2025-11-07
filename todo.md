# Controle de Gastos Pessoais - TODO

## Funcionalidades Principais

### Estrutura de Dados
- [x] Criar tabela de categorias (Moradia, Investimentos, Roupa, Empréstimos, Estudos, Cartões, Lazer, Streaming, Disk/Adega, Saúde, Veículos, Supermercado, Alimentação, Petshop, Delivery, Dívidas, Outras)
- [x] Criar tabela de tipos de pagamento (Crédito, Débito, Pix, Dinheiro)
- [x] Criar tabela de gastos fixos (com nome, categoria, valor, data de vencimento)
- [x] Criar tabela de gastos variáveis (com nome, categoria, valor, parcelas, data, status de pagamento)
- [x] Criar tabela de entradas/receitas (salário, outros)
- [x] Criar tabela de reserva de emergência (histórico de movimentações)

### Backend (tRPC Procedures)
- [x] Implementar CRUD de categorias
- [x] Implementar CRUD de gastos fixos
- [x] Implementar CRUD de gastos variáveis
- [x] Implementar CRUD de entradas/receitas
- [x] Implementar gestão de reserva de emergência
- [x] Implementar cálculo automático de saldo (entradas - saídas)
- [x] Implementar cálculo de gastos por categoria
- [x] Implementar filtros por mês/ano
- [x] Implementar relatórios de análise financeira

### Interface do Usuário
- [x] Dashboard principal com resumo financeiro
- [x] Visualização de saldo atual e saldo com reservas
- [x] Formulário para adicionar/editar gastos fixos
- [x] Formulário para adicionar/editar gastos variáveis
- [x] Formulário para adicionar/editar entradas
- [x] Gestão de reserva de emergência
- [x] Tabela de gastos fixos com ações (editar, excluir, marcar como pago)
- [x] Tabela de gastos variáveis com ações (editar, excluir, marcar como pago)
- [x] Filtro por mês/ano
- [x] Design premium com cores e tipografia elegantes

### Visualizações e Relatórios
- [x] Gráfico de pizza mostrando gastos por categoria
- [x] Gráfico de barras comparando gastos mensais
- [x] Indicadores visuais de porcentagem por categoria
- [x] Resumo de gastos fixos vs variáveis
- [x] Histórico de movimentações da reserva de emergência
- [ ] Exportação de relatórios (opcional)

### Funcionalidades Extras
- [x] Suporte a múltiplos cartões de crédito
- [x] Controle de parcelas e prestações
- [x] Sistema de alertas de vencimento para gastos próximos do prazo
- [x] Exibir alertas no dashboard
- [x] Notificações visuais para vencimentos próximos (3 dias)
- [x] Implementar alternador de tema escuro/claro
- [x] Botão de troca de tema no header
- [x] Persistência da preferência de tema

### Metas de Economia
- [x] Criar tabela de metas no banco de dados
- [x] Criar tabela de contribuições para metas
- [x] Implementar CRUD de metas (criar, editar, excluir, listar)
- [x] Implementar sistema de contribuições para metas
- [x] Criar página de gerenciamento de metas
- [x] Adicionar visualização de progresso (barra de progresso)
- [x] Mostrar metas no dashboard principal com progresso visual
- [x] Adicionar navegação para metas no menu lateral

### Ajustes Finais
- [x] Alterar título da aplicação para "Controle de Gastos"
- [x] Ajustar título no menu para quebrar linha ao invés de truncar

### Revisão e Testes Completos
- [x] Revisar layout do Dashboard
- [x] Revisar layout de Categorias
- [x] Revisar layout de Gastos Fixos
- [x] Revisar layout de Gastos Variáveis
- [x] Revisar layout de Receitas
- [x] Revisar layout de Reserva de Emergência
- [x] Revisar layout de Metas de Economia
- [x] Testar responsividade mobile/desktop
- [x] Testar funcionalidades CRUD em todas as páginas
- [x] Testar filtros e cálculos
- [x] Aplicar ajustes de layout identificados
- [x] Validar tema escuro/claro em todas as telas

### Correções de Bugs
- [x] Corrigir duplicação de valor "R$ 0,00" na página de Metas de Economia

### Compatibilidade Windows
- [x] Corrigir scripts do package.json para funcionar no Windows
- [x] Instalar cross-env para variáveis de ambiente multiplataforma
