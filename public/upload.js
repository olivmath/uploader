function uploadFile() {
    var form = document.getElementById('uploadForm');
    var formData = new FormData(form);
    var xhr = new XMLHttpRequest();

    // Configura a barra de progresso
    var progress = document.getElementById('uploadProgress');
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            var percentComplete = (e.loaded / e.total) * 100;
            progress.value = percentComplete;
        }
    };

    xhr.onload = function() {
        if (xhr.status == 200) {
            alert("Upload completo!");
            progress.value = 0; // Resetar a barra de progresso
        } else {
            alert("Erro no upload: " + xhr.status);
        }
    };

    xhr.open('POST', '/upload', true);
    xhr.send(formData);
}
