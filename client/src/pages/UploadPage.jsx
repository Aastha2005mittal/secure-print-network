import React, { useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function UploadPage() {
  const { shopId } = useParams();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be under 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      await API.post(`/api/upload/${shopId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("File uploaded securely ✅");
      setFile(null);
    } catch (error) {
      setMessage("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Secure Print Upload
        </h2>

        <p className="text-center text-gray-500 mb-6 text-sm">
          Upload your PDF anonymously for printing
        </p>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Uploading..." : "Upload Securely"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default UploadPage;