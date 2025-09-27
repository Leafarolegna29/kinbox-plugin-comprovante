/********************
 * Plugin Comprovante Kinbox (sem customFields, corrigido)
 ********************/

// Função global de log (tem que estar no topo!)
function logMsg(msg, obj) {
    console.log(msg, obj || "")
    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML += "\n" + msg + (obj ? " " + JSON.stringify(obj, null, 2) : "")
        logDiv.scrollTop = logDiv.scrollHeight
    }
}

Kinbox.on("conversation", function (data) {
    logMsg("📩 Nova conversa recebida:", { contato: data.contact?.name, conversa: data.conversation?.id })

    const ultimaMensagem = data?.conversation?.lastMessage

    if (!ultimaMensagem) {
        logMsg("⚠️ Nenhuma mensagem encontrada em conversation.lastMessage.")
        return
    }

    logMsg("💬 Última mensagem →", ultimaMensagem)

    // Só segue se for imagem ou documento
    const tipo = ultimaMensagem.type
    const ehComprovante = (tipo === "image" || tipo === "document" || ultimaMensagem.isMedia)

    if (!ehComprovante) {
        logMsg("⛔ Ignorado: última mensagem não é imagem/documento.")
        return
    }

    // Verifica se tem a tag aguardando_comprovante
    const temTag = (data.conversation?.tags || []).some(tag =>
        tag.name === "aguardando_comprovante" || tag.id === "aguardando_comprovante"
    )

    if (!temTag) {
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
            id: ultimaMensagem._id || ultimaMensagem.idMessage,
            tipo,
            texto: ultimaMensagem.type === 1 ? ultimaMensagem.content : null,
            arquivo: ultimaMensagem.fileName || null,
            url: ultimaMensagem.url || null
        },
        metadata: {
            conversaId: data.conversation?.id,
            tags: data.conversation?.tags || []
        }
    }

    logMsg("📤 Enviando payload para n8n...", payload)

    fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(res => logMsg("🎯 Payload enviado com sucesso. Status: " + res.status))
        .catch(err => logMsg("❌ Erro ao enviar para o n8n: " + err.message))
})

Kinbox.on("no_conversation", function () {
    logMsg("ℹ️ Nenhuma conversa ativa.")
})
