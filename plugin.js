/********************
 * Plugin Comprovante Kinbox (com debug no console e sendNote)
 ********************/

var conversation

// Escuta eventos de nova conversa
Kinbox.on("conversation", function (data) {
    conversation = data
    console.log("📩 [PLUGIN] Nova conversa recebida:", data)

    Kinbox.sendNote("📩 Nova conversa recebida do contato: " + (data.contact?.name || "sem nome"))

    const ultimaMensagem = data?.messages?.[0]

    if (!ultimaMensagem) {
        console.log("⚠️ [PLUGIN] Nenhuma mensagem encontrada.")
        Kinbox.sendNote("⚠️ Nenhuma mensagem encontrada na conversa.")
        return
    }

    console.log("💬 [PLUGIN] Última mensagem:", ultimaMensagem)
    Kinbox.sendNote("💬 Última mensagem → Tipo: " + ultimaMensagem.type)

    // Checa se é imagem/documento
    const ehComprovante = ultimaMensagem.type === "image" || ultimaMensagem.type === "document"

    if (!ehComprovante) {
        console.log("⛔ [PLUGIN] Ignorado, não é imagem/documento.")
        Kinbox.sendNote("⛔ Ignorado: não é imagem nem documento.")
        return
    }

    console.log("🖼️ [PLUGIN] Mensagem é imagem/documento, verificando tags...")
    Kinbox.sendNote("🖼️ Mensagem é imagem/documento. Verificando tags...")

    // Checa se tem a tag aguardando_comprovante
    if (!data.contact?.tags?.includes("aguardando_comprovante")) {
        console.log("🚫 [PLUGIN] Contato sem a tag aguardando_comprovante.")
        Kinbox.sendNote("🚫 Contato sem a tag 'aguardando_comprovante'.")
        return
    }

    console.log("✅ [PLUGIN] Tag correta encontrada. Preparando payload...")
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

    console.log("📤 [PLUGIN] Enviando payload para n8n:", payload)
    Kinbox.sendNote("📤 Enviando payload para o n8n...")

    fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((res) => {
            console.log("🎯 [PLUGIN] Envio concluído:", res.status)
            Kinbox.sendNote("🎯 Payload enviado com sucesso ao n8n. Status: " + res.status)
        })
        .catch((err) => {
            console.error("❌ [PLUGIN] Erro ao enviar:", err)
            Kinbox.sendNote("❌ Erro ao enviar para o n8n: " + err.message)
        })
})

// Quando não há conversa ativa
Kinbox.on("no_conversation", function () {
    conversation = null
    console.log("ℹ️ [PLUGIN] Nenhuma conversa ativa.")
    Kinbox.sendNote("ℹ️ Nenhuma conversa ativa no momento.")
})
