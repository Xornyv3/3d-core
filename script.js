let selectedFile = null;

function handleUpload() {
    const fileInput = document.getElementById("fileInput");
    const uploadButton = document.getElementById("uploadButton");
    const fileNameDisplay = document.getElementById("fileName");
    const successMessage = document.getElementById("successMessage");

    if (!selectedFile) {
        fileInput.click(); // Open file selection dialog
    } else {
        // Show success message as soon as the button is clicked
        successMessage.style.display = "block";
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 5000);

        uploadFile(); // Proceed with file upload
    }

    fileInput.onchange = function () {
        if (fileInput.files.length > 0) {
            selectedFile = fileInput.files[0];
            const allowedExtensions = [".stl", ".step", ".gcode", ".3mf"];
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(`.${fileExtension}`)) {
                alert("Invalid file type. Please upload a .stl, .step, .gcode, or .3mf file.");
                selectedFile = null;
                fileNameDisplay.innerText = "";
                uploadButton.innerText = "Select File";
                return;
            }

            fileNameDisplay.innerText = `Selected: ${selectedFile.name}`;
            uploadButton.innerText = "Upload File";
        }
    };
}

async function uploadFile() {
    const status = document.getElementById("status");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");

    if (!selectedFile) {
        alert("Please select a file first.");
        return;
    }

    if (!emailInput.value && !phoneInput.value) {
        alert("Please provide an email or phone number.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", emailInput.value);
    formData.append("phone", phoneInput.value);

    status.innerText = "Uploading...";

    const response = await fetch("https://3d-core.vercel.app/upload", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (data.success) {
        status.innerText = "Upload successful!";

        // Reset inputs after successful upload
        emailInput.value = "";
        phoneInput.value = "";
        fileNameDisplay.innerText = "";
        uploadButton.innerText = "Select File";
        selectedFile = null;
    } else {
        status.innerText = "Upload failed: " + (data.error || "Unknown error");
    }
}
