console.log("🚀 Iniciando plugin...")

// Função de log no painel HTML
function logMsg(msg, data = null, type = "info") {
  const logContainer = document.getElementById("logs")
  const entry = document.createElement("div")

  let color = "#333"
  if (type === "success") color = "green"
  if (type === "error") color = "red"
  if (type === "warn") color = "orange"

  entry.style.color = color
  entry.style.margin = "8px 0"
  entry.style.fontFamily = "monospace"
  entry.style.whiteSpace = "pre-wrap"

  let text = data ? `${msg}\n${JSON.stringify(data, null, 2)}` : msg
  entry.textContent = text

  logContainer.appendChild(entry)
  console.log(msg, data || "")
}

// Captura última mídia visível no DOM
function getLastMediaUrl() {
  const medias = document.querySelectorAll(".contact-media-item img, .contact-media-item video, .contact-media-item audio")
  if (!medias.length) return null
  return medias[medias.length - 1]?.src || null
}

// Handler de eventos diretos do Kinbox (postMessage)
window.addEventListener("message", async (event) => {
  const payload = event.data
  if (!payload || !payload.event) return

  if (payload.event === "conversation") {
    const data = payload.data
    logMsg("📩 Nova conversa recebida:", {
      contato: data.contact?.name,
      conversa: data.conversation?.id
    })

    const tags = data.conversation?.tags || []
    logMsg("🏷️ Tags recebidas:", tags)

    const temTagComprovante = tags.some(t => String(t.id || t) === "41591")
    if (!temTagComprovante) {
      logMsg("ℹ️ Tag 'Aguardando comprovante' NÃO encontrada. Ignorando envio.", null, "warn")
      return
    }

    logMsg("✅ Tag 'Aguardando comprovante' encontrada. Prosseguindo...", null, "success")

    const lastMediaUrl = getLastMediaUrl()

    const payloadWebhook = {
      source_id: data.session?.id,
      source_url: data.conversation?.link,
      telefone: data.contact?.phone,
      nome: data.contact?.name,
      ctwa_clid: data.conversation?.identifier,
      id_contato: data.contact?.id,
      id_conversa: data.conversation?.id,
      id_externo: data.conversation?.uniqueIdentifier || null,
      ultimaMensagem: data.conversation?.lastMessage?.content || "⚠️ vazio",
      mediaUrl: lastMediaUrl
    }

    logMsg("📤 Payload final:", payloadWebhook)

    try {
      const resp = await fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadWebhook)
      })
      logMsg("✅ Webhook enviado com sucesso!", await resp.text(), "success")
    } catch (err) {
      logMsg("❌ Erro ao enviar webhook:", err, "error")
    }
  }
})
