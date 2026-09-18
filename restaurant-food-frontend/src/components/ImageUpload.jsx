import React, { useState } from "react";

const ImageUpload = ({ onFileSelect, initialPreview = null, label = "Upload Image" }) => {
    const [preview, setPreview] = useState(initialPreview);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError("");

        // Check file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            setError("Only JPG, JPEG, PNG, and WEBP formats are allowed");
            return;
        }

        // Check file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setPreview(URL.createObjectURL(file));
        if (onFileSelect) {
            onFileSelect(file);
        }
    };

    return (
        <div className="image-upload-wrapper">
            <label className="form-label">{label}</label>
            <div className="image-upload-box">
                {preview ? (
                    <div className="image-preview-container">
                        <img src={preview} alt="Preview" className="image-preview" />
                    </div>
                ) : (
                    <div className="image-upload-placeholder">
                        <span className="upload-icon">📷</span>
                        <span>Click to choose an image (Max 5MB)</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileChange}
                    className="file-input"
                />
            </div>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
};

export default ImageUpload;
