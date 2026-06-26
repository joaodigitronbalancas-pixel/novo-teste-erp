import { ArchitectureSpecification, ChatMessage } from "../types";

/**
 * Generates a high-fidelity, highly realistic and complete Architecture Specification 
 * entirely offline based on the user's input fields.
 * This is used as an elegant fallback in case of Gemini API Key issues or 403 Access Denied.
 */
export function generateOfflineSpecification(formData: {
  projectName: string;
  systemType: string;
  problemGoal: string;
  audience: string;
  scale: string;
  preferredTech: string;
  customInstructions: string;
}): ArchitectureSpecification {
  const name = formData.projectName || "SuaArquitetura";
  const systemType = formData.systemType || "SaaS";
  const scale = formData.scale || "Escala Média (5.000+ usuários ativos)";
  const goal = formData.problemGoal || "Plataforma profissional moderna.";
  const audience = formData.audience || "Clientes corporativos, gestores e desenvolvedores.";
  const tech = formData.preferredTech || "Node.js, React, PostgreSQL, Docker";
  const instructions = formData.customInstructions || "Nenhuma instrução adicional configurada.";

  // Tables dynamic generation based on keywords
  const isSaaS = systemType.toLowerCase().includes("saas") || goal.toLowerCase().includes("tenant");
  const isEcom = systemType.toLowerCase().includes("commerce") || goal.toLowerCase().includes("venda") || goal.toLowerCase().includes("carrinho");
  const isFinance = systemType.toLowerCase().includes("pay") || goal.toLowerCase().includes("pagamento") || goal.toLowerCase().includes("ledger");

  const tables = [
    {
      name: isSaaS ? "tenants" : isEcom ? "stores" : "organizations",
      description: `Armazena as informações estruturais do ${isSaaS ? "inquilino comercial (tenant)" : "estabelecimento parceiro"}.`,
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
        { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
        { name: "subdomain", type: "VARCHAR(100)", constraints: "UNIQUE NOT NULL", isPrimaryKey: false, isForeignKey: false },
        { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'active'", isPrimaryKey: false, isForeignKey: false },
        { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", isPrimaryKey: false, isForeignKey: false }
      ],
      ddl: `CREATE TABLE ${isSaaS ? "tenants" : isEcom ? "stores" : "organizations"} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);`
    },
    {
      name: "users",
      description: "Tabela centralizada de contas de usuários com controle de perfil e credenciais hash.",
      columns: [
        { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
        { name: "tenant_id", type: "UUID", constraints: `REFERENCES ${isSaaS ? "tenants" : "organizations"}(id) ON DELETE CASCADE`, isPrimaryKey: false, isForeignKey: true, references: isSaaS ? "tenants" : "organizations" },
        { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", isPrimaryKey: false, isForeignKey: false },
        { name: "password_hash", type: "VARCHAR(255)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
        { name: "role", type: "VARCHAR(50)", constraints: "DEFAULT 'user' NOT NULL", isPrimaryKey: false, isForeignKey: false },
        { name: "is_active", type: "BOOLEAN", constraints: "DEFAULT true", isPrimaryKey: false, isForeignKey: false }
      ],
      ddl: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES ${isSaaS ? "tenants" : "organizations"}(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT true
);`
    }
  ];

  if (isEcom) {
    tables.push(
      {
        name: "products",
        description: "Catálogo de produtos estruturado com suporte a variações e estoque físico.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
          { name: "store_id", type: "UUID", constraints: "REFERENCES stores(id)", isPrimaryKey: false, isForeignKey: true, references: "stores" },
          { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "price_cents", type: "INTEGER", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "sku", type: "VARCHAR(100)", constraints: "UNIQUE", isPrimaryKey: false, isForeignKey: false },
          { name: "inventory_count", type: "INTEGER", constraints: "DEFAULT 0", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  price_cents INTEGER NOT NULL,
  sku VARCHAR(100) UNIQUE,
  inventory_count INTEGER DEFAULT 0
);`
      },
      {
        name: "orders",
        description: "Registro consolidado de pedidos de compra e status de transação financeira.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
          { name: "user_id", type: "UUID", constraints: "REFERENCES users(id)", isPrimaryKey: false, isForeignKey: true, references: "users" },
          { name: "total_cents", type: "INTEGER", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'pending'", isPrimaryKey: false, isForeignKey: false },
          { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total_cents INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);`
      }
    );
  } else if (isFinance) {
    tables.push(
      {
        name: "accounts",
        description: "Contas de saldo dos clientes para controle de lançamentos financeiros.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY", isPrimaryKey: true, isForeignKey: false },
          { name: "user_id", type: "UUID", constraints: "REFERENCES users(id)", isPrimaryKey: false, isForeignKey: true, references: "users" },
          { name: "balance_cents", type: "BIGINT", constraints: "DEFAULT 0 NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "currency", type: "VARCHAR(3)", constraints: "DEFAULT 'BRL'", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance_cents BIGINT DEFAULT 0 NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL'
);`
      },
      {
        name: "ledger_entries",
        description: "Ledger de dupla entrada (double-entry accounting) imutável para transações.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
          { name: "source_account_id", type: "UUID", constraints: "REFERENCES accounts(id)", isPrimaryKey: false, isForeignKey: true, references: "accounts" },
          { name: "destination_account_id", type: "UUID", constraints: "REFERENCES accounts(id)", isPrimaryKey: false, isForeignKey: true, references: "accounts" },
          { name: "amount_cents", type: "BIGINT", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "description", type: "TEXT", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_account_id UUID REFERENCES accounts(id),
  destination_account_id UUID REFERENCES accounts(id),
  amount_cents BIGINT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`
      }
    );
  } else {
    // Standard Tasks / Workspace tables
    tables.push(
      {
        name: "projects",
        description: "Controle de escopo, prazos e prioridades de projetos de equipes.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
          { name: "tenant_id", type: "UUID", constraints: "REFERENCES tenants(id)", isPrimaryKey: false, isForeignKey: true, references: "tenants" },
          { name: "title", type: "VARCHAR(255)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'planning'", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'planning'
);`
      },
      {
        name: "audit_logs",
        description: "Registro de auditoria para conformidade de dados e segurança de TI.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
          { name: "user_id", type: "UUID", constraints: "REFERENCES users(id)", isPrimaryKey: false, isForeignKey: true, references: "users" },
          { name: "action", type: "VARCHAR(100)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "ip_address", type: "VARCHAR(45)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`
      }
    );
  }

  const codeExampleText = isSaaS ? `// Exemplo de isolamento dinâmico de Tenant no NestJS utilizando interceptores
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('O header X-Tenant-ID é obrigatório para esta operação corporativa.');
    }

    // Registra o tenantId na requisição para consumo seguro pelos repositórios/services
    request.tenantId = tenantId;
    return next.handle();
  }
}` : isEcom ? `// Exemplo de controle concorrente otimista de estoque de produtos (Clean Code)
import { Injectable, ConflictException } from '@nestjs/common';

@Injectable()
export class InventoryService {
  async deductInventory(productId: string, quantity: number, currentVersion: number) {
    // Executa update apenas se a versão coincidir (previne race conditions)
    const updated = await this.db.query(
      'UPDATE products SET inventory_count = inventory_count - $1, version = version + 1 WHERE id = $2 AND version = $3',
      [quantity, productId, currentVersion]
    );

    if (updated.rowCount === 0) {
      throw new ConflictException('Houve uma alteração de concorrência simultânea. Por favor, recarregue a página.');
    }
    return { success: true };
  }
}` : `// Exemplo de implementação limpa e encapsulada baseada em Clean Architecture / SOLID
import { Injectable } from '@nestjs/common';

export interface UseCase<Request, Response> {
  execute(request: Request): Promise<Response>;
}

@Injectable()
export class ProcessPaymentUseCase implements UseCase<PaymentDto, ReceiptDto> {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
    private readonly ledgerRepo: ILedgerRepository
  ) {}

  async execute(dto: PaymentDto): Promise<ReceiptDto> {
    // 1. Valida integridade do payload financeiro
    dto.validateOrThrow();

    // 2. Garante gravação segura no ledger em transação única
    return await this.ledgerRepo.runInTransaction(async (session) => {
      const result = await this.paymentGateway.authorize(dto);
      await this.ledgerRepo.record({
        from: dto.sourceAccountId,
        to: dto.destAccountId,
        cents: dto.amountCents,
        authCode: result.code
      }, session);

      return ReceiptDto.fromResult(result);
    });
  }
}`;

  return {
    projectName: name,
    systemType: systemType,
    scale: scale,
    problemDefinition: {
      description: goal,
      painPoints: [
        "Sobrecarga de requisições concorrentes sem balanceamento adequado.",
        "Risco de vazamento de credenciais ou dados sensíveis sensíveis à LGPD.",
        "Falta de controle de auditoria de operações críticas administrativas."
      ],
      targetAudience: audience.split(",").map(t => t.trim())
    },
    requirements: {
      functional: [
        { id: "RF-101", name: "Controle de Acessos RBAC", description: "O sistema deve garantir acessos diferenciados de acordo com os perfis de usuários (Admin, Staff, Customer).", priority: "Alta" },
        { id: "RF-102", name: "Isolamento Lógico Restrito", description: "Não deve haver compartilhamento ou vazamento de escopo de dados entre organizações diferentes.", priority: "Alta" },
        { id: "RF-103", name: "Painéis de Monitoramento", description: "Disponibilizar logs de auditoria e relatórios de métricas técnicas chave aos administradores.", priority: "Média" }
      ],
      nonFunctional: [
        { id: "RNF-201", name: "Segurança de Dados Sensíveis", description: "Todas as senhas devem ser armazenadas com criptografia forte (Bcrypt) e conexões SSL/TLS obrigatórias.", priority: "Alta" },
        { id: "RNF-202", name: "Tempo de Resposta", description: "As operações de leitura de dados indexados devem retornar em menos de 200ms na média de rede.", priority: "Alta" },
        { id: "RNF-203", name: "Observabilidade de Métricas", description: "Uso de logs estruturados em formato JSON para fácil ingestão em ferramentas como ELK ou Datadog.", priority: "Média" }
      ]
    },
    architecture: {
      proposal: "Arquitetura limpa estruturada em Camadas com desacoplamento modular forte de domínios. Foco em estabilidade, encapsulamento de regras de negócios e altíssima manutenibilidade do código.",
      pattern: "Clean Architecture / Domain-Driven Design (DDD)",
      justification: `Escolha otimizada para o ecossistema solicitado (${tech}). Isola perfeitamente a lógica de negócio principal dos detalhes de infraestrutura (bancos, frameworks, APIs).`,
      coreComponents: [
        { name: "API Gateway Layer", role: "Roteamento, autenticação prévia, rate limiting e terminação SSL.", technology: "Express / NGINX / Cloudflare" },
        { name: "Application Core Domain", role: "Implementação das entidades ricas de negócio e regras de casos de uso (Use Cases) desacoplados.", technology: "Pure TypeScript / SOLID Principles" },
        { name: "Database Service Infrastructure", role: "Persistência altamente escalável com controle forte de pools de conexões e migrações.", technology: "PostgreSQL / TypeORM / Prisma" }
      ]
    },
    techStack: [
      { category: "Frontend Web UI", technology: "React.js (com Vite & Tailwind CSS)", justification: "Facilita o desenvolvimento ágil de interfaces reativas, componentização rica e ótima performance com renderização otimizada.", version: "18.3.x" },
      { category: "Backend Runtime", technology: "Node.js (TypeScript)", justification: "Excelente performance de I/O não-bloqueante para APIs rápidas, com tipagem estática segura proporcionada pelo TypeScript.", version: "20.x LTS" },
      { category: "Banco de Dados Primário", technology: "PostgreSQL", justification: "Líder absoluto em conformidade ACID, indexação avançada, suporte nativo a campos JSONB e integridade transacional de dados.", version: "16.x" },
      { category: "Conteinerização", technology: "Docker", justification: "Garante portabilidade absoluta do ambiente entre desenvolvimento local e servidores de produção de nuvem.", version: "Latest" }
    ],
    database: {
      type: "Banco Relacional Multi-Tenant Otimizado",
      strategy: "Isolamento Lógico por chave 'tenant_id' ou 'organization_id' com indexação composta obrigatória em todas as tabelas compartilhadas para garantir eficiência e barreira contra vazamentos.",
      tables: tables
    },
    apis: [
      {
        controller: "AuthController (Autenticação)",
        endpoints: [
          {
            method: "POST",
            path: "/api/v1/auth/login",
            description: "Realiza a validação de credenciais do usuário e devolve o token JWT assinado digitalmente.",
            requestBody: `{
  "email": "usuario@exemplo.com",
  "password": "senha_segura_123"
}`,
            responseBody: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e305e548-8efd-4e92-91bf-a9f60cb09581",
    "email": "usuario@exemplo.com",
    "role": "admin"
  }
}`,
            statusCodes: [
              { code: 200, description: "Login efetuado com sucesso." },
              { code: 401, description: "Credenciais de acesso incorretas ou conta inativa." }
            ]
          }
        ]
      },
      {
        controller: `${name}Controller (Regras Centrais)`,
        endpoints: [
          {
            method: "GET",
            path: `/api/v1/${isEcom ? "products" : "projects"}`,
            description: `Recupera a listagem paginada de ${isEcom ? "produtos" : "projetos"} filtrados pelo tenant ativo da sessão.`,
            responseBody: `[
  {
    "id": "78b4618e-49b8-4c91-9562-b9e77ee92d83",
    "title": "Configuração inicial de infraestrutura",
    "status": "active"
  }
]`,
            statusCodes: [
              { code: 200, description: "Lista retornada com sucesso." },
              { code: 403, description: "Acesso não autorizado para o inquilino fornecido." }
            ]
          }
        ]
      }
    ],
    bestPractices: [
      {
        principle: "Single Responsibility Principle (SRP / SOLID)",
        description: "Cada módulo, classe ou função deve conter apenas uma única responsabilidade. O código de acesso ao banco de dados não deve se misturar com rotas HTTP.",
        codeExample: {
          language: "typescript",
          title: "Clean Code SRP Implementation",
          code: codeExampleText
        }
      }
    ],
    security: {
      authentication: "Autenticação via JSON Web Tokens (JWT) com assinatura assimétrica (RS256) com tempo de expiração curto (15 minutos) e suporte a Refresh Token seguro HttpOnly.",
      authorization: "Role-Based Access Control (RBAC) com validação dinâmica por decoradores no entry-point dos controllers.",
      dataProtection: "Criptografia de dados sensíveis em repouso (AES-256) e trânsito (HTTPS/TLS 1.3). Mascaramento de dados e conformidade estrita com as diretrizes da LGPD.",
      checklist: [
        "Bloqueio preventivo de requisições suspeitas com Rate Limiting e Helmet.",
        "Prevenção absoluta de SQL Injection utilizando exclusivamente Query Parameters parametrizados.",
        "Armazenamento de chaves secretas fora do código de aplicação usando gerenciador de segredos de produção.",
        "Execução periódica de análise estática de segurança (SAST) em todas as dependências."
      ]
    },
    deployment: {
      cicd: "GitHub Actions executando testes unitários/integração automaticamente a cada pull request. Após aprovação, realiza o build da imagem Docker corporativa e distribui via Cloud Run.",
      cloudProvider: "Google Cloud Platform (GCP) ou AWS (Amazon Web Services)",
      infraAsCode: "Terraform para especificação declarativa de todos os recursos de rede, instâncias de bancos de dados e serviços serverless.",
      stepByStep: [
        "1. O desenvolvedor realiza o push para a branch 'main'.",
        "2. A esteira CI/CD valida testes, linter e regras estáticas de segurança.",
        "3. Imagem Docker de produção é construída, otimizada e publicada no Container Registry privado.",
        "4. Trigger de Deploy atualiza os pods do servidor sem downtime (Rolling Update)."
      ]
    },
    roadmap: [
      {
        phase: "Fase 1",
        title: "Modelagem Básica & MVP",
        duration: "4 Semanas",
        tasks: [
          "Criação das migrações e tabelas fundamentais de autenticação e tenants.",
          "Implementação do esqueleto da API Gateway, autenticação JWT e segurança base.",
          "Desenvolvimento das interfaces Web primárias e formulários de cadastro."
        ]
      },
      {
        phase: "Fase 2",
        title: "Regras de Domínio & Integrações",
        duration: "5 Semanas",
        tasks: [
          "Construção dos endpoints de negócio complexos, transações de estoque ou faturamento.",
          "Integrações secundárias (Gateways de pagamentos, disparadores de e-mails/webhooks).",
          "Execução de testes unitários completos em toda a lógica de domínio principal."
        ]
      }
    ],
    scalabilitySuggestions: [
      { title: "Réplicas de Leitura do Banco", description: "Direcionar todas as consultas densas e relatórios estatísticos para réplicas de leitura PostgreSQL, aliviando o banco de escrita primário.", type: "Performance" },
      { title: "Cache de Consultas de Catálogo", description: "Implementar uma camada Redis para cache de leituras repetitivas do catálogo ou cadastros lentos.", type: "Performance" }
    ],
    rawArchitectReply: "Especificação gerada localmente com sucesso! Você pode refinar as tabelas físicas, DevOps e segurança usando o Co-pilot interativo."
  };
}

/**
 * Handles simulated responses for the architect chatbot, letting users still refine
 * their architecture dynamically even if Gemini is disabled or blocked.
 */
export function handleOfflineChatReply(
  currentSpec: ArchitectureSpecification,
  newMessage: string
): { assistantReply: string; updatedArchitecture: ArchitectureSpecification } {
  const text = newMessage.toLowerCase();
  let reply = "";
  const updatedSpec = JSON.parse(JSON.stringify(currentSpec)) as ArchitectureSpecification;

  if (text.includes("oauth") || text.includes("social") || text.includes("google")) {
    reply = `Excelente solicitação técnica! Adicionei suporte a **OAuth 2.0 / Login Social com Google** nas especificações de Segurança.

**O que eu alterei:**
1. **Segurança**: Adicionei o fluxo de OAuth ao mecanismo de autenticação.
2. **Database**: Adicionei novos requisitos para gerenciar o vínculo com chaves federadas na tabela de usuários.
3. **APIs**: Planejei o endpoint \`/api/v1/auth/google/callback\` para lidar com a troca segura do token JWT de sessão.`;

    // Modify security
    updatedSpec.security.authentication = "Autenticação federada avançada via OAuth 2.0 (Login social com Google e GitHub) integrada com troca de tokens JWT curta assinado com RS256.";
    updatedSpec.security.checklist.push("Sincronização segura de dados de perfil federados protegidos contra injeções de atributos.");
    
    // Modify database tables
    const userTable = updatedSpec.database.tables.find(t => t.name === "users");
    if (userTable) {
      userTable.columns.push(
        { name: "google_id", type: "VARCHAR(255)", constraints: "UNIQUE", isPrimaryKey: false, isForeignKey: false },
        { name: "avatar_url", type: "TEXT", constraints: "NULL", isPrimaryKey: false, isForeignKey: false }
      );
      userTable.ddl = userTable.ddl.replace(
        "role VARCHAR(50) DEFAULT 'user' NOT NULL,",
        "role VARCHAR(50) DEFAULT 'user' NOT NULL,\n  google_id VARCHAR(255) UNIQUE,\n  avatar_url TEXT,"
      );
    }
  } else if (text.includes("auditoria") || text.includes("logs") || text.includes("tabela")) {
    reply = `Certamente. Eu acabo de modelar a tabela física de **logs_auditoria** na especificação do seu banco de dados relacional!

**Alterações feitas:**
1. **Database**: Adicionei a tabela de auditoria (\`audit_logs\`) para registrar ações cruciais de segurança.
2. **Requisitos**: Adicionei o requisito funcional de auditoria preventiva.`;

    // Ensure audit logs table is present
    const hasAudit = updatedSpec.database.tables.some(t => t.name === "audit_logs");
    if (!hasAudit) {
      updatedSpec.database.tables.push({
        name: "audit_logs",
        description: "Registro de auditoria para conformidade de dados e segurança de TI.",
        columns: [
          { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", isPrimaryKey: true, isForeignKey: false },
          { name: "user_id", type: "UUID", constraints: "REFERENCES users(id)", isPrimaryKey: false, isForeignKey: true, references: "users" },
          { name: "action", type: "VARCHAR(100)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "ip_address", type: "VARCHAR(45)", constraints: "NOT NULL", isPrimaryKey: false, isForeignKey: false },
          { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", isPrimaryKey: false, isForeignKey: false }
        ],
        ddl: `CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`
      });
    }
  } else {
    reply = `Entendido! Processei a sua solicitação sobre **"${newMessage}"**. Como estamos operando no **Modo de Demonstração Técnico**, calibrei os requisitos arquiteturais e documentei as seguintes melhores práticas no seu painel principal:

- **Estratégia de Alta Disponibilidade**: Proteção avançada e escalabilidade automática de serviços.
- **Resiliência e Failover**: Tratamento de circuit-breakers para evitar picos indesejados.

Sinta-se à vontade para fazer novas perguntas técnicas sobre o banco de dados, APIs ou DevOps do projeto **${currentSpec.projectName}**!`;
  }

  return {
    assistantReply: reply,
    updatedArchitecture: updatedSpec
  };
}
