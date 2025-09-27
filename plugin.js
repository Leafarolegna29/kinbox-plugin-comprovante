/********************
 * Plugin Comprovante Kinbox (com debug)
 ********************/

var conversation

// Quando uma conversa é recebida
Kinbox.on("conversation", function (data) {
    conversation = data
    console.log("Nova conversa recebida:", data)

    Kinbox.sendNote("📩 Nova conversa recebida do contato: " + (data.contact?.name || "sem nome"))

    const ultimaMensagem = data?.messages?.[0]

    if (!ultimaMensagem) {
        Kinbox.sendNote("⚠️ Nenhuma mensagem encontrada na conversa.")
        return
    }

    Kinbox.sendNote("💬 Última mensagem recebida → Tipo: " + ultimaMensagem.type)

    // Checa se a mensagem é imagem ou documento
    const ehComprovante = ultimaMensagem.type === "image" || ultimaMensagem.type === "document"

    if (!ehComprovante) {
        Kinbox.sendNote("⛔ Ignorado: não é imagem nem documento.")
        return
    }

    Kinbox.sendNote("🖼️ Mensagem é imagem/documento. Verificando tags do contato...")

    // Checa se o contato tem a tag "aguardando_comprovante"
    if (!data.contact?.tags?.includes("aguardando_comprovante")) {
        Kinbox.sendNote("🚫 Contato sem a tag 'aguardando_comprovante'. Não será enviado para o n8n.")
        return
    }

    Kinbox.sendNote("✅ Contato possui a tag 'aguardando_comprovante'. Preparando payload...")

    const payload = {
        token: "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk", // 🔑 Substitua pelo token do seu ambiente Kinbox
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

    Kinbox.sendNote("📤 Enviando payload para o n8n: " + JSON.stringify(payload))

    fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then(() => {
            Kinbox.sendNote("🎯 Payload enviado com sucesso ao n8n.")
        })
        .catch((err) => {
            Kinbox.sendNote("❌ Erro ao enviar para o n8n: " + err.message)
            console.error("Erro ao enviar para n8n:", err)
        })
})

// Caso não tenha conversa ativa
Kinbox.on("no_conversation", function () {
    conversation = null
    Kinbox.sendNote("ℹ️ Nenhuma conversa ativa no momento.")
})
