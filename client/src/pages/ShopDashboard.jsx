import React, { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../components/StatsCard";
import FileTable from "../components/FileTable";
import QRSection from "../components/QRSection";
import { RefreshCcw, Store } from "lucide-react";
import { useParams } from "react-router-dom";

const ShopDashboard = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    todayUploads: 0,
    totalPrints: 0,
  });

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
      setStats(res.data.stats || { todayUploads: 0, totalPrints: 0 });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Store className="text-indigo-600" />
            Shop Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Manage uploads, monitor activity, and print files easily.
          </p>
        </div>

        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          Active
        </span>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <StatsCard title="Uploads Today" value={stats.todayUploads} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <StatsCard title="Total Prints Today" value={stats.totalPrints} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <StatsCard title="System Status" value="Running" />
        </div>
      </div>

      {/* ================= QR SECTION ================= */}
      <div className="mb-10">
        <QRSection shopId={shopId} />
      </div>

      {/* ================= FILES TABLE ================= */}
      <div className="bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Uploaded Files
          </h2>

          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <FileTable files={files} />
      </div>
    </div>
  );
};

export default ShopDashboard;