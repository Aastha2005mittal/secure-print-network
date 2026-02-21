import { useParams } from "react-router-dom";
import { useState } from "react";
import API from "../services/api";

function UploadPage() {
  const { shopId } = useParams();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    // File validation
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
      const res = await API.post(`/upload/${shopId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("File uploaded successfully ✅");
      setFile(null);
    } catch (error) {
      setMessage("Upload failed ❌");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-bold mb-4 text-center">
          Upload File for Printing
        </h2>

        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default UploadPage;