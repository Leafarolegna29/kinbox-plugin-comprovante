/********************
 * Plugin Comprovante Kinbox
 ********************/

var conversation

// Escuta novos eventos de conversa
Kinbox.on("conversation", function (data) {
    conversation = data
    console.log("Nova conversa recebida:", data)

    const ultimaMensagem = data?.messages?.[0]

    // Só dispara se for imagem/pdf E se o contato tiver a tag "aguardando_comprovante"
    if (
        ultimaMensagem &&
        (ultimaMensagem.type === "image" || ultimaMensagem.type === "document") &&
        data.contact?.tags?.includes("aguardando_comprovante")
    ) {
        const payload = {
            token: "<SEU_TOKEN>", // 🔑 Substitua pelo token do seu ambiente Kinbox
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

        console.log("Enviando comprovante para n8n:", payload)

        fetch("https://seu-n8n.com/webhook/comprovante", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })
        .then(() => Kinbox.toast("success", "✅ Comprovante enviado ao n8n"))
        .catch((err) => {
            console.error("Erro ao enviar para n8n:", err)
            Kinbox.toast("error", "❌ Erro ao enviar comprovante ao n8n")
        })
    }
})

// Caso não tenha conversa ativa
Kinbox.on("no_conversation", function () {
    conversation = null
    console.log("Nenhuma conversa ativa")
})
