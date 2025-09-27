// Mapa fixo das tags conhecidas
const TAGS_MAP = {
  "41591": "Aguardando comprovante"
}

Kinbox.on("conversation", function (data) {
  logMsg("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id
  })

  const conversaId = data.conversation?.id
  const tags = data.conversation?.tags || []

  logMsg("🏷️ Tags recebidas (cruas):", tags)

  // Verificação de tags usando ID + nome do mapa
  const temTagComprovante = tags.some(t => {
    const tagId = String(t.id || t) // pode vir como objeto ou id direto
    const nome = (t.name || TAGS_MAP[tagId] || "").toLowerCase()
    return nome.includes("comprovante")
  })

  if (!temTagComprovante) {
    logMsg("ℹ️ Nenhuma tag de comprovante encontrada.")
    return
  }

  const ultimaMensagem = data.conversation?.lastMessage
  if (!ultimaMensagem) {
    logMsg("⚠️ Nenhuma última mensagem disponível.")
    return
  }

  let mediaUrl = null
  let mensagemTexto = null

  // 1) tenta pelo content
  try {
    if (ultimaMensagem.content) {
      const parsed = JSON.parse(ultimaMensagem.content)
      const insert = parsed[0]?.insert
      if (insert?.image) mediaUrl = insert.image
      if (insert?.document) mediaUrl = insert.document
      if (insert?.audio) mediaUrl = insert.audio
      if (typeof insert === "string") mensagemTexto = insert
    }
  } catch (e) {
    logMsg("❌ Erro ao tentar ler content: " + e.message)
  }

  // 2) fallback pelo campo direto
  if (!mediaUrl && ultimaMensagem.mediaUrl) {
    mediaUrl = ultimaMensagem.mediaUrl
  }

  // 3) fallback pelo campo extra
  if (!mediaUrl && ultimaMensagem.extra?.mediaUrl) {
    mediaUrl = ultimaMensagem.extra.mediaUrl
  }

  if (mediaUrl) {
    logMsg("✅ Comprovante detectado: " + mediaUrl, null, true)
  } else {
    logMsg("⚠️ Nenhum comprovante (mídia) detectado nesta mensagem.")
  }

  const payload = {
    token: "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk",
    contato: {
      id_contato: data.contact?.id,
      nome: data.contact?.name,
      telefone: data.contact?.phone,
    },
    metadata: {
      id_conversa: conversaId,
      id_externo: data.conversation?.identifier,
      source_id: data.conversation?.platformId || null,
      source_url: data.conversation?.link || null,
      ctwa_clid: data.conversation?.referral || null,
      tags,
      comprovante: mediaUrl,
      mensagemTexto
    },
  }

  logMsg("📤 Enviando payload para n8n...", payload)

  fetch("https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) =>
      logMsg("🎯 Payload enviado com sucesso. Status: " + res.status)
    )
    .catch((err) =>
      logMsg("❌ Erro ao enviar para o n8n: " + err.message)
    )
})

Kinbox.on("no_conversation", function () {
  logMsg("ℹ️ Nenhuma conversa ativa.")
})
