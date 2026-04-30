
import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import * as dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import admin from 'firebase-admin';
import path from 'path';

// Carrega variáveis do .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Inicializa Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

// Inicializa Gemini - Usando o padrão do projeto
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
    console.log('SCAN THE QR CODE TO LOG IN');
});

client.on('ready', () => {
    console.log('FINANZA BOT IS READY!');
});

client.on('message', async (msg: any) => {
    const text = msg.body;

    if (text.length < 5) return;

    console.log(`Mensagem recebida: "${text}"`);

    try {
        const model = 'gemini-1.5-flash-latest';
        
        const systemInstruction = `Você é um processador de dados financeiros para o sistema Finanza. 
        Sua tarefa é converter frases em linguagem natural em objetos JSON de transação.
        Sempre identifique:
        1. description (nome do gasto/ganho)
        2. amount (number)
        3. type (INCOME ou EXPENSE)
        4. category (tente classificar em: Alimentação, Transporte, Lazer, Saúde, Salário, Outros)
        5. date (Formato AAAA-MM-DD. Se não houver data, use a data de hoje: ${new Date().toISOString().split('T')[0]})

        Responda APENAS o JSON.`;

        const result = await ai.models.generateContent({
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

        const data = JSON.parse(result.text || '{}');

        if (data.amount && data.description) {
            await db.collection('transactions').add({
                ...data,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                paid: true
            });

            msg.reply(`✅ *Finanza:* Lançamento registrado!
📝 *${data.description}*
💰 *R$ ${data.amount.toLocaleString('pt-BR')}*
📂 *${data.category}*
📅 *${data.date}*`);
        }
    } catch (error) {
        console.error('Erro ao processar:', error);
        msg.reply('❌ Desculpe, não consegui entender esse lançamento. Tente ser mais específico.');
    }
});

client.initialize();
