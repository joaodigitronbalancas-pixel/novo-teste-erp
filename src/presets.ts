export interface PresetTemplate {
  name: string;
  projectName: string;
  systemType: string;
  problemGoal: string;
  audience: string;
  scale: string;
  preferredTech: string;
  customInstructions: string;
}

export const ARCHITECTURE_PRESETS: PresetTemplate[] = [
  {
    name: "SaaS B2B Multitenant",
    projectName: "TenantFlow",
    systemType: "SaaS (Software as a Service)",
    problemGoal: "Plataforma de gestão de projetos corporativos com isolamento lógico de inquilinos (multitenancy), controle de acessos fino baseado em regras (RBAC), assinaturas recorrentes com Stripe, logs de auditoria detalhados e painéis analíticos em tempo real.",
    audience: "Empresas de médio e grande porte, gestores de equipes de tecnologia e diretores operacionais.",
    scale: "Escala Média a Alta (15.000+ usuários ativos diários, volumes pesados de escrita e leitura de tarefas)",
    preferredTech: "TypeScript, Node.js (NestJS), React (Vite, Tailwind), PostgreSQL (para dados estruturados e tenant isolation), Redis (caching), Docker.",
    customInstructions: "Garantir isolamento absoluto de inquilinos na base de dados (utilizar coluna tenant_id ou schemas separados) e detalhar como os tokens JWT carregam o contexto do inquilino."
  },
  {
    name: "E-Commerce de Grande Escala",
    projectName: "MegaCart",
    systemType: "E-Commerce de Alta Performance",
    problemGoal: "Marketplace de alta performance com catálogo dinâmico de produtos, gerenciamento de carrinhos em memória de baixíssima latência, processamento assíncrono de pedidos para suportar picos (como Black Friday), notificações de entrega em tempo real e integração com múltiplos gateways de pagamento.",
    audience: "Consumidores finais nacionais, lojistas parceiros (multi-vendor) e operadores de logística.",
    scale: "Grande Escala (200.000+ acessos simultâneos em picos de vendas, 2.000 requisições de checkout por minuto)",
    preferredTech: "Python (FastAPI) ou Go, React (SPA), PostgreSQL (pedidos/financeiro), MongoDB (catálogo sem esquema), RabbitMQ ou Apache Kafka para mensageria assíncrona, Redis.",
    customInstructions: "Detalar a estratégia de cacheamento do catálogo de produtos para evitar sobrecarga no banco primário, e propor um fluxo assíncrono de criação de pedidos com garantia de entrega de mensagem."
  },
  {
    name: "API Gateway & Microsserviços FinTech",
    projectName: "PayCore",
    systemType: "API / Plataforma de Pagamentos",
    problemGoal: "Core de pagamento e ledger financeiro de alta segurança com dupla entrada (double-entry bookkeeping) para registro de transações entre carteiras digitais de usuários, conciliação bancária automática, prevenção a fraudes em tempo real e auditoria em conformidade com normas rígidas de segurança.",
    audience: "Clientes de carteiras digitais, e-commerces integrados e analistas de risco/fraude internos.",
    scale: "Alta Escala (100.000+ transações financeiras diárias com consistência transacional absoluta ACID)",
    preferredTech: "Java (Spring Boot) ou .NET Core, React para painel de administração interno, PostgreSQL (consistência forte para o ledger), Redis para controle de rate limiting no gateway, Docker/Kubernetes.",
    customInstructions: "Exigir consistência estrita ACID para transferência de fundos utilizando transações de banco de dados e controle de concorrência pessimista ou otimista. Detalhar segurança contra ataques de replay e OWASP Top 10."
  },
  {
    name: "ERP de Manufatura Corporativo",
    projectName: "FactoryERP",
    systemType: "ERP (Enterprise Resource Planning)",
    problemGoal: "Sistema integrado de planejamento de recursos empresariais focado em controle de chão de fábrica, rastreabilidade de matérias-primas, ordem de serviços, controle de estoque crítico integrado com leitores de código de barras e emissão de relatórios fiscais densos em PDF.",
    audience: "Operadores de fábrica, gerentes de estoque, diretores industriais e contadores corporativos.",
    scale: "Escala Média (3.000+ usuários internos corporativos com alta complexidade nas regras de negócio e relatórios pesados)",
    preferredTech: "C# (.NET Core), React para frontend web, PostgreSQL ou SQL Server, Celery/Hangfire para processamento em fila de relatórios demorados, Docker.",
    customInstructions: "Dar ênfase especial na otimização de consultas SQL para relatórios históricos complexos (uso de materialized views ou réplicas de leitura) e segurança de rede corporativa local."
  }
];
