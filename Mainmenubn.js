const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const readline = require('readline');

// --- INTERFAÇAO DE TERMINAL PARA SELEÇÃO DE AUTENTICAÇÃO ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// --- CONFIGURAÇÕES GLOBAIS DO DONO (Customizáveis via Menu Dono) ---
global.configsBot = {
    botName: "Bolsonaro bot",
    prefixo: "!",
    imagemMenu: "https://i.imgur.com/example.jpg", // Link da imagem/banner do menu
    iconeItem: "•.̇𖥨֗💜⭟",
    meio: "┊",
    bordaCima: "╭┈❁",
    bordaBaixo: "╰─┈┈┈┈┈◜❁◞┈┈┈┈┈─╯",
    numeroDono: "5511966400036" // Coloque o seu número com DDD aqui
};

// --- FUNÇÃO DO MENU DE BRINCADEIRAS ---
async function enviarMenuBrincadeiras(sock, de, userName = "Usuário") {
    const { botName, prefixo, imagemMenu, iconeItem, meio, bordaCima, bordaBaixo } = global.configsBot;

    const topo = `╭┈⊰ 🌸 『 *${botName}* 』\n${meio}Olá, ${userName}!\n${bordaBaixo}`;

    const menuTexto = `${topo}

${bordaCima} *🎮 JOGOS & DIVERSÃO 🎲*
${meio}
${meio}${iconeItem}${prefixo}tictactoe @usuario
${meio}${iconeItem}${prefixo}connect4 @usuario
${meio}${iconeItem}${prefixo}uno criar
${meio}${iconeItem}${prefixo}uno entrar
${meio}${iconeItem}${prefixo}memoria
${meio}${iconeItem}${prefixo}wordle
${meio}${iconeItem}${prefixo}quiz
${meio}${iconeItem}${prefixo}forca
${meio}${iconeItem}${prefixo}adivinhar
${meio}${iconeItem}${prefixo}resposta <chute>
${meio}${iconeItem}${prefixo}ppt (Pedra, Papel, Tesoura)
${meio}${iconeItem}${prefixo}eununca
${meio}${iconeItem}${prefixo}sorte
${meio}${iconeItem}${prefixo}shipo
${bordaBaixo}

${bordaCima} *💬 FRASES & DIVERSÃO 📜*
${meio}
${meio}${iconeItem}${prefixo}conselho
${meio}${iconeItem}${prefixo}cantada
${meio}${iconeItem}${prefixo}piada
${meio}${iconeItem}${prefixo}charada
${meio}${iconeItem}${prefixo}motivacional
${meio}${iconeItem}${prefixo}elogio
${meio}${iconeItem}${prefixo}fato
${bordaBaixo}

${bordaCima} *🤝 INTERAÇÕES SOCIAIS 🤝*
${meio}
${meio}${iconeItem}${prefixo}chute @usuario
${meio}${iconeItem}${prefixo}tapa @usuario
${meio}${iconeItem}${prefixo}soco @usuario
${meio}${iconeItem}${prefixo}abraco @usuario
${meio}${iconeItem}${prefixo}morder @usuario
${meio}${iconeItem}${prefixo}beijo @usuario
${meio}${iconeItem}${prefixo}matar @usuario
${meio}${iconeItem}${prefixo}cafune @usuario
${bordaBaixo}

${bordaCima} *💞 RELACIONAMENTOS ❤️*
${meio}
${meio}${iconeItem}${prefixo}namoro @usuario
${meio}${iconeItem}${prefixo}casamento @usuario
${meio}${iconeItem}${prefixo}terminar
${meio}${iconeItem}${prefixo}trair @usuario
${bordaBaixo}

${bordaCima} *🎯 BRINCADEIRAS & TESTES 🔥*
${meio}
${meio}${iconeItem}${prefixo}gay
${meio}${iconeItem}${prefixo}burro
${meio}${iconeItem}${prefixo}inteligente
${meio}${iconeItem}${prefixo}otaku
${meio}${iconeItem}${prefixo}fiel
${meio}${iconeItem}${prefixo}corno
${meio}${iconeItem}${prefixo}gado
${meio}${iconeItem}${prefixo}gostoso
${meio}${iconeItem}${prefixo}feio
${meio}${iconeItem}${prefixo}rico
${meio}${iconeItem}${prefixo}pobre
${meio}${iconeItem}${prefixo}safado
${meio}${iconeItem}${prefixo}vesgo
${bordaBaixo}

${bordaCima} *🏆 RANKINGS DO GRUPO 👑*
${meio}
${meio}${iconeItem}${prefixo}rankgay
${meio}${iconeItem}${prefixo}rankcorno
${meio}${iconeItem}${prefixo}rankgado
${meio}${iconeItem}${prefixo}rankgostoso
${meio}${iconeItem}${prefixo}rankrico
${meio}${iconeItem}${prefixo}rankpobre
${meio}${iconeItem}${prefixo}ranklindo
${bordaBaixo}`;

    return await sock.sendMessage(de, {
        image: { url: imagemMenu },
        caption: menuTexto
    });
}

