import { useState } from "react";

export default function UploadImage({ onUploadComplete }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadImage = async () => {
    if (!image) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", image);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    );

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onUploadComplete?.(data.secure_url);
      setImage(null);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setImage(e.target.files[0]);
          setError("");
        }}
        style={{
          width: "100%",
          padding: "8px",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          marginBottom: "8px",
        }}
      />

      <button
        onClick={uploadImage}
        disabled={loading || !image}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: loading || !image ? "#94a3b8" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading || !image ? "not-allowed" : "pointer",
          fontSize: "14px",
        }}
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>

      {error && (
        <div style={{ color: "#dc2626", marginTop: "8px", fontSize: "14px" }}>
          {error}
        </div>
      )}
    </div>
  );
}