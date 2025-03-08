// Global state to store selected files
let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const mainButton = document.getElementById('mainUploadButton');
    const fileList = document.getElementById('fileList');
    const uploadForm = document.getElementById('uploadForm');

    fileInput.addEventListener('change', handleFileSelect);
    
    // Prevent form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        return false;
    });

    function handleFileSelect(event) {
        selectedFiles = Array.from(event.target.files);
        updateFileList();
        updateMainButton();
    }

    function updateMainButton() {
        const buttonText = document.querySelector('#mainUploadButton .button-text');
        if (selectedFiles.length > 1) {
            buttonText.textContent = `Enviar Todos (${selectedFiles.length})`;
            mainButton.style.display = 'block';
        } else if (selectedFiles.length === 1) {
            buttonText.textContent = 'Enviar';
            mainButton.style.display = 'none';
        } else {
            mainButton.style.display = 'none';
        }
    }

    function updateFileList() {
        fileList.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'file-name';
            nameSpan.textContent = file.name;
            
            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'file-size';
            sizeSpan.textContent = formatFileSize(file.size);
            
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';
            
            const progress = document.createElement('progress');
            progress.value = 0;
            progress.max = 100;
            
            const status = document.createElement('span');
            status.className = 'status';
            
            const uploadButton = document.createElement('button');
            uploadButton.type = 'button'; // Explicitly set button type
            uploadButton.className = 'item-upload-button';
            uploadButton.innerHTML = '<span class="button-text">Enviar</span>';
            uploadButton.onclick = (e) => {
                e.preventDefault();
                uploadSingleFile(file, progress, status);
            };
            
            const removeButton = document.createElement('button');
            removeButton.type = 'button'; // Explicitly set button type
            removeButton.className = 'remove-button';
            removeButton.innerHTML = '×';
            removeButton.onclick = (e) => {
                e.preventDefault();
                removeFile(index);
            };
            
            progressContainer.appendChild(progress);
            progressContainer.appendChild(status);
            
            fileDiv.appendChild(nameSpan);
            fileDiv.appendChild(sizeSpan);
            fileDiv.appendChild(progressContainer);
            fileDiv.appendChild(uploadButton);
            fileDiv.appendChild(removeButton);
            
            fileList.appendChild(fileDiv);
        });
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        updateFileList();
        updateMainButton();
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function uploadSingleFile(file, progressBar, statusElement) {
        const formData = new FormData();
        formData.append('arquivo', file);
        
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressBar.value = percentComplete;
                statusElement.textContent = Math.round(percentComplete) + '%';
            }
        };
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                statusElement.textContent = 'Completo ✓';
                statusElement.style.color = 'var(--success-color)';
                removeFile(selectedFiles.indexOf(file));
            } else {
                statusElement.textContent = 'Erro ✗';
                statusElement.style.color = 'var(--error-color)';
            }
        };
        
        xhr.onerror = () => {
            statusElement.textContent = 'Erro ✗';
            statusElement.style.color = 'var(--error-color)';
        };
        
        xhr.open('POST', '/upload', true);
        xhr.send(formData);
    }

    // Function to upload all files
    window.uploadFiles = function(e) {
        if (e) e.preventDefault();
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach(fileItem => {
            const index = Array.from(fileItems).indexOf(fileItem);
            const file = selectedFiles[index];
            const progress = fileItem.querySelector('progress');
            const status = fileItem.querySelector('.status');
            uploadSingleFile(file, progress, status);
        });
    };
});
