export const getApiDocsHTML = (baseUrl: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siberius API - Documentação</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            line-height: 1.6;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: white;
            border-radius: 10px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .header .version {
            color: #888;
            font-size: 14px;
        }
        .base-url {
            background: #f0f0f0;
            padding: 10px 15px;
            border-radius: 5px;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        .section {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 20px;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .endpoint {
            margin-bottom: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
        }
        .endpoint-header {
            display: flex;
            align-items: center;
            padding: 12px 15px;
            background: #f9f9f9;
            cursor: pointer;
            transition: background 0.2s;
        }
        .endpoint-header:hover {
            background: #f0f0f0;
        }
        .method {
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-right: 15px;
            min-width: 60px;
            text-align: center;
        }
        .method.get { background: #61affe; color: white; }
        .method.post { background: #49cc90; color: white; }
        .method.put { background: #fca130; color: white; }
        .method.delete { background: #f93e3e; color: white; }
        .path {
            font-family: 'Courier New', monospace;
            font-weight: 500;
            flex: 1;
        }
        .description {
            color: #666;
            font-size: 14px;
        }
        .endpoint-details {
            padding: 15px;
            background: white;
            display: none;
            border-top: 1px solid #e0e0e0;
        }
        .endpoint.expanded .endpoint-details {
            display: block;
        }
        .example {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 15px;
            border-radius: 5px;
            margin-top: 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            overflow-x: auto;
        }
        .tag {
            display: inline-block;
            padding: 3px 8px;
            background: #e7f3ff;
            color: #1976d2;
            border-radius: 3px;
            font-size: 11px;
            margin-right: 5px;
            margin-top: 5px;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .feature {
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
            border-left: 3px solid #667eea;
        }
        .feature h4 {
            color: #667eea;
            margin-bottom: 8px;
        }
        .arrow {
            margin-left: auto;
            transition: transform 0.3s;
        }
        .endpoint.expanded .arrow {
            transform: rotate(180deg);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Siberius API</h1>
            <p class="version">Sistema de Indexação de PDFs e Gestão de Ordens de Serviço</p>
            <div class="base-url">
                <strong>Base URL:</strong> ${baseUrl}
            </div>
        </div>

        <div class="section">
            <h2>📋 Funcionalidades</h2>
            <div class="features">
                <div class="feature">
                    <h4>� Autenticação Híbrida</h4>
                    <p>Login completo (email/senha) ou PIN rápido para tela touch</p>
                </div>
                <div class="feature">
                    <h4>🗂️ Indexação Automática</h4>
                    <p>Varredura recursiva de PDFs com parse inteligente de nomes</p>
                </div>
                <div class="feature">
                    <h4>🔄 Versionamento</h4>
                    <p>Controle completo de versões de OS com histórico</p>
                </div>
                <div class="feature">
                    <h4>👥 Gestão de Equipes</h4>
                    <p>Alocação de múltiplos técnicos com verificação de conflitos</p>
                </div>
                <div class="feature">
                    <h4>📊 API REST Completa</h4>
                    <p>CRUD completo para todas as entidades</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🔐 Autenticação</h2>
            
            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/auth/login</span>
                    <span class="description">Login completo (email + senha)</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Para:</strong> Web e Mobile</p>
                    <p><strong>Body:</strong> { email, senha }</p>
                    <span class="tag">JWT Token</span>
                    <span class="tag">Validade 12h</span>
                    <div class="example">curl -X POST ${baseUrl}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@teste.com","senha":"123456"}'</div>
                    <p style="margin-top: 10px;"><strong>Resposta:</strong></p>
                    <div class="example">{"token":"eyJhbGc...","usuario":{"id":1,"nome":"Admin","email":"admin@teste.com"},"expiresIn":"12h"}</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/auth/login/pin</span>
                    <span class="description">Login rápido com PIN</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Para:</strong> Tela Touch em sala de reuniões</p>
                    <p><strong>Body:</strong> { usuarioId, pin }</p>
                    <span class="tag">PIN 4-6 dígitos</span>
                    <span class="tag">Uso Interno</span>
                    <div class="example">curl -X POST ${baseUrl}/auth/login/pin \\
  -H "Content-Type: application/json" \\
  -d '{"usuarioId":1,"pin":"1234"}'</div>
                    <p style="margin-top: 10px;"><strong>Fluxo:</strong></p>
                    <ol style="margin-left: 20px; margin-top: 5px;">
                        <li>Usuário seleciona seu nome na lista</li>
                        <li>Digita PIN de 4 dígitos</li>
                        <li>Recebe token válido por 12h</li>
                    </ol>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/auth/usuarios</span>
                    <span class="description">Lista usuários para seleção</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Retorna apenas <code>id</code> e <code>nome</code> dos usuários ativos (sem dados sensíveis).</p>
                    <p><strong>Uso:</strong> Popular dropdown/lista na tela de login com PIN</p>
                    <div class="example">curl ${baseUrl}/auth/usuarios</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/auth/verify</span>
                    <span class="description">Verifica se token é válido</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Header:</strong> Authorization: Bearer {token}</p>
                    <div class="example">curl ${baseUrl}/auth/verify \\
  -H "Authorization: Bearer eyJhbGc..."</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/auth/refresh</span>
                    <span class="description">Renova token expirado</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Header:</strong> Authorization: Bearer {token_expirado}</p>
                    <div class="example">curl -X POST ${baseUrl}/auth/refresh \\
  -H "Authorization: Bearer eyJhbGc..."</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🗂️ Ordens de Serviço</h2>
            
            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/ordens-servico</span>
                    <span class="description">Lista todas as ordens de serviço</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Retorna todas as OSs indexadas com possibilidade de filtros.</p>
                    <div class="example">curl ${baseUrl}/api/ordens-servico</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/ordens-servico/:id</span>
                    <span class="description">Busca OS por ID</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Retorna detalhes completos de uma ordem de serviço específica.</p>
                    <div class="example">curl ${baseUrl}/api/ordens-servico/1</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/ordens-servico/numero/:numero</span>
                    <span class="description">Busca OS por número</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Busca ordem de serviço pelo número da OS. Retorna todas as versões.</p>
                    <div class="example">curl ${baseUrl}/api/ordens-servico/numero/12345</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/ordens-servico</span>
                    <span class="description">Cria nova ordem de serviço</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body:</strong> { numeroOS, nomeCliente, nomeEvento, data, osAtualizada }</p>
                    <div class="example">curl -X POST ${baseUrl}/api/ordens-servico \\
  -H "Content-Type: application/json" \\
  -d '{"numeroOS":"12345","nomeCliente":"João Silva","nomeEvento":"Manutenção","data":"2025-12-28"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method put">PUT</span>
                    <span class="path">/api/ordens-servico/:id</span>
                    <span class="description">Atualiza ordem de serviço</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body (parcial):</strong> Envie apenas os campos que deseja atualizar</p>
                    <div class="example">curl -X PUT ${baseUrl}/api/ordens-servico/1 \\
  -H "Content-Type: application/json" \\
  -d '{"nomeCliente":"João Silva Updated","status":"concluido"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <span class="path">/api/ordens-servico/:id</span>
                    <span class="description">Remove ordem de serviço</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <div class="example">curl -X DELETE ${baseUrl}/api/ordens-servico/1</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🔧 Técnicos</h2>
            
            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/tecnicos</span>
                    <span class="description">Lista todos os técnicos</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <div class="example">curl ${baseUrl}/api/tecnicos</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/tecnicos</span>
                    <span class="description">Cria novo técnico</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body:</strong> { nome, email, telefone?, especialidade? }</p>
                    <div class="example">curl -X POST ${baseUrl}/api/tecnicos \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"João Silva","email":"joao@email.com","especialidade":"Manutenção"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method put">PUT</span>
                    <span class="path">/api/tecnicos/:id</span>
                    <span class="description">Atualiza técnico</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body (parcial):</strong> Envie apenas os campos que deseja atualizar</p>
                    <div class="example">curl -X PUT ${baseUrl}/api/tecnicos/1 \\
  -H "Content-Type: application/json" \\
  -d '{"telefone":"(11) 98888-8888","ativo":false}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <span class="path">/api/tecnicos/:id</span>
                    <span class="description">Remove técnico</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <div class="example">curl -X DELETE ${baseUrl}/api/tecnicos/1</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>👥 Atendimentos / Gestão de Equipes</h2>
            
            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/atendimentos</span>
                    <span class="description">Vincula técnico a uma OS</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Validações:</strong></p>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>✅ Verifica conflitos de agenda (aviso, não bloqueia)</li>
                        <li>✅ Previne duplicação (mesmo técnico, mesma OS)</li>
                        <li>✅ Valida técnico ativo</li>
                    </ul>
                    <div class="example">curl -X POST ${baseUrl}/api/atendimentos \\
  -H "Content-Type: application/json" \\
  -d '{"ordemServicoId":1,"tecnicoId":1,"status":"pendente"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/atendimentos/equipe</span>
                    <span class="description">Escala equipe completa para uma OS</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Vincula múltiplos técnicos de uma vez com validação individual.</p>
                    <span class="tag">Múltiplos Técnicos</span>
                    <span class="tag">Verificação de Conflitos</span>
                    <span class="tag">Relatório Detalhado</span>
                    <div class="example">curl -X POST ${baseUrl}/api/atendimentos/equipe \\
  -H "Content-Type: application/json" \\
  -d '{"ordemServicoId":1,"tecnicoIds":[1,2,3,4],"status":"pendente"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/atendimentos/tecnico/:id/agenda/:data</span>
                    <span class="description">Verifica agenda do técnico</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Consulta todos os atendimentos de um técnico em uma data específica.</p>
                    <p><strong>Formato da data:</strong> YYYY-MM-DD</p>
                    <div class="example">curl ${baseUrl}/api/atendimentos/tecnico/1/agenda/2025-12-28</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/atendimentos/ordem-servico/:id</span>
                    <span class="description">Lista equipe alocada em uma OS</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Retorna todos os técnicos vinculados a uma ordem de serviço.</p>
                    <div class="example">curl ${baseUrl}/api/atendimentos/ordem-servico/1</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method put">PUT</span>
                    <span class="path">/api/atendimentos/:id</span>
                    <span class="description">Atualiza atendimento</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body (parcial):</strong> { status?, observacoes?, tecnicoId?, ordemServicoId? }</p>
                    <p>Útil para mudar status (pendente → em_andamento → concluido) ou reatribuir técnico.</p>
                    <div class="example">curl -X PUT ${baseUrl}/api/atendimentos/1 \\
  -H "Content-Type: application/json" \\
  -d '{"status":"concluido","observacoes":"Trabalho finalizado"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <span class="path">/api/atendimentos/:id</span>
                    <span class="description">Remove atendimento</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p>Remove a alocação de um técnico de uma OS.</p>
                    <div class="example">curl -X DELETE ${baseUrl}/api/atendimentos/1</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>👤 Usuários</h2>
            
            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/api/usuarios</span>
                    <span class="description">Lista todos os usuários</span>
                    <span class="arrow">▼</span>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method post">POST</span>
                    <span class="path">/api/usuarios</span>
                    <span class="description">Cria novo usuário</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body:</strong> { nome, email, senha }</p>
                    <div class="example">curl -X POST ${baseUrl}/api/usuarios \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"Admin","email":"admin@email.com","senha":"senha123"}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method put">PUT</span>
                    <span class="path">/api/usuarios/:id</span>
                    <span class="description">Atualiza usuário</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <p><strong>Body (parcial):</strong> { nome?, email?, senha?, ativo? }</p>
                    <div class="example">curl -X PUT ${baseUrl}/api/usuarios/1 \\
  -H "Content-Type: application/json" \\
  -d '{"nome":"Admin Updated","ativo":false}'</div>
                </div>
            </div>

            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method delete">DELETE</span>
                    <span class="path">/api/usuarios/:id</span>
                    <span class="description">Remove usuário</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <div class="example">curl -X DELETE ${baseUrl}/api/usuarios/1</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🏥 Health Check</h2>
            
            <div class="endpoint" onclick="this.classList.toggle('expanded')">
                <div class="endpoint-header">
                    <span class="method get">GET</span>
                    <span class="path">/health</span>
                    <span class="description">Verifica status da API</span>
                    <span class="arrow">▼</span>
                </div>
                <div class="endpoint-details">
                    <div class="example">curl ${baseUrl}/health</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>ℹ️ Informações Adicionais</h2>
            <h3 style="margin-top: 15px; color: #667eea;">Versionamento de OS</h3>
            <p>O sistema mantém histórico completo de versões de ordens de serviço:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Arquivos com "O.S ATUALIZADA" criam nova versão</li>
                <li>Versões anteriores ficam marcadas como inativas</li>
                <li>Campo <code>ativa</code> indica a versão mais recente</li>
                <li>Relacionamento via <code>osOriginalId</code></li>
            </ul>

            <h3 style="margin-top: 20px; color: #667eea;">Gestão de Equipes</h3>
            <p>Recursos para trabalho em equipe:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Múltiplos técnicos por OS</li>
                <li>Verificação automática de conflitos de agenda</li>
                <li>Avisos não bloqueantes (flexibilidade operacional)</li>
                <li>Prevenção de duplicação</li>
            </ul>
        </div>
    </div>
</body>
</html>
`;
