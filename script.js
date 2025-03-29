let selectedFile = null;

function handleUpload() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const fileNameDisplay = document.getElementById("fileName");

    if (!selectedFile) {
        fileInput.click(); // Open file selection dialog
    } else {
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
    const successMessage = document.getElementById("successMessage");

    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    status.innerText = "Uploading...";

    try {
        const response = await fetch("https://3d-core.vercel.app/upload", { // Replace with actual backend URL
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            status.innerText = "Upload successful!";
            successMessage.style.display = "block";
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 5000);
        } else {
            status.innerText = "Upload failed: " + data.error;
        }
    } catch (error) {
        console.error("Upload error:", error);
        status.innerText = "Upload failed due to an error.";
    }
}
