import React, { useState } from "react";
import { ArchitectureSpecification } from "../types";
import { 
  FileText, Cpu, Database, Network, Code2, ShieldAlert, CalendarRange, 
  Copy, Check, ChevronDown, ChevronUp, KeyRound, Link2, Download,
  Cloud, Lock, FileCode, CheckSquare, Layers, Sparkles
} from "lucide-react";

interface DashboardViewProps {
  spec: ArchitectureSpecification;
  onBack: () => void;
  onUpdateSpec: (newSpec: ArchitectureSpecification) => void;
}

export default function DashboardView({ spec, onBack, onUpdateSpec }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [expandedDDL, setExpandedDDL] = useState<Record<string, boolean>>({});
  const [copiedText, setCopiedText] = useState<Record<string, boolean>>({});
  const [securityChecked, setSecurityChecked] = useState<Record<number, boolean>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopiedText((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const toggleEndpoint = (path: string) => {
    setExpandedEndpoints((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const toggleDDL = (tableName: string) => {
    setExpandedDDL((prev) => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const toggleSecurityCheck = (index: number) => {
    setSecurityChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const exportMarkdown = () => {
    let md = `# Especificação Arquitetural: ${spec.projectName}\n`;
    md += `**Tipo de Sistema:** ${spec.systemType}\n`;
    md += `**Escala:** ${spec.scale}\n\n`;

    md += `## 1. Definição do Problema e Escopo\n`;
    md += `${spec.problemDefinition.description}\n\n`;
    md += `### Público-Alvo:\n`;
    spec.problemDefinition.targetAudience.forEach(t => md += `- ${t}\n`);
    md += `\n### Dores Identificadas:\n`;
    spec.problemDefinition.painPoints.forEach(p => md += `- ${p}\n`);

    md += `\n## 2. Requisitos do Sistema\n`;
    md += `### Requisitos Funcionais:\n`;
    spec.requirements.functional.forEach(r => md += `- **${r.id} - ${r.name}:** ${r.description} (Prioridade: ${r.priority})\n`);
    md += `\n### Requisitos Não-Funcionais:\n`;
    spec.requirements.nonFunctional.forEach(r => md += `- **${r.id} - ${r.name}:** ${r.description} (Prioridade: ${r.priority})\n`);

    md += `\n## 3. Proposta de Arquitetura\n`;
    md += `**Padrão Arquitetural:** ${spec.architecture.pattern}\n\n`;
    md += `${spec.architecture.proposal}\n\n`;
    md += `### Justificativa:\n${spec.architecture.justification}\n\n`;

    md += `### Stack Tecnológica Recomendada:\n`;
    spec.techStack.forEach(t => {
      md += `- **${t.category}:** ${t.technology} (v${t.version}) - ${t.justification}\n`;
    });

    md += `\n## 4. Estrutura de Banco de Dados (${spec.database.type})\n`;
    md += `**Estratégia Geral:** ${spec.database.strategy}\n\n`;
    spec.database.tables.forEach(table => {
      md += `### Tabela: ${table.name}\n${table.description}\n\n`;
      md += `\`\`\`sql\n${table.ddl}\n\`\`\`\n\n`;
    });

    md += `\n## 5. Definição de APIs (Endpoints REST)\n`;
    spec.apis.forEach(ctrl => {
      md += `### Controller: ${ctrl.controller}\n`;
      ctrl.endpoints.forEach(ep => {
        md += `#### ${ep.method} ${ep.path}\n*${ep.description}*\n`;
        if (ep.requestBody) md += `**Request Body:**\n\`\`\`json\n${ep.requestBody}\n\`\`\`\n`;
        if (ep.responseBody) md += `**Response Body:**\n\`\`\`json\n${ep.responseBody}\n\`\`\`\n`;
        md += `\n`;
      });
    });

    md += `\n## 6. Padrões de Código e SOLID\n`;
    spec.bestPractices.forEach(bp => {
      md += `### ${bp.principle}\n${bp.description}\n\n`;
      if (bp.codeExample) {
        md += `**Exemplo de Implementação (${bp.codeExample.title}):**\n\`\`\`${bp.codeExample.language}\n${bp.codeExample.code}\n\`\`\`\n\n`;
      }
    });

    md += `\n## 7. Estratégia de Segurança\n`;
    md += `- **Autenticação:** ${spec.security.authentication}\n`;
    md += `- **Autorização:** ${spec.security.authorization}\n`;
    md += `- **Proteção de Dados (LGPD/GDPR):** ${spec.security.dataProtection}\n\n`;

    md += `\n## 8. Estratégia de Deploy e Infraestrutura\n`;
    md += `- **CI/CD:** ${spec.deployment.cicd}\n`;
    md += `- **Cloud:** ${spec.deployment.cloudProvider}\n`;
    md += `- **Infraestrutura como Código:** ${spec.deployment.infraAsCode}\n\n`;

    md += `\n## 9. Roadmap de Desenvolvimento\n`;
    spec.roadmap.forEach(phase => {
      md += `### ${phase.phase}: ${phase.title} (${phase.duration})\n`;
      phase.tasks.forEach(t => md += `- [ ] ${t}\n`);
      md += `\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `arquitetura_${spec.projectName.toLowerCase()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMethodBg = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "POST": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "PUT": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DELETE": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "PATCH": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-950 text-slate-100" id="spec-dashboard-root">
      {/* Upper Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-850 pb-5 mb-6 gap-4" id="dashboard-navbar">
        <div id="project-branding">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-mono text-[10px] font-bold rounded">
              ARQUITETURA PROJETADA
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {spec.systemType}
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-500 animate-pulse" />
            {spec.projectName}
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto" id="dashboard-action-buttons">
          <button
            onClick={onBack}
            className="flex-1 sm:flex-initial px-4 py-2 border border-slate-800 rounded-lg hover:bg-slate-900 text-xs font-medium text-slate-300 transition cursor-pointer"
          >
            Voltar ao Formulário
          </button>
          
          <button
            onClick={exportMarkdown}
            className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-lg shadow-amber-500/10"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Markdown (MD)
          </button>
        </div>
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="dashboard-main-grid">
        {/* Left Side Tab Selector */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-1" id="tab-selector-sidebar">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-3 mb-3 font-semibold">
            Especificações de Engenharia
          </div>
          {[
            { id: "overview", label: "Dores & Requisitos", icon: FileText },
            { id: "architecture", label: "Arquitetura & Stack", icon: Cpu },
            { id: "database", label: "Modelo de Banco", icon: Database },
            { id: "apis", label: "Catálogo de APIs", icon: Network },
            { id: "best-practices", label: "Padrões & SOLID", icon: Code2 },
            { id: "security-devops", label: "Segurança & Cloud", icon: ShieldAlert },
            { id: "roadmap-scalability", label: "Roadmap & Escala", icon: CalendarRange }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition text-left cursor-pointer ${
                  isActive 
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 font-semibold" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Pane */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-850 rounded-xl p-6 min-h-[500px]" id="tab-pane-container">
          
          {/* TAB 1: OVERVIEW & REQUIREMENTS */}
          {activeTab === "overview" && (
            <div className="space-y-6" id="overview-tab-pane">
              {/* Problem Statement Card */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Definição do Problema & Público-Alvo
                </h3>
                <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {spec.problemDefinition.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wide text-slate-400 mb-2">
                        Público-Alvo Selecionado:
                      </h4>
                      <ul className="space-y-1.5">
                        {spec.problemDefinition.targetAudience.map((audience, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-amber-500 font-mono">•</span>
                            {audience}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wide text-slate-400 mb-2">
                        Dores & Gargalos Identificados:
                      </h4>
                      <ul className="space-y-1.5">
                        {spec.problemDefinition.painPoints.map((pain, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-rose-500 font-mono">•</span>
                            {pain}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Requirements */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3">
                  Requisitos Funcionais (RF)
                </h3>
                <div className="overflow-x-auto bg-slate-950 border border-slate-850 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-850">
                      <tr>
                        <th className="p-3 w-16 font-mono">ID</th>
                        <th className="p-3 w-40 font-semibold">Nome</th>
                        <th className="p-3">Descrição Detalhada</th>
                        <th className="p-3 w-24 text-center font-semibold">Prioridade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50 text-slate-300">
                      {spec.requirements.functional.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/30">
                          <td className="p-3 font-mono font-bold text-amber-500">{req.id}</td>
                          <td className="p-3 font-semibold text-slate-200">{req.name}</td>
                          <td className="p-3 leading-relaxed">{req.description}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.priority.toLowerCase() === "alta" 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                : req.priority.toLowerCase() === "média"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {req.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Non-Functional Requirements */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3">
                  Requisitos Não-Funcionais (RNF)
                </h3>
                <div className="overflow-x-auto bg-slate-950 border border-slate-850 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-850">
                      <tr>
                        <th className="p-3 w-16 font-mono">ID</th>
                        <th className="p-3 w-40 font-semibold">Categoria / Nome</th>
                        <th className="p-3">Critério de Aceitação / Descrição</th>
                        <th className="p-3 w-24 text-center font-semibold">Prioridade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/50 text-slate-300">
                      {spec.requirements.nonFunctional.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-900/30">
                          <td className="p-3 font-mono font-bold text-amber-500">{req.id}</td>
                          <td className="p-3 font-semibold text-slate-200">{req.name}</td>
                          <td className="p-3 leading-relaxed">{req.description}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.priority.toLowerCase() === "alta" 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                                : req.priority.toLowerCase() === "média"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}>
                              {req.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & TECH STACK */}
          {activeTab === "architecture" && (
            <div className="space-y-6" id="architecture-tab-pane">
              {/* Proposal & Pattern Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-slate-950 border border-slate-850 p-5 rounded-xl">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Proposta Arquitetural Geral</h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{spec.architecture.proposal}</p>
                </div>
                <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-955 border border-amber-500/20 p-5 rounded-xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Modelo Selecionado</h4>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/35 rounded-full text-amber-400 font-mono text-xs font-bold uppercase">
                      {spec.architecture.pattern}
                    </span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-850">
                    <h5 className="text-[10px] font-mono uppercase text-slate-500 mb-1">Justificativa de Design:</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">"{spec.architecture.justification}"</p>
                  </div>
                </div>
              </div>

              {/* Component Graph / Architecture Components List */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Módulos e Componentes Principais do Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {spec.architecture.coreComponents.map((comp, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-slate-200">{comp.name}</h4>
                          <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                            {comp.technology}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{comp.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Grid */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3">
                  Pilha Tecnológica Recomendada (Tech Stack)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spec.techStack.map((tech, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-slate-900 border border-slate-800 text-amber-500 rounded-lg shrink-0 font-mono text-xs font-bold">
                        {tech.category.substring(0, 4).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-100">{tech.technology}</h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-900 text-slate-400 border border-slate-800 rounded">
                            v{tech.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          <strong className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Justificativa Técnica:</strong>
                          {tech.justification}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE DESIGN & TABLES */}
          {activeTab === "database" && (
            <div className="space-y-6" id="database-tab-pane">
              {/* DBMS Header */}
              <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">Gerenciador de Banco de Dados</h4>
                  <div className="flex items-center gap-2 text-lg font-bold text-amber-400">
                    <Database className="w-5 h-5 text-amber-500" />
                    {spec.database.type}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-400 mb-1">Estratégia de Persistência / Particionamento</h4>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{spec.database.strategy}"
                  </p>
                </div>
              </div>

              {/* Tables Modeler */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  Modelagem Física: Tabelas do Banco de Dados ({spec.database.tables.length})
                </h3>
                
                <div className="space-y-6">
                  {spec.database.tables.map((table) => (
                    <div key={table.name} className="border border-slate-850 bg-slate-950 rounded-xl overflow-hidden shadow-md">
                      {/* Table Banner Title */}
                      <div className="bg-slate-900 border-b border-slate-850 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-amber-500 shrink-0" />
                          <h4 className="text-xs font-mono font-bold text-slate-200">
                            tabela: <span className="text-amber-400">{table.name}</span>
                          </h4>
                        </div>
                        <p className="text-xs text-slate-400 italic font-sans">
                          {table.description}
                        </p>
                      </div>

                      {/* Columns table representation */}
                      <div className="p-4 overflow-x-auto">
                        <table className="w-full text-left text-[11px] font-mono">
                          <thead>
                            <tr className="text-slate-500 border-b border-slate-900 pb-2">
                              <th className="pb-2 w-32 font-semibold">Coluna</th>
                              <th className="pb-2 w-32 font-semibold">Tipo</th>
                              <th className="pb-2 font-semibold">Restrições / Constraints</th>
                              <th className="pb-2 w-28 text-center font-semibold">Chaves</th>
                              <th className="pb-2 w-36 font-semibold">Referências</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900 text-slate-300">
                            {table.columns.map((col, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/10">
                                <td className={`py-2 font-bold ${col.isPrimaryKey ? "text-amber-400" : "text-slate-300"}`}>
                                  {col.name}
                                </td>
                                <td className="py-2 text-slate-400">{col.type}</td>
                                <td className="py-2 text-slate-400 italic text-[10px]">{col.constraints || "—"}</td>
                                <td className="py-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {col.isPrimaryKey && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[8px] font-bold rounded uppercase">
                                        <KeyRound className="w-2.5 h-2.5" />
                                        PK
                                      </span>
                                    )}
                                    {col.isForeignKey && (
                                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[8px] font-bold rounded uppercase">
                                        <Link2 className="w-2.5 h-2.5" />
                                        FK
                                      </span>
                                    )}
                                    {!col.isPrimaryKey && !col.isForeignKey && <span className="text-slate-600">—</span>}
                                  </div>
                                </td>
                                <td className="py-2 text-[10px] text-blue-400 font-semibold">{col.references || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* SQL DDL Generator Drawer */}
                      <div className="border-t border-slate-900">
                        <button
                          onClick={() => toggleDDL(table.name)}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-900/50 hover:bg-slate-900 text-[10px] font-mono text-slate-400 tracking-wide transition outline-none cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <FileCode className="w-3.5 h-3.5 text-slate-500" />
                            {expandedDDL[table.name] ? "OCULTAR SCRIPT DDL SQL" : "VISUALIZAR SCRIPT DDL SQL COMPLETO"}
                          </span>
                          {expandedDDL[table.name] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        
                        {expandedDDL[table.name] && (
                          <div className="relative p-4 bg-slate-950 border-t border-slate-900 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                            <button
                              onClick={() => handleCopy(table.ddl, `ddl-${table.name}`)}
                              className="absolute top-3 right-3 p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer transition"
                            >
                              {copiedText[`ddl-${table.name}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedText[`ddl-${table.name}`] ? "Copiado!" : "Copiar"}
                            </button>
                            <pre className="pr-16 text-[10px] leading-tight select-all">{table.ddl}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SWAGGER REST APIS */}
          {activeTab === "apis" && (
            <div className="space-y-6" id="apis-tab-pane">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <Network className="w-4 h-4" />
                  Catálogo de APIs REST (Mini Swagger Documentation)
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  Clique em um endpoint para expandir parâmetros, schemas e códigos de status HTTP recomendados.
                </p>

                <div className="space-y-5">
                  {spec.apis.map((ctrl, i) => (
                    <div key={i} className="space-y-2 border border-slate-850 bg-slate-950 p-4 rounded-xl">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2 flex items-center justify-between">
                        <span>Controller: {ctrl.controller}</span>
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded font-normal lowercase tracking-normal">
                          {ctrl.endpoints.length} endpoints mapeados
                        </span>
                      </h4>

                      <div className="space-y-2">
                        {ctrl.endpoints.map((ep) => {
                          const isExpanded = expandedEndpoints[ep.path];
                          return (
                            <div key={ep.path} className="border border-slate-900 rounded-lg overflow-hidden">
                              {/* Endpoint Row Summary */}
                              <button
                                onClick={() => toggleEndpoint(ep.path)}
                                className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-left p-3 hover:bg-slate-900/40 transition cursor-pointer gap-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 border text-[9px] font-mono font-extrabold rounded w-16 text-center ${getMethodBg(ep.method)}`}>
                                    {ep.method.toUpperCase()}
                                  </span>
                                  <span className="text-xs font-mono font-semibold text-slate-200">{ep.path}</span>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                  <span className="text-[11px] text-slate-400 line-clamp-1">{ep.description}</span>
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                                </div>
                              </button>

                              {/* Expanded Swagger Specification Panel */}
                              {isExpanded && (
                                <div className="bg-slate-950 border-t border-slate-900 p-4 space-y-4">
                                  {/* Request/Response Body schemas */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Request Payload JSON */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-mono uppercase text-slate-400">Request Payload Schema (JSON)</span>
                                        {ep.requestBody && (
                                          <button
                                            onClick={() => handleCopy(ep.requestBody || "", `req-${ep.path}`)}
                                            className="text-[9px] font-mono text-amber-500 hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
                                          >
                                            {copiedText[`req-${ep.path}`] ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                                            Copiar
                                          </button>
                                        )}
                                      </div>
                                      <div className="bg-slate-900/50 border border-slate-900 rounded p-3 font-mono text-[10px] text-slate-300 overflow-x-auto">
                                        {ep.requestBody ? (
                                          <pre className="whitespace-pre-wrap select-all">{ep.requestBody}</pre>
                                        ) : (
                                          <span className="text-slate-600 italic">No request body required</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Response Payload JSON */}
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-mono uppercase text-slate-400">Response Payload Schema (JSON)</span>
                                        {ep.responseBody && (
                                          <button
                                            onClick={() => handleCopy(ep.responseBody || "", `res-${ep.path}`)}
                                            className="text-[9px] font-mono text-amber-500 hover:text-amber-400 transition flex items-center gap-1 cursor-pointer"
                                          >
                                            {copiedText[`res-${ep.path}`] ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                                            Copiar
                                          </button>
                                        )}
                                      </div>
                                      <div className="bg-slate-900/50 border border-slate-900 rounded p-3 font-mono text-[10px] text-slate-300 overflow-x-auto">
                                        {ep.responseBody ? (
                                          <pre className="whitespace-pre-wrap select-all">{ep.responseBody}</pre>
                                        ) : (
                                          <span className="text-slate-600 italic">No response body structure returned</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* HTTP Status codes table */}
                                  <div>
                                    <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">Códigos de Resposta HTTP Tratados</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                      {ep.statusCodes.map((status) => (
                                        <div key={status.code} className="flex items-center gap-2 bg-slate-900 border border-slate-900 px-3 py-2 rounded">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                                            status.code >= 200 && status.code < 300 
                                              ? "bg-emerald-500/10 text-emerald-400" 
                                              : "bg-rose-500/10 text-rose-400"
                                          }`}>
                                            {status.code}
                                          </span>
                                          <span className="text-[10px] text-slate-300 font-sans leading-tight">{status.description}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BEST PRACTICES & CLEAN CODE */}
          {activeTab === "best-practices" && (
            <div className="space-y-6" id="best-practices-tab-pane">
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  Práticas de Código, SOLID e Organização de Projetos
                </h3>
                <p className="text-xs text-slate-400 mb-5">
                  Recomendações técnicas estruturadas de boas práticas com exemplos de código limpo reais gerados especificamente para seu projeto.
                </p>

                <div className="space-y-6">
                  {spec.bestPractices.map((bp, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-5 rounded-xl space-y-4">
                      <div className="border-l-2 border-amber-500 pl-3">
                        <h4 className="text-xs font-mono uppercase font-bold text-slate-200">{bp.principle}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{bp.description}</p>
                      </div>

                      {/* Code Snippet Box */}
                      {bp.codeExample && (
                        <div className="border border-slate-900 rounded-lg overflow-hidden bg-slate-900/30">
                          {/* Code Bar Header */}
                          <div className="bg-slate-900 border-b border-slate-900 px-4 py-2.5 flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 font-semibold">{bp.codeExample.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 lowercase">{bp.codeExample.language}</span>
                              <button
                                onClick={() => handleCopy(bp.codeExample?.code || "", `code-${i}`)}
                                className="text-amber-500 hover:text-amber-400 transition flex items-center gap-1 cursor-pointer font-bold"
                              >
                                {copiedText[`code-${i}`] ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                {copiedText[`code-${i}`] ? "Copiado!" : "Copiar Código"}
                              </button>
                            </div>
                          </div>

                          {/* Code Lines and Canvas */}
                          <div className="p-4 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed select-all">
                            <pre>{bp.codeExample.code}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & DEVOPS CLOUD */}
          {activeTab === "security-devops" && (
            <div className="space-y-6" id="security-devops-tab-pane">
              {/* Cloud Architecture Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">Provedor Cloud Recomendado</h4>
                    <p className="text-xs text-slate-200 mt-1 font-bold">{spec.deployment.cloudProvider}</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">Esteira CI/CD Integrada</h4>
                    <p className="text-xs text-slate-200 mt-1 font-semibold leading-tight">{spec.deployment.cicd}</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                  <FileCode className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-mono uppercase text-slate-400 font-semibold">Infraestrutura como Código</h4>
                    <p className="text-xs text-slate-200 mt-1 font-semibold leading-tight">{spec.deployment.infraAsCode}</p>
                  </div>
                </div>
              </div>

              {/* Deployment Steps Timeline */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4" />
                  Plano e Fluxo de Deploy Automatizado (Etapas)
                </h3>
                <div className="relative border-l border-slate-800 ml-3 pl-6 space-y-5" id="deploy-timeline">
                  {spec.deployment.stepByStep.map((step, index) => (
                    <div key={index} className="relative">
                      {/* Circle indicator */}
                      <span className="absolute -left-9 top-1 w-5 h-5 bg-slate-950 border border-amber-500 text-[10px] font-mono font-bold flex items-center justify-center rounded-full text-amber-500">
                        {index + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans pt-0.5">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Strategies */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  Estratégia de Segurança de Informação & LGPD
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold border-b border-slate-900 pb-1.5">
                      Autenticação (AuthN)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed leading-relaxed">{spec.security.authentication}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold border-b border-slate-900 pb-1.5">
                      Autorização (AuthZ)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed leading-relaxed">{spec.security.authorization}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <h4 className="text-xs font-mono uppercase text-slate-400 mb-2 font-semibold border-b border-slate-900 pb-1.5">
                      Proteção LGPD / GDPR
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed leading-relaxed">{spec.security.dataProtection}</p>
                  </div>
                </div>
              </div>

              {/* Security Interactive Checklist */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4" />
                  Checklist de Auditoria de Segurança Crítica
                </h3>
                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl divide-y divide-slate-900">
                  {spec.security.checklist.map((item, i) => (
                    <label
                      key={i}
                      onClick={() => toggleSecurityCheck(i)}
                      className="flex items-start gap-3 py-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={!!securityChecked[i]}
                        readOnly
                        className="mt-0.5 accent-amber-500 rounded text-slate-950 outline-none w-3.5 h-3.5 shrink-0"
                      />
                      <span className={`text-xs text-slate-300 group-hover:text-slate-150 transition ${
                        securityChecked[i] ? "line-through text-slate-500" : ""
                      }`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ROADMAP & FUTURE SCALABILITY */}
          {activeTab === "roadmap-scalability" && (
            <div className="space-y-6" id="roadmap-tab-pane">
              {/* Gantt / Step Roadmaps */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-4 flex items-center gap-1.5">
                  <CalendarRange className="w-4 h-4" />
                  Cronograma de Desenvolvimento (Roadmap de Implementação)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spec.roadmap.map((phase) => (
                    <div key={phase.phase} className="border border-slate-850 bg-slate-950 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        {/* Phase Header */}
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
                          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wide">
                            {phase.phase}
                          </span>
                          <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                            {phase.duration}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mb-3">{phase.title}</h4>
                        
                        {/* Tasks */}
                        <ul className="space-y-2">
                          {phase.tasks.map((task, idx) => (
                            <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                              <span className="text-slate-600 font-mono select-none">[{idx + 1}]</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Scalability Recommendations */}
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-500 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Evolução do Sistema, Escalabilidade e Resiliência Futura
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {spec.scalabilitySuggestions.map((sug, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-900">
                          <h4 className="text-xs font-bold text-slate-200">{sug.title}</h4>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                            sug.type.toLowerCase() === "performance"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : sug.type.toLowerCase() === "resilience"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}>
                            {sug.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed leading-relaxed">{sug.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RENDER DETAILED PROSE SUMMARY AT THE BOTTOM OF ANY TAB */}
          <div className="mt-8 pt-6 border-t border-slate-850 bg-slate-950/40 p-5 rounded-xl border border-slate-850">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              PARECER DE ENGENHARIA DO ARQUITETO
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap italic">
              {spec.rawArchitectReply}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
