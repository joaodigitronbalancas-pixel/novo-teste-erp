import React, { useState } from "react";
import { PresetTemplate, ARCHITECTURE_PRESETS } from "../presets";
import { Sparkles, Terminal, Settings2, Users, Layers, ShieldCheck, Database } from "lucide-react";

interface FormPanelProps {
  onGenerate: (data: {
    projectName: string;
    systemType: string;
    problemGoal: string;
    audience: string;
    scale: string;
    preferredTech: string;
    customInstructions: string;
  }) => void;
  isLoading: boolean;
}

export default function FormPanel({ onGenerate, isLoading }: FormPanelProps) {
  const [formData, setFormData] = useState({
    projectName: "",
    systemType: "SaaS (Software as a Service)",
    problemGoal: "",
    audience: "",
    scale: "",
    preferredTech: "",
    customInstructions: "",
  });

  const handleLoadPreset = (preset: PresetTemplate) => {
    setFormData({
      projectName: preset.projectName,
      systemType: preset.systemType,
      problemGoal: preset.problemGoal,
      audience: preset.audience,
      scale: preset.scale,
      preferredTech: preset.preferredTech,
      customInstructions: preset.customInstructions,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName || !formData.problemGoal) return;
    onGenerate(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto" id="form-panel-container">
      {/* Introduction Banner */}
      <div className="text-center mb-8" id="intro-header">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-mono mb-4">
          <Terminal className="w-3.5 h-3.5" />
          SISTEMA DE MODELAGEM ARQUITETURAL IA
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Especifique Seu Novo Sistema
        </h1>
        <p className="mt-3 text-base text-slate-400 max-w-2xl mx-auto">
          Atue em parceria com um Co-pilot Arquiteto de Software Sênior para estruturar requisitos, banco de dados, fluxos de API, DevOps e segurança.
        </p>
      </div>

      {/* Quick Presets Selection */}
      <div className="mb-8" id="presets-section">
        <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Settings2 className="w-3.5 h-3.5" />
          Modelos de Início Rápido (Selecione para preencher)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {ARCHITECTURE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              disabled={isLoading}
              className="flex flex-col text-left p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300 transition">
                {preset.name}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                {preset.problemGoal}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden" id="form-card">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div>
              <label htmlFor="projectName" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Nome do Projeto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                required
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Ex: TenantFlow, MegaCart, PayCore"
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 text-sm outline-none transition"
              />
            </div>

            {/* System Type */}
            <div>
              <label htmlFor="systemType" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Tipo de Sistema
              </label>
              <select
                id="systemType"
                name="systemType"
                value={formData.systemType}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 rounded-lg px-4 py-3 text-sm outline-none transition"
              >
                <option value="SaaS (Software as a Service)">SaaS (Software as a Service)</option>
                <option value="E-Commerce / Marketplace">E-Commerce / Marketplace</option>
                <option value="API RESTful / Gateway de Integração">API RESTful / Gateway de Integração</option>
                <option value="ERP / Sistema de Gestão Corporativo">ERP / Sistema de Gestão Corporativo</option>
                <option value="Aplicativo Mobile com Backend Dedicado">Aplicativo Mobile com Backend Dedicado</option>
                <option value="Plataforma de IoT / Coleta de Telemetria">Plataforma de IoT / Coleta de Telemetria</option>
                <option value="Sistemas Distribuídos de Alta Latência / Web3">Sistemas Distribuídos / Web3</option>
              </select>
            </div>
          </div>

          {/* Goal & Description */}
          <div>
            <label htmlFor="problemGoal" className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Objetivo Principal & Problema a Resolver <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problemGoal"
              name="problemGoal"
              required
              rows={4}
              value={formData.problemGoal}
              onChange={handleChange}
              placeholder="Descreva em detalhes o que o sistema faz, quais problemas ele resolve e quais recursos principais são esperados."
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 text-sm outline-none transition resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Audience */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users className="w-4 h-4 text-slate-400" />
                <label htmlFor="audience" className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Público-Alvo
                </label>
              </div>
              <input
                type="text"
                id="audience"
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                placeholder="Ex: Gestores de TI, Clientes finais, Operadores locais"
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 text-sm outline-none transition"
              />
            </div>

            {/* Scale */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <label htmlFor="scale" className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Escala & Concorrência Esperada
                </label>
              </div>
              <input
                type="text"
                id="scale"
                name="scale"
                value={formData.scale}
                onChange={handleChange}
                placeholder="Ex: 5.000 acessos simultâneos em picos, 10M registros"
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 text-sm outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Technologies */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Database className="w-4 h-4 text-slate-400" />
                <label htmlFor="preferredTech" className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Tecnologias Preferidas / Restrições (Opcional)
                </label>
              </div>
              <input
                type="text"
                id="preferredTech"
                name="preferredTech"
                value={formData.preferredTech}
                onChange={handleChange}
                placeholder="Ex: .NET Core, React, PostgreSQL (ou deixe vazio para recomendação)"
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 text-sm outline-none transition"
              />
            </div>

            {/* Custom / Regulatory Instructions */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <label htmlFor="customInstructions" className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Instruções Adicionais / Regulações LGPD
                </label>
              </div>
              <input
                type="text"
                id="customInstructions"
                name="customInstructions"
                value={formData.customInstructions}
                onChange={handleChange}
                placeholder="Ex: Seguir LGPD estritamente, usar criptografia de ponta a ponta"
                disabled={isLoading}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-200 placeholder-slate-500 rounded-lg px-4 py-3 text-sm outline-none transition"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end" id="submit-section">
            <button
              type="submit"
              disabled={isLoading || !formData.projectName || !formData.problemGoal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  Projetando Arquitetura... (Aguarde ~20s)
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Especificação Arquitetural
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
