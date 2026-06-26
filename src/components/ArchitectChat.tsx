import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ArchitectureSpecification } from "../types";
import { Send, Bot, User, Sparkles, MessageSquare, X, RefreshCw } from "lucide-react";
import { handleOfflineChatReply } from "../utils/mockGenerator";

interface ArchitectChatProps {
  currentSpec: ArchitectureSpecification;
  onUpdateSpec: (newSpec: ArchitectureSpecification) => void;
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
}

export default function ArchitectChat({ currentSpec, onUpdateSpec, isOpen, onClose, isDemoMode = false }: ArchitectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      text: `Olá! Eu sou o seu Engenheiro de Sistemas e Arquiteto Co-pilot. ${isDemoMode ? "\n\n⚠️ **[MODO DEMONSTRAÇÃO ATIVO]** Estou simulando offline devido à restrição de chave da API. Você ainda pode interagir e testar recursos!" : ""}

Análise técnica concluída para o projeto **${currentSpec.projectName}**! Você pode discutir ou refinar esta especificação comigo a qualquer momento.

**O que você pode me pedir:**
- *"Adicione suporte a login social com o Google na segurança."*
- *"Adicione uma tabela 'logs_auditoria' ao banco de dados."*
- *"Como posso melhorar a latência de leitura no catálogo de produtos?"*

Fale seu caso de uso, e eu atualizarei a especificação e o banco de dados dinamicamente!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const userMessageText = inputValue;
    setInputValue("");
    setIsSending(true);

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);

    // Handle offline/demo mode locally
    if (isDemoMode) {
      setTimeout(() => {
        const { assistantReply, updatedArchitecture } = handleOfflineChatReply(currentSpec, userMessageText);
        
        const modelMsgId = Date.now().toString();
        const newModelMsg: ChatMessage = {
          id: modelMsgId,
          role: "model",
          text: assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, newModelMsg]);

        if (updatedArchitecture) {
          onUpdateSpec(updatedArchitecture);
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: "model",
              text: `✨ **[SISTEMA - DEMO]** A especificação de dados e a arquitetura de **${updatedArchitecture.projectName}** foram re-modeladas offline!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
        setIsSending(false);
      }, 1200);
      return;
    }

    try {
      // Build conversation history in correct Gemini format
      const historyPayload = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text
      }));

      const response = await fetch("/api/architect/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: historyPayload,
          currentArchitecture: currentSpec,
          newMessage: userMessageText
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Falha ao enviar mensagem ao arquiteto.");
      }

      const data = await response.json();
      
      const assistantText = data.assistantReply;
      const updatedArch = data.updatedArchitecture;

      // Add Model Response Bubble
      const modelMsgId = (Date.now() + 1).toString();
      const newModelMsg: ChatMessage = {
        id: modelMsgId,
        role: "model",
        text: assistantText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newModelMsg]);

      // If architecture was structurally updated, apply changes
      if (updatedArch) {
        onUpdateSpec(updatedArch);
        
        // Notify the user visually in chat that the dashboard updated
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: "model",
            text: `✨ **[SISTEMA]** A especificação arquitetural, banco de dados e endpoints do projeto **${updatedArch.projectName}** foram re-calibrados e atualizados nos painéis vizinhos com sucesso!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }

    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "model",
          text: `⚠️ **[ERRO]** Desculpe, encontrei um erro ao processar sua solicitação técnica: ${error.message || "Tente novamente."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-y-0 right-0 w-full sm:w-112 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col h-full animate-in slide-in-from-right duration-250"
      id="architect-chat-sidebar"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1">
              Co-Pilot Arquiteto
              <Sparkles className="w-3 h-3 text-amber-400" />
            </h3>
            <p className="text-[10px] text-emerald-400 font-mono">
              {isDemoMode ? "● offline simulado (demo)" : "● online & analisando"}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>


      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/40 select-text" id="chat-messages-container">
        {messages.map((msg) => {
          const isModel = msg.role === "model";
          const isSystem = msg.text.includes("**[SISTEMA]**");
          const isError = msg.text.includes("**[ERRO]**");
          
          return (
            <div 
              key={msg.id} 
              className={`flex gap-2 w-full ${isModel ? "justify-start" : "justify-end"}`}
            >
              {isModel && (
                <div className="p-1 h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                isSystem 
                  ? "bg-amber-500/5 border border-amber-500/10 text-amber-300 w-full"
                  : isError
                  ? "bg-rose-500/10 border border-rose-500/10 text-rose-400 w-full"
                  : isModel 
                  ? "bg-slate-950 border border-slate-850 text-slate-200" 
                  : "bg-amber-500 text-slate-950 font-medium"
              }`}>
                <div className="whitespace-pre-wrap select-text">{msg.text}</div>
                <div className={`text-[9px] mt-1.5 text-right ${isModel ? "text-slate-500" : "text-slate-800"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {!isModel && (
                <div className="p-1 h-7 w-7 rounded-full bg-slate-850 border border-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-2 justify-start items-start animate-pulse">
            <div className="p-1 h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
              Re-calculando modelagem de sistemas... (Aguarde ~10s)
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Footer */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Refinar banco, adicionar OAuth, mudar padrão..."
          disabled={isSending}
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none placeholder-slate-500 transition"
        />
        <button
          type="submit"
          disabled={isSending || !inputValue.trim()}
          className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-lg cursor-pointer transition shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
