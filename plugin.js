/********************
 * Plugin Debug - Mostra todo o objeto recebido
 ********************/

function logMsg(msg, obj) {
    console.log(msg, obj || "")
    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML += "\n" + msg + (obj ? " " + JSON.stringify(obj, null, 2) : "")
        logDiv.scrollTop = logDiv.scrollHeight
    }
}

// Escuta eventos de conversa
Kinbox.on("conversation", function (data) {
    logMsg("📩 Nova conversa recebida:", data)

    // Dump completo para descobrir onde estão as mensagens
    logMsg("🛠 Estrutura completa recebida → veja no console do Chrome também:", data)
})

// Escuta quando não há conversa
Kinbox.on("no_conversation", function () {
    logMsg("ℹ️ Nenhuma conversa ativa.")
})
