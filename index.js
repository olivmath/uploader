const express = require("express");
const qrcode = require("qrcode");
const multer = require("multer");
const path = require("path");
const os = require("os");
const app = express();
const port = 3000;

// Configuração do Multer (Definindo o diretório de destino dos uploads e usando o nome original)
const upload = multer({
  dest: "uploads/",
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const downloadsPath = path.join(os.homedir(), "Downloads");
      cb(null, downloadsPath); // Diretório de destino
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Usando o nome original do arquivo
    },
  }),
});

app.use(express.static("public")); // Para servir arquivos estáticos como o HTML

// Rota para exibir o formulário de upload
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Rota para lidar com o upload do arquivo
// O nome 'arquivo' deve corresponder ao nome do campo no formulário HTML
app.post("/upload", upload.single("arquivo"), (req, res) => {
  // Informações do arquivo enviado
  console.log("✅ Download Completed");
  console.log(`👀 Nome: ${req.file.originalname}`);
  console.log(`💽 Tamanho: ${formatarTamanhoArquivo(req.file.size)}`);
  console.log(`💾 Salvo em: ${req.file.destination}`);

  res.send("Arquivo recebido!");
});

const IP = getLocalIPAddress(); // Obtém o endereço IP local

app.listen(port, IP, () => {
  console.log(`Servidor rodando em http://${IP}:${port}`);

  qrcode.toString(`http://${IP}:${port}`, { type: "terminal" }, (err, qr) => {
    if (err) throw err;
    console.log(qr);
  });
});

/// UTILS

// Função para formatar o tamanho de um arquivo em bytes para o padrão human-readable (KB, MB, GB, etc.)
function formatarTamanhoArquivo(bytes) {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}

// Função para encontrar o endereço IP local
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === "IPv4" && alias.address !== "127.0.0.1") {
        return alias.address;
      }
    }
  }

  return "0.0.0.0";
}
