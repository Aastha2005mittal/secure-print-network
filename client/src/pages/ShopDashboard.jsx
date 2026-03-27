import React, { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../components/StatsCard";
import FileTable from "../components/FileTable";
import QRSection from "../components/QRSection";
import {
  RefreshCcw,
  Store,
  LogOut,
  BarChart3,
  FileText,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const ShopDashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopInfo, setShopInfo] = useState(null);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todayUploads: 0,
    totalPrints: 0,
    pendingFiles: 0,
  });

  const handleDelete = (id) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
  };

  const { shopId } = useParams();

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/files/shop/${shopId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFiles(res.data.files || res.data || []);
      setStats(
        res.data.stats || {
          todayUploads: 0,
          totalPrints: 0,
          pendingFiles: 0,
        }
      );

      // Fetch shop info
      if (!shopInfo) {
        const shopRes = await axios.get(
          `http://localhost:5000/shop/${shopId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setShopInfo(shopRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchDashboard();
    }
  }, [shopId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("shopId");
    navigate("/shop/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* ================= HEADER ================= */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Store size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {shopInfo?.shopName || "Shop Dashboard"}
                </h1>
                <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
                  <CheckCircle size={14} />
                  System Active
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 font-semibold"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today's Uploads */}
          <div className="bg-white rounded-2xl p-6 border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Today's Uploads</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.todayUploads}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total Prints */}
          <div className="bg-white rounded-2xl p-6 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Prints</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.totalPrints}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending Files */}
          <div className="bg-white rounded-2xl p-6 border-l-4 border-yellow-500 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stats.pendingFiles}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-6 border-l-4 border-indigo-500 shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Status</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">Running</p>
                <p className="text-xs text-green-600 mt-2 font-semibold">● Online</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= QR SECTION ================= */}
        <div className="mb-8">
          <QRSection shopId={shopId} />
        </div>

        {/* ================= FILES TABLE ================= */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-slate-200 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Uploaded Files
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {files.length} total file{files.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <button
                onClick={fetchDashboard}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <RefreshCcw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="p-8">
            {files.length > 0 ? (
              <FileTable files={files} onDelete={handleDelete} />
            ) : (
              <div className="text-center py-12">
                <FileText
                  size={48}
                  className="text-slate-300 mx-auto mb-4"
                />
                <p className="text-slate-600 text-lg font-medium">
                  No files uploaded yet
                </p>
                <p className="text-slate-400 text-sm">
                  Files will appear here when users upload documents
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDashboard;