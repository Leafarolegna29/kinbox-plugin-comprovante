Kinbox.on("conversation", function (data) {
    console.clear()
    console.log("📩 Objeto data recebido (dump completo):")
    console.log(JSON.stringify(data, null, 2))

    const logDiv = document.getElementById("log")
    if (logDiv) {
        logDiv.innerHTML = "📩 Nova conversa recebida<br><pre>" +
            JSON.stringify(data, null, 2) +
            "</pre>"
    }
})
