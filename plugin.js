console.log("Iniciando plugin...")

function logMsg(msg, data = null, type = "info", mediaPreview = null) {
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

  // Texto principal
  let text = data ? `${msg}\n${JSON.stringify(data, null, 2)}` : msg
  entry.textContent = text

  // Se tiver preview de imagem, adiciona
  if (mediaPreview) {
    const img = document.createElement("img")
    img.src = mediaPreview
    img.alt = "Preview Comprovante"
    img.style.display = "block"
    img.style.marginTop = "5px"
    img.style.maxWidth = "250px"
    img.style.border = "1px solid #ccc"
    img.style.borderRadius = "8px"
    logContainer.appendChild(img)
  }

  logContainer.appendChild(entry)
  console.log(msg, data || "")
}

// Captura última mídia renderizada no DOM
function getLastMediaUrl() {
  const medias = document.querySelectorAll(
    ".contact-media-item img, .contact-media-item video, .contact-media-item audio"
  )
  if (!medias.length) return null
  const lastMedia = medias[medias.length - 1]
  return lastMedia?.src || null
}

Kinbox.on("conversation", async (data) => {
  logMsg("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id
  }, "info")

  const tags = data.conversation?.tags || []
  logMsg("🏷️ Tags recebidas:", tags, "info")

  // Verifica se a tag "Aguardando comprovante" (ID 41591) está presente
  const temTagComprovante = tags.some(t => String(t.id || t) === "41591")
  if (!temTagComprovante) {
    logMsg("ℹ️ Tag 'Aguardando comprovante' NÃO encontrada. Ignorando envio.", null, "warn")
    return
  }

  logMsg("✅ Tag 'Aguardando comprovante' encontrada. Prosseguindo...", null, "success")

  const lastMsg = data.conversation?.lastMessage || {}
  const lastMediaUrl = getLastMediaUrl()

  if (lastMediaUrl) {
    const isImage = lastMediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    logMsg("🖼️ Última mídia encontrada:", lastMediaUrl, "success", isImage ? lastMediaUrl : null)
  } else {
    logMsg("⚠️ Nenhuma mídia encontrada no DOM.", null, "warn")
  }

  // Monta payload completo
  const payload = {
    source_id: data.session?.id,
    source_url: data.conversation?.link,
    telefone: data.contact?.phone,
    nome: data.contact?.name,
    ctwa_clid: data.conversation?.identifier,
    id_contato: data.contact?.id,
    id_conversa: data.conversation?.id,
    id_externo: data.conversation?.uniqueIdentifier || null,
    ultimaMensagem: lastMsg?.content || "⚠️ vazio",
    mediaUrl: lastMediaUrl
  }

  logMsg("📤 Payload final:", payload, "info")

  // Envia ao n8n
  try {
    const resp = await fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    logMsg("✅ Webhook enviado com sucesso!", await resp.text(), "success")
  } catch (err) {
    logMsg("❌ Erro ao enviar webhook:", err, "error")
  }
})
