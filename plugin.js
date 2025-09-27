Kinbox.on("conversation", function (data) {
  logMsg("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id,
    ultimaMensagem: data.conversation?.lastMessage || "⚠️ Sem mensagem"
  })

  const conversaId = data.conversation?.id
  const tags = data.conversation?.tags || []

  // só dispara se tiver a tag comprovante
  const temTagComprovante = tags.some(t => String(t.name || "").toLowerCase().includes("comprovante"))

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

  try {
    const parsed = JSON.parse(ultimaMensagem.content)
    const insert = parsed[0]?.insert
    if (insert?.image) mediaUrl = insert.image
    if (insert?.document) mediaUrl = insert.document
    if (insert?.audio) mediaUrl = insert.audio
  } catch (e) {
    logMsg("❌ Erro ao tentar ler conteúdo da mensagem: " + e.message)
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
    },
  }

  logMsg("📤 Enviando comprovante e dados extras para n8n...", payload)

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
