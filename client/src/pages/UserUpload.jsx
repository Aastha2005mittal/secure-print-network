import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Send,
  Lock,
  Zap,
  Trash2,
  Eye,
  Clock,
  Shield,
  MessageCircle,
  File,
  AlertCircle,
  Download,
  X,
} from "lucide-react";
import PDFPreview from "../components/PDFPreview";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function UserUpload() {
  const { shopId } = useParams();

  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  const [name, setName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [showNameModal, setShowNameModal] = useState(true);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // ================= SOCKET =================
  useEffect(() => {
    socket.emit("join_room", shopId);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [shopId]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      shopId,
      sender: name || "Anonymous",
      message,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  // ================= FETCH SHOP =================
  useEffect(() => {
    const fetchShop = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/shop/${shopId}`);
        setShopInfo(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchShop();
  }, [shopId]);

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    const invalidFiles = files.filter((f) => f.type !== "application/pdf");
    if (invalidFiles.length > 0) {
      alert("Only PDF files are allowed");
      return;
    }

    const oversizedFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert("Each file must be under 5MB");
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

      setUploadedFiles([...uploadedFiles, ...res.data.files]);
      setFiles([]);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ================= DRAG AND DROP =================
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = [...e.dataTransfer.files];
    const pdfFiles = droppedFiles.filter((f) => f.type === "application/pdf");
    if (pdfFiles.length > 0) {
      setFiles([...files, ...pdfFiles]);
    }
  };

  // ================= NAME MODAL =================
  if (showNameModal && !isNameSet) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Welcome</h2>
            <p className="text-slate-600 text-sm mt-2">
              Enter your name to start uploading securely
            </p>
          </div>

          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (setIsNameSet(true), setShowNameModal(false))}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none mb-4 transition"
          />

          <button
            onClick={() => {
              setIsNameSet(true);
              setShowNameModal(false);
            }}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Continue
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Your name will be used for shop communication only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {shopInfo?.shopName || "Print Shop"}
                </h1>
                <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
                  <Lock size={14} />
                  Secure Upload Portal
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Welcome back</p>
              <p className="font-semibold">{name || "User"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Upload Section */}
        <div className="flex-1 overflow-y-auto border-r border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto p-6 sm:p-8">
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 mb-8 ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 bg-slate-50 hover:border-slate-400"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center">
                  <UploadCloud
                    size={40}
                    className="text-indigo-600"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {dragActive ? "Drop files here" : "Drop PDFs or click to upload"}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6">
                    Only PDF files • Max 5MB per file
                  </p>
                </div>

                <label className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all cursor-pointer font-semibold inline-block">
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    hidden
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files).filter(
                        (f) => f.type === "application/pdf"
                      );
                      setFiles([...files, ...selectedFiles]);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mb-8 bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <File size={20} className="text-blue-600" />
                  Selected Files ({files.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">
                            {file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFiles(files.filter((_, i) => i !== idx))
                        }
                        className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin">⟳</div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Upload {files.length} {files.length === 1 ? "File" : "Files"}
                    </>
                  )}
                </button>

                {uploading && (
                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full w-2/3 animate-pulse"></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      Encrypting and uploading your files securely...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Uploaded Files History */}
            {uploadedFiles.length > 0 && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600" />
                  Successfully Uploaded ({uploadedFiles.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-100"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle size={18} className="text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 text-sm">
                            {file.fileName || file.name}
                          </p>
                          <p className="text-xs text-green-600">
                            ✓ {file.status || "Uploaded"}
                          </p>
                        </div>
                      </div>
                      <Clock size={16} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <Shield size={20} className="text-blue-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Encrypted</p>
                <p className="text-xs text-slate-600">End-to-end protection</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <Lock size={20} className="text-purple-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Anonymous</p>
                <p className="text-xs text-slate-600">No data storage</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <Clock size={20} className="text-green-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Auto Delete</p>
                <p className="text-xs text-slate-600">Cleans up nightly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Section */}
        <div className="hidden lg:flex lg:w-96 flex-col bg-slate-900 text-white border-l border-slate-700">
          {/* Chat Header */}
          <div className="border-b border-slate-700 p-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-indigo-400" />
              <h2 className="font-bold text-lg">Shop Chat</h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Real-time communication with shop staff
            </p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
                <MessageCircle size={40} className="opacity-30 mb-2" />
                <p>No messages yet</p>
                <p className="text-xs text-slate-600">Start chatting with the shop</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    msg.sender === name ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      msg.sender === name
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-700 text-slate-100"
                    }`}
                  >
                    <p className="text-xs font-semibold opacity-70">
                      {msg.sender}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-50 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))
            )}

            {uploadedFiles.map((file, index) => (
              <div key={`file-${index}`} className="flex gap-2">
                <div className="bg-green-600/20 border border-green-500 text-green-200 max-w-xs px-3 py-2 rounded-lg">
                  <p className="text-xs font-semibold flex items-center gap-2">
                    <CheckCircle size={14} /> File Uploaded
                  </p>
                  <p className="text-sm truncate">{file.fileName || file.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-slate-700 p-4 bg-slate-950">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Message..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition text-white flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserUpload;