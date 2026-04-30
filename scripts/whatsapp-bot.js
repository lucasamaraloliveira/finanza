
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');
const { GoogleGenAI } = require("@google/genai");
const admin = require('firebase-admin');
const path = require('path');

// Carrega variáveis do .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Inicializa Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    console.log('--- FIREBASE INITIALIZED ---');
  } catch (err) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
    console.log('--- FIREBASE INITIALIZED (DEFAULT) ---');
  }
}

const db = admin.firestore();

// Inicializa Gemini
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERRO: NEXT_PUBLIC_GEMINI_API_KEY não encontrada no .env.local');
}
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // Removido para usar o padrão do Puppeteer
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('--- SCAN THE QR CODE ABOVE TO LOG IN ---');
});

client.on('ready', () => {
    console.log('--- FINANZA BOT IS READY! ---');
});

client.on('message', async (msg) => {
    const text = msg.body;

    if (text.length < 5) return;

    console.log(`Mensagem recebida: "${text}"`);

    try {
        const model = 'gemini-1.5-flash-latest';
        
        const systemInstruction = `Você é um processador de dados financeiros para o sistema Finanza. 
        Sua tarefa é converter frases em linguagem natural em objetos JSON de transação.
        Sempre identifique:
        1. description (string)
        2. amount (number)
        3. type (INCOME ou EXPENSE)
        4. category (Alimentação, Transporte, Lazer, Saúde, Salário, Outros)
        5. date (AAAA-MM-DD. Hoje é: ${new Date().toISOString().split('T')[0]})

        Responda APENAS o JSON.`;

        const result = await ai.models.generateContent({
            model,
            contents: text,
            config: { 
                systemInstruction,
                responseMimeType: "application/json"
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
