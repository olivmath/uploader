const express = require("express");
const qrcode = require("qrcode");
const multer = require("multer");
const path = require("path");
const os = require("os");
const cliProgress = require("cli-progress");
const colors = require("ansi-colors");

const app = express();
const port = 3000;

// Create progress bar
const multibar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: colors.cyan('{bar}') + ' | {filename} | {percentage}% | {value}/{total} ' + colors.cyan('{unit}'),
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
}, cliProgress.Presets.shades_classic);

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
app.post("/upload", (req, res) => {
  const progressBars = new Map();
  
  // Handle file upload after tracking progress
  const fileHandler = upload.single("arquivo");

  req.on('data', (chunk) => {
    const fieldname = req.headers['content-disposition']?.match(/name="([^"]+)"/)?.[1];
    if (!progressBars.has(fieldname)) {
      const contentLength = parseInt(req.headers['content-length']);
      const filename = req.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] || 'Unknown file';
      const bar = multibar.create(contentLength, 0, {
        filename: filename,
        unit: 'bytes'
      });
      progressBars.set(fieldname, { bar, progress: 0, total: contentLength });
    }

    const progress = progressBars.get(fieldname);
    progress.progress += chunk.length;
    progress.bar.update(progress.progress);
  });

  fileHandler(req, res, (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(500).send("Error uploading file");
    }

    // Complete progress bars
    progressBars.forEach(({ bar, progress, total }) => {
      bar.update(total);
      bar.stop();
    });

    // Log file information
    console.log("\n✅ Download Completed");
    console.log(`👀 Nome: ${req.file.originalname}`);
    console.log(`💽 Tamanho: ${formatarTamanhoArquivo(req.file.size)}`);
    console.log(`💾 Salvo em: ${req.file.destination}`);

    res.send("Arquivo recebido!");
  });
});

const IP = getLocalIPAddress(); // Obtém o endereço IP local

app.listen(port, IP, () => {
  console.log(`Servidor rodando em http://${IP}:${port}`);

  qrcode.toString(`http://${IP}:${port}`, { type: "terminal" }, (err, qr) => {
    if (err) throw err;
    console.log(qr);
  });
  console.log("\nAguardando uploads... O progresso será mostrado abaixo:");
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
