# Dashboard de Gerenciamento

## Visão Geral

Foi adicionada uma dashboard completa para gerenciamento de todos os modelos do banco de dados. A dashboard permite visualizar, criar, editar e excluir registros de forma intuitiva.

## Funcionalidades

### 1. **Ordens de Serviço**
- ✅ Listagem completa de todas as OS
- ✅ Busca por número, cliente ou evento
- ✅ Edição de OS existentes
- ✅ Visualização do status (Ativa/Inativa)
- ✅ Link direto para PDF da OS
- ℹ️ Novas OS devem ser criadas via upload de PDF (não pela dashboard)

### 2. **Técnicos**
- ✅ Listagem completa de técnicos
- ✅ Cadastro de novos técnicos
- ✅ Edição de técnicos existentes
- ✅ Exclusão de técnicos
- ✅ Busca por nome, email ou especialidade
- ✅ Controle de status (Ativo/Inativo)

### 3. **Atendimentos**
- ✅ Listagem de todos os atendimentos
- ✅ Cadastro de novos atendimentos
- ✅ Edição de atendimentos existentes
- ✅ Exclusão de atendimentos
- ✅ Filtro por status (Pendente, Em Andamento, Concluído, Cancelado)
- ✅ Vinculação com OS e Técnicos

### 4. **Usuários**
- ✅ Listagem de usuários do sistema
- ✅ Cadastro de novos usuários
- ✅ Edição de usuários existentes
- ✅ Exclusão de usuários
- ✅ Busca por nome ou email
- ✅ Gerenciamento de PIN
- ✅ Controle de status (Ativo/Inativo)

## Como Acessar

1. Na tela principal do calendário, clique no botão **"⚙️ Dashboard"** no canto superior direito
2. Navegue entre os diferentes módulos usando o menu lateral
3. Para voltar ao calendário, clique em **"← Voltar"**

## Estrutura de Arquivos

```
src/
├── components/
│   ├── Dashboard.tsx              # Componente principal da dashboard
│   ├── Dashboard.css              # Estilos da dashboard
│   ├── OrdemServicoList.tsx       # Listagem de OS
│   ├── OrdemServicoForm.tsx       # Formulário de OS
│   ├── TecnicoList.tsx            # Listagem de técnicos
│   ├── TecnicoForm.tsx            # Formulário de técnicos
│   ├── AtendimentoList.tsx        # Listagem de atendimentos
│   ├── AtendimentoForm.tsx        # Formulário de atendimentos
│   ├── UsuarioList.tsx            # Listagem de usuários
│   ├── UsuarioForm.tsx            # Formulário de usuários
│   └── Form.css                   # Estilos dos formulários
└── services/
    └── api.ts                     # APIs atualizadas com novos endpoints
```

## APIs Necessárias no Backend

Para que a dashboard funcione completamente, os seguintes endpoints precisam estar implementados no backend:

### Técnicos
- `POST /api/tecnicos` - Criar técnico
- `PUT /api/tecnicos/:id` - Atualizar técnico
- `DELETE /api/tecnicos/:id` - Excluir técnico

### Usuários
- `GET /auth/usuarios/full` - Listar usuários completos (com todos os campos)
- `POST /auth/usuarios` - Criar usuário
- `PUT /auth/usuarios/:id` - Atualizar usuário
- `DELETE /auth/usuarios/:id` - Excluir usuário

## Design

A dashboard segue um design moderno e responsivo:
- **Menu lateral** com navegação intuitiva
- **Tabelas** com hover effects e ações rápidas
- **Formulários** com validação
- **Badges coloridos** para status
- **Estados vazios** informativos
- **Tratamento de erros** com mensagens claras

## Notas Técnicas

1. Todos os formulários incluem validação de campos obrigatórios
2. As listagens incluem estados de loading, erro e vazio
3. A busca/filtro funciona em tempo real
4. Os selects de relacionamento (OS e Técnicos) filtram apenas registros ativos
5. O PIN do usuário é validado com 4-6 dígitos numéricos
6. Ao editar usuário, o PIN pode ser deixado em branco para não alterar

## Próximos Passos

- [ ] Implementar os endpoints faltantes no backend
- [ ] Adicionar paginação nas listagens
- [ ] Adicionar exportação de dados (CSV/Excel)
- [ ] Adicionar gráficos e estatísticas
- [ ] Implementar busca avançada com múltiplos filtros
- [ ] Adicionar confirmação visual após ações (toasts)
