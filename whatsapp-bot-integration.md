# 🤖 Plano: Integração Automática WhatsApp (Bot + Gemini)

## Objetivo
Criar um serviço autônomo que escuta mensagens no WhatsApp, utiliza o Gemini para entender gastos em linguagem natural e registra automaticamente no Firebase do Finanza.

## Tarefas
- [ ] **Task 1: Instalação de Dependências**
  - Rodar `npm install whatsapp-web.js qrcode-terminal`
  - *Verificar:* `package.json` atualizado.

- [ ] **Task 2: Boilerplate do Bot (Auth via QR Code)**
  - Criar `scripts/whatsapp-bot.ts` com a inicialização básica do `whatsapp-web.js`.
  - *Verificar:* Rodar o script e conseguir escanear o QR Code no terminal.

- [ ] **Task 3: Ponte de Inteligência (Gemini Integration)**
  - Configurar o bot para enviar mensagens recebidas para a função `processTransactionWithGemini` (já existente no `geminiService.ts`).
  - *Verificar:* Log no terminal mostrando o JSON extraído de uma frase enviada pelo WhatsApp.

- [ ] **Task 4: Persistência no Firebase**
  - Implementar a função `saveTransaction` no script do bot para injetar o JSON no Firestore/RealtimeDB.
  - *Verificar:* Enviar "Gastei 10 reais" no WhatsApp e ver o registro aparecer no Dashboard do Finanza.

- [ ] **Task 5: Feedback e Comandos de Voz**
  - Adicionar resposta automática no WhatsApp (ex: "✅ Gasto de R$ 10 em Lanches registrado!") e suporte básico a áudio (se possível via Gemini).
  - *Verificar:* Receber a confirmação no celular.

## Finalizado Quando
- [ ] O bot consegue ler uma mensagem de texto e registrar o gasto no banco de dados sem intervenção manual.
- [ ] O usuário recebe uma confirmação de sucesso diretamente no WhatsApp.

## Notas
- O bot precisa rodar em um processo persistente (separado do Next.js) para não cair.
- Recomenda-se usar um número secundário para evitar riscos de banimento inicial durante testes.
