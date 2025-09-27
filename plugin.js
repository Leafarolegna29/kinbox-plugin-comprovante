Kinbox.on("conversation", function (data) {
  logMsg("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id,
    sessao: data.session?._id, // agora temos o id string correto
  })

  const sessaoId = data.session?._id
  if (!sessaoId) {
    logMsg("⚠️ Nenhum _id de sessão encontrado.")
    return
  }

  const payload = {
    token: "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk",
    contato: {
      id: data.contact?.id,
      nome: data.contact?.name,
      telefone: data.contact?.phone,
    },
    metadata: {
      sessaoId, // string (MongoID)
      conversaId: data.conversation?.id, // numérico (mantém para referência)
      tags: data.conversation?.tags || [],
    },
  }

  logMsg("📤 Enviando ID da sessão para n8n...", payload)

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
