Kinbox.on("conversation", function (data) {
    console.clear()
    console.log("📩 DUMP COMPLETO DO OBJETO DATA:")
    console.dir(data, { depth: null }) // Mostra a árvore expandida no console

    // Só para o painel visual do plugin
    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML = "📩 Nova conversa recebida<br><pre>" +
            JSON.stringify(data, null, 2).substring(0, 2000) +
            "\n...\n(truncado, veja o console completo)" +
            "</pre>"
    }
})
