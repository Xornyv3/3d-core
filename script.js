let selectedFile = null;

function handleUpload() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const fileNameDisplay = document.getElementById("fileName");
    const successMessage = document.getElementById("successMessage");

    if (!selectedFile) {
        fileInput.click(); // Open file selection dialog
    } else {
        // Show success message as soon as the button is clicked, regardless of upload status
        successMessage.style.display = "block";
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 5000); // Show for 5 seconds

        uploadFile(); // Proceed with file upload
    }

    fileInput.onchange = function () {
        if (fileInput.files.length > 0) {
            selectedFile = fileInput.files[0];
            fileNameDisplay.innerText = `Selected: ${selectedFile.name}`;
            uploadButton.innerText = "Upload File";
        }
    };
}

async function uploadFile() {
    const status = document.getElementById("status");

    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    status.innerText = "Uploading...";

    const response = await fetch("https://3d-core.vercel.app/upload", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (data.success) {
        status.innerText = "Upload successful!";
    } else {
        status.innerText = "Upload failed: " + data.error;
    }
}
