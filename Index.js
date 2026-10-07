const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function iniciarBot() {
    // Guarda a sessão na pasta 'session'
    const { state, saveCreds } = await useMultiFileAuthState('session');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false // Desativado para podermos escolher o método
    });

    sock.ev.on('creds.update', saveCreds);

    // Se ainda não estiver conectado, pergunta o método
    if (!sock.authState.creds.registered) {
        console.log("\n--- COMO DESEJA CONECTAR? ---");
        console.log("1: QR Code");
        console.log("2: Código de Verificação (Pairing Code)");
        
        const opcao = await question("Escolha uma opção (1 ou 2): ");

        if (opcao === '2') {
            const numero = await question("Digite o número de telefone (ex: 5511999999999): ");
            await delay(3000);
            const code = await sock.requestPairingCode(numero.trim());
            console.log(`\n👉 Seu código de conexão é: ${code}\n`);
        } else {
            console.log("Aguarde, gerando QR Code no terminal...");
            // Lógica para exibir QR Code
        }
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('✅ Bot conectado com sucesso!');
        }
    });
}

iniciarBot();
