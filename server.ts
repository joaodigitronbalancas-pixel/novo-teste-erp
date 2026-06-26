import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy init helper for Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("A chave GEMINI_API_KEY não foi configurada. Por favor, adicione-a em Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Format Gemini API errors to provide beautiful, actionable guidance to the user.
function formatGeminiError(error: any): string {
  const msg = error?.message || "";
  const status = error?.status || "";
  const errStr = typeof error === "object" ? JSON.stringify(error) : String(error);

  if (
    msg.includes("denied access") ||
    errStr.includes("denied access") ||
    msg.includes("PERMISSION_DENIED") ||
    errStr.includes("PERMISSION_DENIED") ||
    status === "PERMISSION_DENIED" ||
    error?.code === 403
  ) {
    return "Sua chave de API do Gemini (ou o projeto Google Cloud associado a ela) teve o acesso recusado pela Google (Erro 403 PERMISSION_DENIED: 'Your project has been denied access'). \n\nPara solucionar:\n1. Acesse o menu de Configurações (ícone de engrenagem no canto superior direito).\n2. Verifique se o valor de 'GEMINI_API_KEY' está correto e ativo.\n3. Se necessário, crie uma nova chave de API no Google AI Studio (https://aistudio.google.com/) em outra conta/projeto Google Cloud e atualize-a nas Configurações.";
  }

  return error?.message || "Erro inesperado ao processar solicitação no modelo Gemini. Por favor, tente novamente.";
}

// 1. Definition of the Architecture Schema for JSON structure
const architectureSchema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING },
    systemType: { type: Type.STRING },
    scale: { type: Type.STRING },
    problemDefinition: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        targetAudience: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["description", "painPoints", "targetAudience"]
    },
    requirements: {
      type: Type.OBJECT,
      properties: {
        functional: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING } // 'Alta' | 'Média' | 'Baixa'
            },
            required: ["id", "name", "description", "priority"]
          }
        },
        nonFunctional: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING } // 'Alta' | 'Média' | 'Baixa'
            },
            required: ["id", "name", "description", "priority"]
          }
        }
      },
      required: ["functional", "nonFunctional"]
    },
    architecture: {
      type: Type.OBJECT,
      properties: {
        proposal: { type: Type.STRING },
        pattern: { type: Type.STRING },
        justification: { type: Type.STRING },
        coreComponents: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              role: { type: Type.STRING },
              technology: { type: Type.STRING }
            },
            required: ["name", "role", "technology"]
          }
        }
      },
      required: ["proposal", "pattern", "justification", "coreComponents"]
    },
    techStack: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          technology: { type: Type.STRING },
          justification: { type: Type.STRING },
          version: { type: Type.STRING }
        },
        required: ["category", "technology", "justification", "version"]
      }
    },
    database: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING },
        strategy: { type: Type.STRING },
        tables: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              columns: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    constraints: { type: Type.STRING },
                    isPrimaryKey: { type: Type.BOOLEAN },
                    isForeignKey: { type: Type.BOOLEAN },
                    references: { type: Type.STRING }
                  },
                  required: ["name", "type", "constraints", "isPrimaryKey", "isForeignKey"]
                }
              },
              ddl: { type: Type.STRING }
            },
            required: ["name", "description", "columns", "ddl"]
          }
        }
      },
      required: ["type", "strategy", "tables"]
    },
    apis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          controller: { type: Type.STRING },
          endpoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                method: { type: Type.STRING },
                path: { type: Type.STRING },
                description: { type: Type.STRING },
                requestBody: { type: Type.STRING }, // JSON/Text format or explanation
                responseBody: { type: Type.STRING }, // JSON format or explanation
                statusCodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      code: { type: Type.INTEGER },
                      description: { type: Type.STRING }
                    },
                    required: ["code", "description"]
                  }
                }
              },
              required: ["method", "path", "description", "statusCodes"]
            }
          }
        },
        required: ["controller", "endpoints"]
      }
    },
    bestPractices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          principle: { type: Type.STRING },
          description: { type: Type.STRING },
          codeExample: {
            type: Type.OBJECT,
            properties: {
              language: { type: Type.STRING },
              title: { type: Type.STRING },
              code: { type: Type.STRING }
            },
            required: ["language", "title", "code"]
          }
        },
        required: ["principle", "description"]
      }
    },
    security: {
      type: Type.OBJECT,
      properties: {
        authentication: { type: Type.STRING },
        authorization: { type: Type.STRING },
        dataProtection: { type: Type.STRING },
        checklist: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["authentication", "authorization", "dataProtection", "checklist"]
    },
    deployment: {
      type: Type.OBJECT,
      properties: {
        cicd: { type: Type.STRING },
        cloudProvider: { type: Type.STRING },
        infraAsCode: { type: Type.STRING },
        stepByStep: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["cicd", "cloudProvider", "infraAsCode", "stepByStep"]
    },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          phase: { type: Type.STRING },
          title: { type: Type.STRING },
          duration: { type: Type.STRING },
          tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["phase", "title", "duration", "tasks"]
      }
    },
    scalabilitySuggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING } // 'Performance' | 'Resilience' | 'Operations'
        },
        required: ["title", "description", "type"]
      }
    },
    rawArchitectReply: { type: Type.STRING, description: "A comprehensive, high-level prose explanation of the overall design in Brazilian Portuguese" }
  },
  required: [
    "projectName", "systemType", "scale", "problemDefinition", "requirements",
    "architecture", "techStack", "database", "apis", "bestPractices", "security",
    "deployment", "roadmap", "scalabilitySuggestions", "rawArchitectReply"
  ]
};

