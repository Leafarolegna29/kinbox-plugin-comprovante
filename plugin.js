/********************
 * Plugin Comprovante Kinbox (corrigido com lastMessage)
 ********************/

var conversation

// Função para logar no console e no painel do plugin
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

    const ultimaMensagem = data?.conversation?.lastMessage

    if (!ultimaMensagem) {
        logMsg("⚠️ Nenhuma mensagem encontrada em conversation.lastMessage.")
        return
    }

    logMsg("💬 Última mensagem → Tipo: " + ultimaMensagem.type + " | Conteúdo: " + (ultimaMensagem.text || "[sem texto]"))

    // Só aceita imagens ou documentos
    if (!(ultimaMensagem.type === "image" || ultimaMensagem.type === "document")) {
        logMsg("⛔ Ignorado: não é imagem nem documento.")
        return
    }

    logMsg("🖼️ Mensagem é imagem/documento. Verificando tags...")

    // Só continua se tiver a tag aguardando_comprovante
    if (!data.contact?.tags?.includes("aguardando_comprovante")) {
        logMsg("🚫 Contato sem a tag 'aguardando_comprovante'.")
        return
    }

    logMsg("✅ Tag encontrada. Preparando payload...")

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

    fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((res) => {
            logMsg("🎯 Payload enviado com sucesso. Status: " + res.status)
        })
        .catch((err) => {
            logMsg("❌ Erro ao enviar para o n8n: " + err.message)
        })
})

// Quando não há conversa ativa
Kinbox.on("no_conversation", function () {
    conversation = null
    logMsg("ℹ️ Nenhuma conversa ativa.")
})
