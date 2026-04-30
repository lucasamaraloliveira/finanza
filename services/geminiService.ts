
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Budget, Category, TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export const getFinancialAdvice = async (transactions: Transaction[], budgets: Budget[], question?: string) => {
  const model = 'gemini-3-flash-preview';
  const transactionsContext = transactions.slice(0, 50).map(t => `${t.date}: ${t.description} (${t.category}) - R$ ${t.amount} [${t.type}]`).join('\n');

  const systemInstruction = `Você é o Consultor Chefe da Finanza. Ajude a família a economizar. 
  Analise os dados e dê conselhos práticos de economia doméstica. 
  Responda sempre em Markdown.`;

  const prompt = question
    ? `Dúvida do morador: ${question}\n\nResumo: ${transactionsContext}`
    : `Dê um feedback geral sobre a saúde financeira desta casa baseada nestes gastos:\n${transactionsContext}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction, temperature: 0.7 }
    });
    // The .text property is used correctly here.
    return response.text || "Sem conselhos disponíveis.";
  } catch (error) {
    return "Erro ao consultar IA.";
  }
};

export const scanReceipt = async (base64Image: string) => {
  const model = 'gemini-2.5-flash-image';
  const prompt = "Analise este recibo/nota fiscal e extraia: 1. Nome do estabelecimento (Descrição), 2. Valor Total (Número), 3. Data (AAAA-MM-DD), 4. Sugestão de Categoria Financeira (Supermercado, Saúde, Lazer, etc). Responda apenas o JSON.";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["description", "amount", "date", "category"]
        }
      }
    });
    // Accessing .text as a property is correct.
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Scan error", error);
    return null;
  }
};

export const getFinancialHealthScore = async (transactions: Transaction[]) => {
  const model = 'gemini-3.1-flash-lite-preview';
  const data = transactions.slice(0, 100).map(t => `${t.amount} ${t.type} ${t.category}`).join('|');
  const prompt = `Baseado nestes dados financeiros, dê uma nota de 0 a 100 para a saúde financeira desta casa e uma justificativa curta. Responda JSON: {score: number, message: string}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    // Accessing .text as a property is correct.
    return JSON.parse(response.text || '{"score": 50, "message": "Dados insuficientes"}');
  } catch (error) {
    return { score: 0, message: "Erro na análise" };
  }
};
export const askFinanzito = async (
  question: string, 
  data: { 
    transactions: Transaction[], 
    budgets: Budget[], 
    goals: any[], 
    cards: any[], 
    vouchers: any[] 
  }
) => {
  const model = 'gemini-3.1-flash-lite-preview';
  
  const context = `
    Contexto Financeiro Atual:
    - Transações (recentes): ${JSON.stringify(data.transactions.slice(0, 30))}
    - Orçamentos: ${JSON.stringify(data.budgets)}
    - Metas (Meta): ${JSON.stringify(data.goals)}
    - Contas/Cartões: ${JSON.stringify(data.cards)}
    - VA/VR: ${JSON.stringify(data.vouchers)}
  `;

  const systemInstruction = `Você é o Finanzito, o mascote inteligente do sistema Finanza. 
  Você é amigável, direto e tem pleno conhecimento de todos os dados do usuário.
  Sua missão é responder qualquer dúvida sobre o sistema ou sobre a vida financeira do usuário baseando-se nos dados fornecidos.
  Seja empático e dê dicas práticas. Responda de forma concisa em Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Dúvida do usuário: ${question}\n\n${context}`,
      config: { systemInstruction, temperature: 0.8 }
    });
    return response.text || "Desculpe, não consegui processar sua dúvida.";
  } catch (error) {
    console.error("Finanzito error", error);
    return "Estou com um pouco de dor de cabeça agora, pode perguntar de novo?";
  }
};
export const parseTransactionFromText = async (text: string) => {
  const model = 'gemini-3.1-flash-lite-preview';
  
  const systemInstruction = `Você é um processador de dados financeiros. 
  Sua tarefa é converter frases em linguagem natural em objetos JSON de transação.
  Sempre identifique:
  1. Descrição (nome do gasto/ganho)
  2. Valor (number)
  3. Tipo (INCOME ou EXPENSE)
  4. Categoria (tente classificar em: Alimentação, Transporte, Lazer, Saúde, Salário, Outros)
  5. Data (Formato AAAA-MM-DD. Se não houver data, use a data de hoje: ${new Date().toISOString().split('T')[0]})

  Responda APENAS o JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: text,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ["INCOME", "EXPENSE"] },
            category: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["description", "amount", "type", "category", "date"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Parse error", error);
    return null;
  }
};
