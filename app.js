// 🧠 Filemoon e Streamtape: extrai episódio de "_E3", "-Ep4", ".E5", etc.
function ordenarPorEpisodioPadrao(links) {
  return links
    .map(link => {
      const match = link.match(/[_\-\.\s](?:Ep|E)(\d{1,3})(?!\d)/i);
      const num = match ? parseInt(match[1]) : 0;
      return { url: link.trim(), episodio: num };
    })
    .filter(obj => obj.episodio > 0 && obj.url)
    .sort((a, b) => a.episodio - b.episodio);
}

// 🧠 DoodStream: extrai episódio do comentário HTML e mantém só o link
function ordenarDoodComComentario(links) {
  return links
    .map(linha => {
      const partes = linha.split("https://");
      const comentario = partes[0];
      const link = partes[1] ? "https://" + partes[1].trim() : "";

      const match = comentario.match(/Ep\s?(\d{1,3})/i);
      const num = match ? parseInt(match[1]) : 0;

      return { url: link, episodio: num };
    })
    .filter(obj => obj.episodio > 0 && obj.url)
    .sort((a, b) => a.episodio - b.episodio);
}

document.getElementById("gerarScript").addEventListener("click", () => {
  const qtd = parseInt(document.getElementById("qtdEp").value);

  const filemoonRaw = document.getElementById("filemoon").value.trim().split("\n");
  const streamtapeRaw = document.getElementById("streamtape").value.trim().split("\n");
  const doodRaw = document.getElementById("dood").value.trim().split("\n");

  const filemoonLinks = ordenarPorEpisodioPadrao(filemoonRaw);
  const streamtapeLinks = ordenarPorEpisodioPadrao(streamtapeRaw);
  const doodLinks = ordenarDoodComComentario(doodRaw);

  const streamingFiles = [];
  const avisos = [];

  for (let i = 0; i < qtd; i++) {
    const epNum = String(i + 1).padStart(2, "0");

    if (!filemoonLinks[i]) avisos.push(`Episódio ${i + 1}: link ausente (Filemoon)`);
    if (!streamtapeLinks[i]) avisos.push(`Episódio ${i + 1}: link ausente (Streamtape)`);
    if (!doodLinks[i]) avisos.push(`Episódio ${i + 1}: link ausente (DoodStream)`);

    streamingFiles.push({
      title: `Episódio ${epNum}`,
      episode: String(i + 1),
      files: [
        { 0: "Filemoon", 1: filemoonLinks[i]?.url || "https://filemoon.to/e/placeholder", 2: "dub" },
        { 0: "Streamtape", 1: streamtapeLinks[i]?.url || "https://streamtape.com/e/placeholder", 2: "dub" },
        { 0: "DoodStream", 1: doodLinks[i]?.url || "https://vide0.net/e/placeholder", 2: "dub" }
      ]
    });
  }

  const streamingId = "Campfire";
  const maxEpisode = String(qtd);

  const resultado = `<script>
let streamingFiles = ${JSON.stringify(streamingFiles, null, 2)};

let streamingId = '${streamingId}';
let maxEpisode = '${maxEpisode}';
</script>`;

  document.getElementById("saidaScript").value = resultado;

  const avisoExtra = document.getElementById("avisoFaltando");
  if (avisos.length > 0) {
    avisoExtra.innerHTML = "⚠️ Links ausentes:<br>" + avisos.join("<br>");
    avisoExtra.style.color = "red";
  } else {
    avisoExtra.innerHTML = "✅ Todos os episódios estão completos!";
    avisoExtra.style.color = "green";
  }
});

// 📋 Copiar
document.getElementById("copiarCodigo").addEventListener("click", () => {
  const campo = document.getElementById("saidaScript");
  campo.select();
  document.execCommand("copy");
  alert("✅ Código copiado!");
});

// 💾 Baixar
document.getElementById("baixarCodigo").addEventListener("click", () => {
  const conteudo = document.getElementById("saidaScript").value;
  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "streamingFiles.txt";
  link.click();
});