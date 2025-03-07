function createProgressElement(fileName) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-item';
    
    const nameSpan = document.createElement('span');
    nameSpan.textContent = fileName;
    
    const progress = document.createElement('progress');
    progress.value = 0;
    progress.max = 100;
    
    const status = document.createElement('span');
    status.className = 'status';
    
    fileDiv.appendChild(nameSpan);
    fileDiv.appendChild(progress);
    fileDiv.appendChild(status);
    
    return { fileDiv, progress, status };
}

function uploadFiles() {
    const form = document.getElementById("uploadForm");
    const fileList = document.getElementById("fileList");
    const files = form.querySelector('input[type="file"]').files;
    
    if (files.length === 0) {
        alert("Por favor, selecione pelo menos um arquivo.");
        return;
    }
    
    fileList.innerHTML = ''; // Clear previous uploads
    
    Array.from(files).forEach(file => {
        const formData = new FormData();
        formData.append('arquivo', file);
        
        const { fileDiv, progress, status } = createProgressElement(file.name);
        fileList.appendChild(fileDiv);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progress.value = percentComplete;
                status.textContent = `${Math.round(percentComplete)}%`;
            }
        };
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                status.textContent = "Completo ✓";
                status.style.color = "green";
            } else {
                status.textContent = "Erro ✗";
                status.style.color = "red";
                console.error(`Error uploading ${file.name}: ${xhr.status}`);
            }
        };
        
        xhr.onerror = function() {
            status.textContent = "Erro ✗";
            status.style.color = "red";
            console.error(`Error uploading ${file.name}`);
        };
        
        xhr.open("POST", "/upload", true);
        xhr.send(formData);
    });
}