// API Endpoint to generate architecture
app.post("/api/architect/generate", async (req, res) => {
  try {
    const { systemType, projectName, problemGoal, audience, scale, preferredTech, customInstructions } = req.body;

    if (!systemType || !projectName || !problemGoal) {
      return res.status(400).json({ error: "Parâmetros obrigatórios ausentes: Tipo de sistema, Nome do sistema e Objetivo." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é um Arquiteto de Software Sênior, Líder Técnico e Engenheiro de Sistemas de Elite.
Sua missão é projetar especificações de sistemas profissionais com profundidade extrema, precisão e realismo técnico.
Sempre retorne respostas detalhadas, aplicadas e realistas, evitando explicações abstratas ou genéricas.

Você deve responder em Português do Brasil de forma extremamente formal e estruturada técnica.
Siga os requisitos e especificações de escala solicitados pelo usuário, considerando se o sistema é pequeno, médio ou de grande escala.
Adote as melhores tecnologias modernas de mercado caso o usuário não tenha restrições, ou use as tecnologias preferidas indicadas.`;

    const prompt = `Projete a especificação e arquitetura completa do sistema de software profissional abaixo:

- **Nome do Projeto**: ${projectName}
- **Tipo de Sistema**: ${systemType}
- **Objetivo Principal / Problema**: ${problemGoal}
- **Público-alvo**: ${audience || "Não especificado"}
- **Escala de Usuários Esperada**: ${scale || "Não especificada"}
- **Tecnologias Preferidas / Restrições**: ${preferredTech || "Sem preferências"}
- **Instruções Adicionais**: ${customInstructions || "Nenhuma"}

Gere uma especificação técnica abrangente e detalhada cobrindo todos os pontos arquiteturais estruturados conforme o esquema de saída. 
Escreva os códigos DDL SQL completos no campo 'database.tables[].ddl', e forneça implementações realistas de trechos de código em Clean Code/SOLID no campo 'bestPractices[].codeExample.code'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: architectureSchema,
        temperature: 0.1, // Low temperature for high architectural rigor and structure consistency
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Nenhum conteúdo foi retornado pelo modelo Gemini.");
    }

    const parsedJson = JSON.parse(text);
    return res.json(parsedJson);

  } catch (error: any) {
    console.error("Erro na geração de arquitetura:", error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
});

// API Endpoint to carry out conversational architectural edits/chat
app.post("/api/architect/chat", async (req, res) => {
  try {
    const { history, currentArchitecture, newMessage } = req.body;

    if (!newMessage) {
      return res.status(400).json({ error: "Mensagem vazia." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Você é um Arquiteto de Software Sênior, Líder Técnico e Engenheiro de Sistemas de Elite.
O usuário está revisando o plano de arquitetura gerado. Responda de forma extremamente técnica, prestativa e detalhada em Português do Brasil.

O usuário pode fazer perguntas sobre a arquitetura OU solicitar alterações diretas na arquitetura (ex: "adicione suporte a OAuth", "mude o banco para DynamoDB", "adicione tabelas para planos de assinatura").
Sua tarefa é responder à dúvida do usuário e, se alterações na arquitetura foram solicitadas ou são necessárias para acomodar o pedido, gerar uma versão ATUALIZADA e CORRIGIDA da arquitetura JSON que reflita exatamente essas mudanças.

Você deve retornar um objeto JSON contendo:
1. 'assistantReply' (string): Sua resposta conversacional em português explicando os conceitos, justificando suas escolhas e detalhando o que foi alterado.
2. 'updatedArchitecture' (objeto opcional, correspondendo ao mesmo esquema da arquitetura inicial): O modelo completo da arquitetura de sistema, contendo todas as seções (Requirements, Tech Stack, Database, APIs, Roadmap, etc.) devidamente ajustado com as novas tabelas, novas APIs, novas ferramentas, conforme o pedido do usuário. Se o usuário apenas fez uma pergunta sem pedir modificações na arquitetura em si, retorne o mesmo objeto arquitetural original inalterado.`;

    const contents: any[] = [];
    
    // Add history
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    // Add current state and user's new request
    const contextPrompt = `Aqui está a ARQUITETURA ATUAL do sistema que estamos projetando:
${JSON.stringify(currentArchitecture, null, 2)}

Solicitação do Usuário: "${newMessage}"

Por favor, analise a solicitação, responda à dúvida e gere a arquitetura completa atualizada de acordo com o esquema de saída abaixo. Se a solicitação exige mudanças estruturais na especificação (como novos requisitos, novas tecnologias na stack, novas tabelas ou relacionamentos no banco, novas APIs, etc.), faça essas alterações no objeto arquitetural que você retornará no campo 'updatedArchitecture'. Se nenhuma mudança estrutural for necessária, retorne a arquitetura atual inalterada no campo 'updatedArchitecture'.`;

    contents.push({
      role: "user",
      parts: [{ text: contextPrompt }]
    });

    const chatSchema = {
      type: Type.OBJECT,
      properties: {
        assistantReply: { type: Type.STRING },
        updatedArchitecture: architectureSchema
      },
      required: ["assistantReply", "updatedArchitecture"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: chatSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Nenhuma resposta foi retornada pelo modelo Gemini.");
    }

    const parsedJson = JSON.parse(text);
    return res.json(parsedJson);

  } catch (error: any) {
    console.error("Erro no chat do arquiteto:", error);
    return res.status(500).json({
      error: formatGeminiError(error),
    });
  }
});

// Setup Vite or Static serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files in production from dist/");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
