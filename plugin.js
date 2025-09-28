console.log("Iniciando plugin...")

function waitForKinbox(callback) {
  if (window.Kinbox) {
    callback()
  } else {
    console.warn("⏳ Aguardando Kinbox estar disponível...")
    setTimeout(() => waitForKinbox(callback), 500)
  }
}

waitForKinbox(() => {
  console.log("✅ Kinbox disponível, iniciando plugin!")

  Kinbox.on("conversation", async (data) => {
    console.log("📩 Nova conversa recebida:", data)

    const tags = data.conversation?.tags || []
    console.log("🏷️ Tags recebidas:", tags)

    const temTagComprovante = tags.some(t => String(t.id || t) === "41591")
    if (!temTagComprovante) {
      console.log("ℹ️ Tag 'Aguardando comprovante' NÃO encontrada. Ignorando envio.")
      return
    }

    console.log("✅ Tag encontrada, capturando mídia...")

    const medias = document.querySelectorAll(".contact-media-item img, .contact-media-item video, .contact-media-item audio")
    const lastMedia = medias.length ? medias[medias.length - 1].src : null

    const payload = {
      source_id: data.session?.id,
      source_url: data.conversation?.link,
      telefone: data.contact?.phone,
      nome: data.contact?.name,
      ctwa_clid: data.conversation?.identifier,
      id_contato: data.contact?.id,
      id_conversa: data.conversation?.id,
      id_externo: data.conversation?.uniqueIdentifier || null,
      ultimaMensagem: data.conversation?.lastMessage?.content || "⚠️ vazio",
      mediaUrl: lastMedia
    }

    console.log("📤 Payload final:", payload)

    try {
      const resp = await fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      console.log("✅ Webhook enviado com sucesso!", await resp.text())
    } catch (err) {
      console.error("❌ Erro ao enviar webhook:", err)
    }
  })
})
