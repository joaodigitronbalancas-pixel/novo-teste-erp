export interface ProblemDefinition {
  description: string;
  painPoints: string[];
  targetAudience: string[];
}

export interface Requirement {
  id: string;
  name: string;
  description: string;
  priority: string; // 'Alta' | 'Média' | 'Baixa'
}

export interface Requirements {
  functional: Requirement[];
  nonFunctional: Requirement[];
}

export interface CoreComponent {
  name: string;
  role: string;
  technology: string;
}

export interface ArchitectureDetail {
  proposal: string;
  pattern: string;
  justification: string;
  coreComponents: CoreComponent[];
}

export interface TechStackItem {
  category: string;
  technology: string;
  justification: string;
  version: string;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  constraints: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: DatabaseColumn[];
  ddl: string;
}

export interface DatabaseDetail {
  type: string;
  strategy: string;
  tables: DatabaseTable[];
}

export interface StatusCode {
  code: number;
  description: string;
}

export interface ApiEndpoint {
  method: string; // 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
  statusCodes: StatusCode[];
}

export interface ApiController {
  controller: string;
  endpoints: ApiEndpoint[];
}

export interface CodeExample {
  language: string;
  title: string;
  code: string;
}

export interface BestPractice {
  principle: string;
  description: string;
  codeExample?: CodeExample;
}

export interface SecurityDetail {
  authentication: string;
  authorization: string;
  dataProtection: string;
  checklist: string[];
}

export interface DeploymentDetail {
  cicd: string;
  cloudProvider: string;
  infraAsCode: string;
  stepByStep: string[];
}

export interface RoadmapPhase {
  phase: string;
  title: string;
  duration: string;
  tasks: string[];
}

export interface ScalabilitySuggestion {
  title: string;
  description: string;
  type: string; // 'Performance' | 'Resilience' | 'Operations'
}

export interface ArchitectureSpecification {
  projectName: string;
  systemType: string;
  scale: string;
  problemDefinition: ProblemDefinition;
  requirements: Requirements;
  architecture: ArchitectureDetail;
  techStack: TechStackItem[];
  database: DatabaseDetail;
  apis: ApiController[];
  bestPractices: BestPractice[];
  security: SecurityDetail;
  deployment: DeploymentDetail;
  roadmap: RoadmapPhase[];
  scalabilitySuggestions: ScalabilitySuggestion[];
  rawArchitectReply: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}
