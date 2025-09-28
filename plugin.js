console.log("Iniciando plugin...")

function logMsg(msg, data = null, type = "info") {
  const logContainer = document.getElementById("logs")
  const entry = document.createElement("pre")

  let color = "#333"
  if (type === "success") color = "green"
  if (type === "error") color = "red"
  if (type === "warn") color = "orange"

  entry.style.color = color
  entry.style.margin = "5px 0"
  entry.textContent = data
    ? `${msg}\n${JSON.stringify(data, null, 2)}`
    : msg
  logContainer.appendChild(entry)

  if (data) {
    console.log(msg, data)
  } else {
    console.log(msg)
  }
}

Kinbox.on("conversation", async (data) => {
  logMsg("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id
  }, "info")

  const lastMsg = data.conversation?.lastMessage
  if (!lastMsg) {
    logMsg("⚠️ Nenhuma lastMessage encontrada", null, "warn")
    return
  }

  // Mostrar IDs que precisamos para buscar mídia via API
  logMsg("🗂️ IDs da última mensagem:", {
    conversationId: data.conversation?.id,
    lastMessage_id: lastMsg?._id,
    lastMessage_idMessage: lastMsg?.idMessage,
    type: lastMsg?.type,
    content: lastMsg?.content || "⚠️ vazio"
  }, "info")
})