// --- CONEXÃO E LÓGICA PRINCIPAL DO BOT ---
async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Desativado para usar o prompt do Pairing Code se necessário
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    // Conexão via Pairing Code ou QR Code
    if (!sock.authState.creds.registered) {
        console.log("\n==========================================");
        console.log("       MÉTODO DE CONEXÃO DO BOT           ");
        console.log("==========================================");
        console.log("[ 1 ] Conectar via QR Code");
        console.log("[ 2 ] Conectar via Código de Verificação (Pairing Code)");
        
        const opcao = await question("\nEscolha a opção desejada (1 ou 2): ");

        if (opcao === '2') {
            const numero = await question("\nDigite o número de telefone completo (ex: 5511999999999): ");
            await delay(3000);
            const code = await sock.requestPairingCode(numero.trim());
            console.log(`\n👉 SEU CÓDIGO DE EMPARELHAMENTO: ${code}\n`);
        } else {
            console.log("\nGerando QR Code no terminal...\n");
            sock.options.printQRInTerminal = true;
        }
    }

    // Gerenciador de conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⚠️ Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) iniciarBot();
        } else if (connection === 'open') {
            console.log('✅ Bolsonaro bot conectado com sucesso!');
        }
    });

    // Escutador de mensagens
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            const msg = messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const pushName = msg.pushName || "Usuário";

            // Extrai o texto da mensagem
            const body = msg.message.conversation || 
                         msg.message.extendedTextMessage?.text || 
                         msg.message.imageMessage?.caption || "";

            const prefix = global.configsBot.prefixo;
            if (!body.startsWith(prefix)) return;

            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const textArgs = args.join(" ");

            const isOwner = sender.includes(global.configsBot.numeroDono);

            // --- COMANDOS DO SWITCH ---
            switch (command) {
                case 'brincadeiras':
                case 'brincadeira':
                case 'jogos':
                case 'menu2':
                    await enviarMenuBrincadeiras(sock, from, pushName);
                    break;

                // --- COMANDOS DO MENU DONO PARA MUDAR O LAYOUT ---
                case 'seticone':
                    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Apenas o dono pode alterar os ícones!" }, { quoted: msg });
                    if (!textArgs) return await sock.sendMessage(from, { text: `Uso correto: ${prefix}seticone <novo_icone>` }, { quoted: msg });
                    global.configsBot.iconeItem = textArgs;
                    await sock.sendMessage(from, { text: `✅ Ícone dos itens alterado para: ${textArgs}` }, { quoted: msg });
                    break;

                case 'setmeio':
                    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Apenas o dono pode alterar o meio!" }, { quoted: msg });
                    if (!textArgs) return await sock.sendMessage(from, { text: `Uso correto: ${prefix}setmeio <simbolo>` }, { quoted: msg });
                    global.configsBot.meio = textArgs;
                    await sock.sendMessage(from, { text: `✅ Símbolo do meio alterado para: ${textArgs}` }, { quoted: msg });
                    break;

                case 'setimagem':
                    if (!isOwner) return await sock.sendMessage(from, { text: "❌ Apenas o dono pode alterar a imagem!"
  
