console.log("Iniciando plugin...")

// ID fixo da tag "Aguardando comprovante"
const TAG_COMPROVANTE_ID = "41591"

// URL do webhook n8n
const N8N_WEBHOOK_URL = "https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes"

// Função de log (console + tela)
function logMsg(msg, data = null, type = "info") {
  const logContainer = document.getElementById("logs")
  const entry = document.createElement("div")

  // Cores do log
  let color = "#333"
  if (type === "success") color = "green"
  if (type === "error") color = "red"
  if (type === "warn") color = "orange"

  entry.style.color = color
  entry.style.margin = "3px 0"
  entry.textContent = data ? `${msg} ${JSON.stringify(data, null, 2)}` : msg
  logContainer.appendChild(entry)

  // Também manda pro console
  if (data) {
    console.log(msg, data)
  } else {
    console.log(msg)
  }
}

// Listener de conversas
Kinbox.on("conversation", async (data) => {
  logMsg("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id
  })

  // Captura tags
  const tags = data.conversation?.tags || []
  logMsg("🏷️ Tags recebidas:", tags)

  // Verificação de tag "Aguardando comprovante" pelo ID fixo
  const temTagComprovante = tags.some(t => {
    const tagId = String(t.id || t) // Pode vir como objeto {id} ou apenas número
    return tagId === TAG_COMPROVANTE_ID
  })

  if (!temTagComprovante) {
    logMsg("ℹ️ Nenhuma tag de comprovante encontrada.", null, "warn")
    return
  }

  logMsg("✅ Tag de comprovante detectada!", null, "success")

  // Última mensagem (pode ser texto ou mídia)
  let ultimaMensagem = data.conversation?.lastMessage?.content || "⚠️ Sem mensagem"
  let mediaUrl = null

  try {
    if (data.conversation?.lastMessage?.type === 3) {
      // Se for mídia
      mediaUrl = data.conversation?.lastMessage?.mediaUrl || data.conversation?.lastMessage?.extra?.mediaUrl
    } else if (ultimaMensagem && typeof ultimaMensagem === "string") {
      const parsed = JSON.parse(ultimaMensagem)
      if (Array.isArray(parsed) && parsed[0]?.insert?.image) {
        mediaUrl = parsed[0].insert.image
      }
    }
  } catch (e) {
    logMsg("⚠️ Erro ao processar última mensagem:", e, "error")
  }

  logMsg("🖼️ Última mensagem capturada:", ultimaMensagem)
  if (mediaUrl) logMsg("🔗 URL da mídia:", mediaUrl, "success")

  // Monta payload para enviar ao n8n
  const payload = {
    source_id: data.session?.id,
    source_url: data.conversation?.link,
    telefone: data.contact?.phone,
    nome: data.contact?.name,
    ctwa_clid: data.conversation?.identifier,
    id_contato: data.contact?.id,
    id_conversa: data.conversation?.id,
    id_externo: data.conversation?.uniqueIdentifier || null,
    ultimaMensagem,
    mediaUrl
  }

  logMsg("📤 Enviando payload ao n8n:", payload, "info")

  try {
    const resp = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    logMsg("✅ Webhook enviado com sucesso!", await resp.text(), "success")
  } catch (err) {
    logMsg("❌ Erro ao enviar webhook:", err, "error")
  }
})
