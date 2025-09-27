/********************
 * Plugin Captura Comprovantes (via API Get Session)
 ********************/

function logMsg(msg, obj) {
    console.log(msg, obj || "")
    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML += "\n" + msg + (obj ? " " + JSON.stringify(obj, null, 2) : "")
        logDiv.scrollTop = logDiv.scrollHeight
    }
}

// Função auxiliar para buscar a última mensagem de uma sessão
async function getUltimaMensagem(conversationId) {
    try {
        const res = await fetch(`https://api.kinbox.com.br/v2/sessions/${conversationId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk"
            }
        })
        const data = await res.json()
        const mensagens = data?.messages || []
        return mensagens.length ? mensagens[mensagens.length - 1] : null
    } catch (err) {
        logMsg("❌ Erro ao buscar sessão:", err.message)
        return null
    }
}

// Evento principal do plugin
Kinbox.on("conversation", async function (data) {
    logMsg("📩 Nova conversa recebida:", { contato: data.contact?.name, conversa: data.conversation?.id })

    const conversaId = data.conversation?.id
    if (!conversaId) {
        logMsg("⚠️ Nenhum ID de conversa encontrado.")
        return
    }

    const ultimaMensagem = await getUltimaMensagem(conversaId)
    if (!ultimaMensagem) {
        logMsg("⚠️ Nenhuma mensagem encontrada na API.")
        return
    }

    logMsg("💬 Última mensagem:", ultimaMensagem)

    // Verifica se é mídia/documento
    const ehComprovante = ultimaMensagem.isMedia || ultimaMensagem.type !== 1
    if (!ehComprovante) {
        logMsg("⛔ Ignorado: não é mídia/documento.")
        return
    }

    // Verifica se a conversa tem a tag aguardando_comprovante
    const temTag = (data.conversation?.tags || []).some(tag =>
        tag.name === "aguardando_comprovante" || tag.id === "aguardando_comprovante"
    )
    if (!temTag) {
        logMsg("🚫 Contato sem a tag 'aguardando_comprovante'.")
        return
    }

    // Extrair URL do comprovante do content (Delta)
    let urlArquivo = null
    try {
        const parsed = JSON.parse(ultimaMensagem.content)
        const insert = parsed[0]?.insert
        if (insert?.image) urlArquivo = insert.image
        if (insert?.document) urlArquivo = insert.document
        if (insert?.audio) urlArquivo = insert.audio
    } catch (e) {
        logMsg("❌ Erro ao parsear content:", e.message)
    }

    if (!urlArquivo) {
        logMsg("⚠️ Nenhum arquivo encontrado no content.")
        return
    }

    const payload = {
        token: "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk",
        contato: {
            id: data.contact?.id,
            nome: data.contact?.name,
            telefone: data.contact?.phone
        },
        comprovante: {
            url: urlArquivo,
            tipo: ultimaMensagem.type,
            criadoEm: ultimaMensagem.createdAt
        },
        metadata: {
            conversaId,
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
