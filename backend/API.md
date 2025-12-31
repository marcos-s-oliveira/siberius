# API REST - Endpoints Disponíveis

Base URL: `http://localhost:3000/api`

## Usuários

### Listar todos os usuários
```
GET /api/usuarios
```

### Buscar usuário por ID
```
GET /api/usuarios/:id
```

### Criar novo usuário
```
POST /api/usuarios
Body: {
  "nome": "string",
  "email": "string",
  "senha": "string",
  "ativo": boolean (opcional)
}
```

### Atualizar usuário
```
PUT /api/usuarios/:id
Body: {
  "nome": "string",
  "email": "string",
  "senha": "string",
  "ativo": boolean
}
```

### Deletar usuário
```
DELETE /api/usuarios/:id
```

---

## Técnicos

### Listar todos os técnicos
```
GET /api/tecnicos
```
Retorna técnicos com seus atendimentos relacionados.

### Buscar técnico por ID
```
GET /api/tecnicos/:id
```

### Criar novo técnico
```
POST /api/tecnicos
Body: {
  "nome": "string",
  "email": "string",
  "telefone": "string" (opcional),
  "especialidade": "string" (opcional),
  "ativo": boolean (opcional)
}
```

### Atualizar técnico
```
PUT /api/tecnicos/:id
Body: {
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "especialidade": "string",
  "ativo": boolean
}
```

### Deletar técnico
```
DELETE /api/tecnicos/:id
```

---

## Ordens de Serviço

### Listar todas as ordens de serviço
```
GET /api/ordens-servico
```
Retorna OSs com atendimentos e técnicos relacionados.

### Buscar ordem de serviço por ID
```
GET /api/ordens-servico/:id
```

### Buscar ordem de serviço por número
```
GET /api/ordens-servico/numero/:numero
```

### Criar nova ordem de serviço
```
POST /api/ordens-servico
Body: {
  "numeroOS": "string",
  "nomeCliente": "string",
  "nomeEvento": "string",
  "data": "string (ISO date)",
  "osAtualizada": boolean (opcional),
  "caminhoArquivo": "string",
  "nomeArquivo": "string"
}
```

### Atualizar ordem de serviço
```
PUT /api/ordens-servico/:id
Body: {
  "numeroOS": "string",
  "nomeCliente": "string",
  "nomeEvento": "string",
  "data": "string (ISO date)",
  "osAtualizada": boolean,
  "caminhoArquivo": "string",
  "nomeArquivo": "string"
}
```

### Deletar ordem de serviço
```
DELETE /api/ordens-servico/:id
```

---

## Atendimentos

### Listar todos os atendimentos
```
GET /api/atendimentos
```

### Buscar atendimento por ID
```
GET /api/atendimentos/:id
```

### Listar atendimentos por ordem de serviço
```
GET /api/atendimentos/ordem-servico/:ordemServicoId
```

### Listar atendimentos por técnico
```
GET /api/atendimentos/tecnico/:tecnicoId
```

### Criar novo atendimento
```
POST /api/atendimentos
Body: {
  "ordemServicoId": number,
  "tecnicoId": number,
  "status": "string" (pendente, em_andamento, concluido),
  "observacoes": "string" (opcional)
}
```

### Atualizar atendimento
```
PUT /api/atendimentos/:id
Body: {
  "ordemServicoId": number,
  "tecnicoId": number,
  "status": "string",
  "observacoes": "string"
}
```

### Deletar atendimento
```
DELETE /api/atendimentos/:id
```

---

## Health Check

### Verificar status da API
```
GET /health
```
Retorna: `{ "status": "ok", "timestamp": "...", "service": "Siberius API" }`
