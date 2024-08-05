const express = require("express");
const multer = require("multer");
const os = require("os"); // Importando o módulo os
const app = express();
const port = 3000;

// Configuração do Multer (Definindo o diretório de destino dos uploads)
const upload = multer({ dest: "uploads/" });

app.use(express.static("public")); // Para servir arquivos estáticos como o HTML

// Rota para exibir o formulário de upload
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Rota para lidar com o upload do arquivo
// O nome 'arquivo' deve corresponder ao nome do campo no formulário HTML
app.post("/upload", upload.single("arquivo"), (req, res) => {
  console.log(req.file); // Informações do arquivo enviado
  res.send("Arquivo recebido!");
});

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

const IP = getLocalIPAddress(); // Obtém o endereço IP local

app.listen(port, IP, () => {
  console.log(`Servidor rodando em http://${IP}:${port}`);
});
