function uploadFile() {
  var form = document.getElementById("uploadForm");
  var formData = new FormData(form);
  var xhr = new XMLHttpRequest();

  var progress = document.getElementById("uploadProgress");
  // Mostra a barra de progresso ao iniciar o upload
  progress.style.display = "block"; // Make it visible

  xhr.upload.onprogress = function (e) {
    if (e.lengthComputable) {
      var percentComplete = (e.loaded / e.total) * 100;
      progress.value = percentComplete;
    }
  };

  xhr.onload = function () {
    if (xhr.status == 200) {
      alert("Upload completo!");
      progress.value = 0; // Reset progress bar
      progress.style.display = "none"; // Hide it again
    } else {
      alert("Erro no upload: " + xhr.status);
    }
  };

  xhr.open("POST", "/upload", true);
  xhr.send(formData);
}
