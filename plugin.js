Kinbox.on("conversation", function (data) {
    logMsg("📩 Nova conversa recebida:", { contato: data.contact?.name, conversa: data.conversation?.id })

    // Dump só da conversa
    console.log("🛠 Dump de data.conversation:", data.conversation)
    logMsg("🛠 Veja o console do navegador (F12 → Console) para a estrutura completa da conversa.")

    // Tenta pegar mensagens se existirem
    if (data.conversation?.messages) {
        logMsg("📌 Existe array conversation.messages com tamanho: " + data.conversation.messages.length)
    }

    if (data.session?.messages) {
        logMsg("📌 Existe array session.messages com tamanho: " + data.session.messages.length)
    }

    if (data.contact?.messages) {
        logMsg("📌 Existe array contact.messages com tamanho: " + data.contact.messages.length)
    }
})
