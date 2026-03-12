import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useParams } from "react-router-dom";
import { UploadCloud, FileText, CheckCircle } from "lucide-react";
import PDFPreview from "../components/PDFPreview";

function UserUpload() {
  const { shopId } = useParams();

  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Fetch shop info
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/shop/${shopId}`
        );
        setShopInfo(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchShop();
  }, [shopId]);

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Select at least one file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await axios.post(
        `http://localhost:5000/api/upload/${shopId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploadedFiles(res.data.files);
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      <Navbar />

      <div className="max-w-4xl mx-auto py-16 px-6">

        {/* ================= SHOP HEADER ================= */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 text-center">
          <h1 className="text-3xl font-bold text-indigo-700">
            {shopInfo?.shopName || "Secure Print Shop"}
          </h1>
          <p className="text-gray-500 mt-2">
            Upload your documents securely. No phone number required.
          </p>
        </div>

        {/* ================= UPLOAD CARD ================= */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <UploadCloud className="text-indigo-600" />
            Upload Documents
          </h2>

          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={(e) => {
              const selectedFiles = [...e.target.files];
              setFiles(selectedFiles);

              if (selectedFiles.length > 0) {
                setPreviewFile(URL.createObjectURL(selectedFiles[0]));
              }
            }}
            className="mb-4 w-full"
          />

          {previewFile && (
            <div className="mt-6 border rounded-xl p-4 bg-gray-50">
              <PDFPreview file={previewFile} />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>

        {/* ================= STATUS SECTION ================= */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-6">
              File Status
            </h2>

            <div className="space-y-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-50 p-4 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-indigo-600" />
                    <span>{file.fileName}</span>
                  </div>

                  <span
                    className={`px-4 py-1 rounded-full text-sm font-medium ${file.status === "printed"
                        ? "bg-green-100 text-green-700"
                        : file.status === "downloaded"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {file.status === "printed" && (
                      <CheckCircle className="inline mr-1" size={14} />
                    )}
                    {file.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserUpload;