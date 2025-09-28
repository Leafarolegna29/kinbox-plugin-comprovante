console.log("Iniciando plugin...")

// Função para logar no painel HTML + console
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

// Função recursiva para varrer objetos
function dumpObject(obj, prefix = "") {
  let result = {}
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    const value = obj[key]
    if (typeof value === "object" && value !== null) {
      result[prefix + key] = "[Object]"
      Object.assign(result, dumpObject(value, prefix + key + "."))
    } else {
      result[prefix + key] = value
    }
  }
  return result
}

// Listener de conversas
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

  // Dump direto da lastMessage
  logMsg("🗂️ Dump bruto de lastMessage:", lastMsg, "info")

  // Dump recursivo detalhado (inclui subníveis)
  const fullDump = dumpObject(lastMsg)
  logMsg("🔎 Dump recursivo de todos os campos de lastMessage:", fullDump, "success")
})
