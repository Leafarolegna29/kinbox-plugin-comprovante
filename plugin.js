/********************
 * Plugin Comprovante Kinbox (com debug no console, notas e tela)
 ********************/

var conversation

// Função para logar no console visual
function logMsg(msg) {
    console.log(msg)
    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML += "\n" + msg
        logDiv.scrollTop = logDiv.scrollHeight
    }
}

// Quando chega nova conversa
Kinbox.on("conversation", function (data) {
    conversation = data
    logMsg("📩 Nova conversa recebida do contato: " + (data.contact?.name || "sem nome"))
    Kinbox.sendNote("📩 Nova conversa recebida do contato: " + (data.contact?.name || "sem nome"))

    const ultimaMensagem = data?.messages?.[0]

    if (!ultimaMensagem) {
        logMsg("⚠️ Nenhuma mensagem encontrada.")
        Kinbox.sendNote("⚠️ Nenhuma mensagem encontrada na conversa.")
        return
    }

    logMsg("💬 Última mensagem → Tipo: " + ultimaMensagem.type)
    Kinbox.sendNote("💬 Última mensagem → Tipo: " + ultimaMensagem.type)

    // Só aceita imagens ou documentos
    if (!(ultimaMensagem.type === "image" || ultimaMensagem.type === "document")) {
        logMsg("⛔ Ignorado: não é imagem nem documento.")
        Kinbox.sendNote("⛔ Ignorado: não é imagem nem documento.")
        return
    }

    logMsg("🖼️ Mensagem é imagem/documento. Verificando tags...")
    Kinbox.sendNote("🖼️ Mensagem é imagem/documento. Verificando tags...")

    // Só continua se tiver a tag aguardando_comprovante
    if (!data.contact?.tags?.includes("aguardando_comprovante")) {
        logMsg("🚫 Contato sem a tag 'aguardando_comprovante'.")
        Kinbox.sendNote("🚫 Contato sem a tag 'aguardando_comprovante'.")
        return
    }

    logMsg("✅ Tag encontrada. Preparando payload...")
    Kinbox.sendNote("✅ Tag 'aguardando_comprovante' encontrada. Preparando envio...")

    const payload = {
        token: "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk",
        contato: {
            id: data.contact?.id,
            nome: data.contact?.name,
            telefone: data.contact?.phone
        },
        mensagem: {
            id: ultimaMensagem.id,
            texto: ultimaMensagem.text || null,
            tipo: ultimaMensagem.type,
            midia: ultimaMensagem.url || null
        },
        metadata: {
            tags: data.contact?.tags || [],
            campanha: data.contact?.campaign || null
        }
    }

    logMsg("📤 Enviando payload para o n8n...")
    Kinbox.sendNote("📤 Enviando payload para o n8n...")

    fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((res) => {
            logMsg("🎯 Payload enviado com sucesso. Status: " + res.status)
            Kinbox.sendNote("🎯 Payload enviado com sucesso. Status: " + res.status)
        })
        .catch((err) => {
            logMsg("❌ Erro ao enviar para o n8n: " + err.message)
            Kinbox.sendNote("❌ Erro ao enviar para o n8n: " + err.message)
        })
})

// Quando não há conversa ativa
Kinbox.on("no_conversation", function () {
    conversation = null
    logMsg("ℹ️ Nenhuma conversa ativa.")
    Kinbox.sendNote("ℹ️ Nenhuma conversa ativa no momento.")
})
