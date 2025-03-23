<?php
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["file"])) {
    $target_dir = "uploads/";
    $file_name = basename($_FILES["file"]["name"]);
    $target_file = "{$target_dir}{$file_name}";
    $file_type = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    // Allowed file types
    $allowed_types = ["step", "stl"];
    if (!in_array($file_type, $allowed_types)) {
        die("Invalid file type. Only STEP and STL are allowed.");
    }

    // Create uploads directory if not exists
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    // Move file to the uploads directory
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        // Send email notification
        $to = "alaguiabdoullah@gmail.com";  // Replace with your email
        $subject = "New 3D File Uploaded";
        $message = "A new file has been uploaded: " . $file_name . "\nDownload: " . $_SERVER['HTTP_HOST'] . "/uploads/" . $file_name;
        $headers = "From: no-reply@yourdomain.com";

        mail($to, $subject, $message, $headers);
        echo "File uploaded successfully!";
    } else {
        echo "Error uploading file.";
    }
}
