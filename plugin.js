console.log("🔌 Plugin iniciado...");

const WEBHOOK_URL = "https://n8n.srv1025988.hstgr.cloud/webhook/kinbox/comprovantes";
const TOKEN = "ak_live_NjEvp8gn2YAax4q11bzCq7yi0LyFX5vPXPAtcEV_DglI3fSoYk";

// Utilitário para logar no painel HTML
function logToPanel(msg, data) {
  const panel = document.getElementById("log-panel");
  const entry = document.createElement("pre");
  entry.textContent = msg + (data ? " " + JSON.stringify(data, null, 2) : "");
  panel.appendChild(entry);
  panel.scrollTop = panel.scrollHeight;
}

// Extrai último comprovante (imagem/documento)
function getLastComprovante(data) {
  let mediaUrl = null;

  try {
    if (data.messages && Array.isArray(data.messages)) {
      for (let i = data.messages.length - 1; i >= 0; i--) {
        const msg = data.messages[i];
        if (msg.type === "image" && msg.image?.url) {
          mediaUrl = msg.image.url;
          break;
        }
        if (msg.type === "document" && msg.document?.url) {
          mediaUrl = msg.document.url;
          break;
        }
      }
    }
    if (!mediaUrl && data.contact?.customFields?.last_comprovante?.value) {
      mediaUrl = data.contact.customFields.last_comprovante.value;
    }
  } catch (err) {
    console.error("❌ Erro ao extrair comprovante:", err);
    logToPanel("❌ Erro ao extrair comprovante:", err);
  }

  return mediaUrl;
}

// Extrai dados do referral (Meta Ads)
function getReferralData(data) {
  let referral = {};

  try {
    if (data.messages && Array.isArray(data.messages)) {
      for (let i = data.messages.length - 1; i >= 0; i--) {
        const msg = data.messages[i];
        if (msg.referral) {
          referral = {
            ctwa_clid: msg.referral.ctwa_clid || null,
            source_id: msg.referral.source_id || null,
            source_url: msg.referral.source_url || null,
            external_id: msg.referral.external_id || null
          };
          break;
        }
      }
    }
  } catch (err) {
    console.error("❌ Erro ao extrair referral:", err);
    logToPanel("❌ Erro ao extrair referral:", err);
  }

  return referral;
}

Kinbox.on("conversation", async (data) => {
  console.log("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id
  });
  logToPanel("📩 Nova conversa recebida:", {
    contato: data.contact?.name,
    conversa: data.conversation?.id
  });

  const tags = data.conversation?.tags || [];
  console.log("🏷️ Tags recebidas:", tags);
  logToPanel("🏷️ Tags recebidas:", tags);

  const hasComprovanteTag = tags.some(t => t.id?.toString() === "41591");
  if (!hasComprovanteTag) {
    console.log("ℹ️ Tag 'Aguardando comprovante' NÃO encontrada. Ignorando envio.");
    logToPanel("ℹ️ Tag 'Aguardando comprovante' NÃO encontrada. Ignorando envio.");
    return;
  }

  console.log("✅ Tag 'Aguardando comprovante' encontrada. Prosseguindo...");
  logToPanel("✅ Tag 'Aguardando comprovante' encontrada. Prosseguindo...");

  // Extrair dados principais
  const phone = data.contact?.phone || null;
  const deal_id = data.deals ? Object.keys(data.deals)[0] : null;
  const link_comprovante = getLastComprovante(data);
  const referral = getReferralData(data);

  const payload = {
    phone,
    ctwa_clid: referral.ctwa_clid,
    source_id: referral.source_id,
    source_url: referral.source_url,
    external_id: referral.external_id,
    deal_id,
    link_comprovante
  };

  console.log("📤 Payload final:", payload);
  logToPanel("📤 Payload final:", payload);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log("✅ Webhook enviado com sucesso!");
      logToPanel("✅ Webhook enviado com sucesso!");
    } else {
      const errText = await res.text();
      console.error("❌ Erro ao enviar webhook:", res.status, errText);
      logToPanel("❌ Erro ao enviar webhook:", { status: res.status, errText });
    }
  } catch (err) {
    console.error("❌ Falha na requisição do webhook:", err);
    logToPanel("❌ Falha na requisição do webhook:", err);
  }
});
