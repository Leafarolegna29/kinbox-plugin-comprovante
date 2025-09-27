Kinbox.on("conversation", function (data) {
    console.log("📩 Nova conversa recebida:", data)

    const ultimaMensagem = data?.conversation?.lastMessage

    if (!ultimaMensagem) {
        logMsg("⚠️ Nenhuma mensagem encontrada em conversation.lastMessage.")
        return
    }

    // Extrair texto se for mensagem de texto (Delta formatado)
    let textoMensagem = null
    if (ultimaMensagem.type === 1 && ultimaMensagem.content) {
        try {
            const parsed = JSON.parse(ultimaMensagem.content)
            textoMensagem = parsed.map(item => item.insert).join("") || null
        } catch (err) {
            textoMensagem = ultimaMensagem.content
        }
    }

    logMsg(`💬 Última mensagem → Tipo: ${ultimaMensagem.type} | Conteúdo: ${textoMensagem || "[sem texto]"}`)

    // Só processa se for mídia (imagem/documento)
    if (!(ultimaMensagem.isMedia || ultimaMensagem.type !== 1)) {
        logMsg("⛔ Ignorado: não é mídia nem documento.")
        return
    }

    logMsg("🖼️ Mensagem é mídia/documento. Verificando tags...")

    if (!data.conversation?.tags?.includes("aguardando_comprovante")) {
        logMsg("🚫 Contato sem a tag 'aguardando_comprovante'.")
        return
    }

    logMsg("✅ Tag encontrada. Preparando payload...")

    const payload = {
        token: "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk",
        contato: {
            id: data.conversation?.contact?.id,
            nome: data.conversation?.contact?.name,
            telefone: data.conversation?.contact?.phone
        },
        mensagem: {
            id: ultimaMensagem._id,
            texto: textoMensagem,
            tipo: ultimaMensagem.type,
            midia: ultimaMensagem.fileName || null
        },
        metadata: {
            tags: data.conversation?.tags || [],
            campanha: data.conversation?.campaign || null
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
