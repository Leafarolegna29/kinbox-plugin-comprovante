Kinbox.on("conversation", function (data) {
    console.log("📩 Dump completo do objeto recebido:", data)

    // Mostra no painel do plugin (limitando tamanho)
    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML = "📩 Nova conversa recebida\n\n" +
            JSON.stringify(data, null, 2).slice(0, 5000) + 
            "\n\n⚠️ (Exibindo só os primeiros 5000 caracteres)"
    }
})
