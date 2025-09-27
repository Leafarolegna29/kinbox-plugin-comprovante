/********************
 * Plugin Debug de Mensagens
 ********************/

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

    // Dump completo no console
    console.log("🛠 Dump de data.conversation:", data.conversation)

    // Tenta identificar onde estão as mensagens
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

Kinbox.on("no_conversation", function () {
    logMsg("ℹ️ Nenhuma conversa ativa.")
})
