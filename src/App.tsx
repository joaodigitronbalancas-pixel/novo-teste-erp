import React, { useState, useEffect } from "react";
import FormPanel from "./components/FormPanel";
import DashboardView from "./components/DashboardView";
import ArchitectChat from "./components/ArchitectChat";
import { ArchitectureSpecification } from "./types";
import { generateOfflineSpecification } from "./utils/mockGenerator";
import { MessageSquare, Bot, Sparkles, Terminal, Activity, ChevronRight, ShieldAlert, Cpu } from "lucide-react";

export default function App() {
  const [activeSpec, setActiveSpec] = useState<ArchitectureSpecification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lastFormData, setLastFormData] = useState<any | null>(null);
  
  // Interactive loading state labels
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingSteps = [
    "Analisando requisitos funcionais e escopo...",
    "Selecionando padrão arquitetural otimizado...",
    "Mapeando stack de tecnologias e versões...",
    "Modelando tabelas físicas e chaves do banco de dados...",
    "Projetando contratos de API REST (Swagger)...",
    "Estruturando plano de segurança e conformidade LGPD...",
    "Configurando esteira de deploy automático e CI/CD...",
    "Escrevendo exemplos de código-fonte SOLID...",
    "Formatando especificações finais de engenharia..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async (formData: {
    projectName: string;
    systemType: string;
    problemGoal: string;
    audience: string;
    scale: string;
    preferredTech: string;
    customInstructions: string;
  }) => {
    setIsLoading(true);
    setErrorMsg(null);
    setActiveSpec(null);
    setIsChatOpen(false);
    setIsDemoMode(false);
    setLastFormData(formData);

    try {
      const response = await fetch("/api/architect/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Houve um problema de processamento nos servidores.");
      }

      const data: ArchitectureSpecification = await response.json();
      setActiveSpec(data);
      // Automatically open the side architect chat after generating to guide the user!
      setIsChatOpen(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Erro de conexão ao tentar gerar a arquitetura.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineGenerate = () => {
    if (!lastFormData) return;
    setIsLoading(true);
    setErrorMsg(null);
    setIsDemoMode(true);
    
    // Simulate beautiful step-by-step loading for premium feel
    setTimeout(() => {
      const localSpec = generateOfflineSpecification(lastFormData);
      setActiveSpec(localSpec);
      setIsLoading(false);
      setIsChatOpen(true);
    }, 1800);
  };

  const handleBack = () => {
    if (window.confirm("Deseja voltar ao formulário? A arquitetura atual gerada será descartada.")) {
      setActiveSpec(null);
      setIsChatOpen(false);
      setIsDemoMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Global Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl text-slate-950 shadow-md shadow-amber-500/10">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold text-amber-500 tracking-widest block uppercase leading-none mb-1">
                SISTEMAS PROFISSIONAIS
              </span>
              <h1 className="text-sm font-bold tracking-tight text-slate-100 leading-none">
                Arquiteto de Software Sênior
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
            <span>REGIME: SÊNIOR / TECH LEAD</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              CORE PRONTO
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center">
        
        {/* State 1: Error Display */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto w-full mb-6 p-5 rounded-xl bg-slate-900 border border-rose-500/30 text-rose-300 flex items-start gap-4 shadow-xl shadow-rose-500/5">
            <ShieldAlert className="w-6 h-6 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm font-mono uppercase tracking-wider text-rose-400">Instabilidade de Conexão ou Credencial</h4>
              <p className="text-xs mt-2 leading-relaxed whitespace-pre-wrap text-slate-300">{errorMsg}</p>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <button 
                  onClick={() => setErrorMsg(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  Tentar novamente
                </button>
                {lastFormData && (
                  <button 
                    onClick={handleOfflineGenerate}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-amber-500/15"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ativar Modo de Demonstração (Sem Chave)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}


        {/* State 2: Active Form View */}
        {!activeSpec && !isLoading && (
          <FormPanel onGenerate={handleGenerate} isLoading={isLoading} />
        )}

        {/* State 3: Active Loading Steps Screen */}
        {isLoading && (
          <div className="max-w-md mx-auto w-full text-center py-12" id="loading-canvas">
            <div className="relative inline-block mb-6">
              <div className="w-16 h-16 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-6 h-6 text-amber-500 animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-200">
              Projetando Engenharia de Sistemas
            </h3>
            
            <p className="text-xs text-slate-400 mt-2 min-h-8 max-w-sm mx-auto flex items-center justify-center gap-2">
              <Activity className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
              {loadingSteps[loadingStep]}
            </p>

            {/* Visual Steps Tracker */}
            <div className="mt-8 space-y-2 bg-slate-900/40 p-4 border border-slate-900 rounded-xl text-left">
              {loadingSteps.map((step, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center gap-2 text-[10px] font-mono transition-all duration-300 ${
                    idx < loadingStep 
                      ? "text-emerald-400" 
                      : idx === loadingStep 
                      ? "text-amber-400 font-bold translate-x-1" 
                      : "text-slate-600"
                  }`}
                >
                  <ChevronRight className="w-3 h-3" />
                  <span>{step}</span>
                  {idx < loadingStep && <span className="ml-auto text-[9px] font-semibold text-emerald-500">concluído</span>}
                  {idx === loadingStep && <span className="ml-auto text-[9px] font-semibold text-amber-500 animate-pulse">executando...</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State 4: Specification Dashboard and Copilot chat */}
        {activeSpec && !isLoading && (
          <div className="flex-1 flex flex-col h-full" id="active-dashboard-view">
            <DashboardView 
              spec={activeSpec} 
              onBack={handleBack} 
              onUpdateSpec={setActiveSpec} 
            />
            
            {/* Floating button to toggle the Copilot panel */}
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="fixed bottom-6 right-6 px-4 py-3 bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-full shadow-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 z-40 cursor-pointer"
              id="chat-toggle-floating-button"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Co-pilot Arquiteto</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </button>

            {/* Slide-out Sidebar for dynamic system refinements */}
            <ArchitectChat 
              currentSpec={activeSpec} 
              onUpdateSpec={setActiveSpec} 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
              isDemoMode={isDemoMode}
            />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Arquiteto de Software Sênior - Especificações de Nível de Produção</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              CLEAN CODE & SOLID
            </span>
            <span className="text-slate-800">•</span>
            <span>MODELO GENERALISTA GEMINI 3.5</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
