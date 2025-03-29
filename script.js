// Function to trigger file selection
function selectFile() {
    document.getElementById('fileInput').click();
  }
  
  // Listen for file input changes
  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;
      document.getElementById('selectedFileName').innerHTML =
        'Selected: <span style="color: #60a5fa;">' + fileName + '</span>';
      
      // Change button text to "Upload File" and set click handler to upload
      const uploadBtn = document.getElementById('uploadBtn');
      uploadBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        Upload File
      `;
      uploadBtn.onclick = uploadFile;
    }
  });
  
  // Function to upload file to backend
  async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const status = document.getElementById('status');
    if (!file) {
      alert('Please select a file first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    status.innerText = 'Uploading...';
  
    try {
      // Replace with your actual backend URL (if needed)
      const response = await fetch('https://3d-core.vercel.app/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        status.innerText = 'Upload successful!';
        // Show success message popup
        const successMessage = document.getElementById('successMessage');
        successMessage.style.display = 'flex';
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 3000);
      } else {
        status.innerText = 'Upload failed: ' + (data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      status.innerText = 'Upload failed: ' + error.message;
    }
  
    // Reset file input and UI
    fileInput.value = '';
    document.getElementById('selectedFileName').innerHTML = '';
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      Select File
    `;
    uploadBtn.onclick = selectFile;
  }
  
