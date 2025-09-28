<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Plugin Kinbox - Última Mídia</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      padding: 15px;
    }
    #logs {
      background: #fff;
      border: 1px solid #ddd;
      padding: 10px;
      height: 600px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 13px;
      white-space: pre-wrap;
    }
    img {
      max-width: 250px;
      display: block;
    }
    .warn {
      color: orange;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>📡 Plugin Kinbox – Captura Última Mídia</h2>
  <p>Somente ativa quando a tag <b>Aguardando comprovante</b> (ID: 41591) estiver presente.</p>
  <div id="logs"></div>

  <script>
    // 🔥 Cache-buster automático
    const script = document.createElement("script");
    script.src = "plugin.js?v=" + new Date().getTime();
    document.body.appendChild(script);

    // ⏳ Timeout para verificar se eventos chegaram
    let eventReceived = false;

    window.addEventListener("message", (event) => {
      if (event.data?.event === "conversation") {
        eventReceived = true;
      }
    });

    setTimeout(() => {
      if (!eventReceived) {
        const logContainer = document.getElementById("logs");
        const warnMsg = document.createElement("div");
        warnMsg.className = "warn";
        warnMsg.textContent = "⚠️ Nenhum evento recebido do Kinbox nos últimos 10s.\nVerifique se o plugin está configurado corretamente.";
        logContainer.appendChild(warnMsg);
      }
    }, 10000);
  </script>
</body>
</html>
