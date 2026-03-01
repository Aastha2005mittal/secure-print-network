import React, { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../components/StatsCard";
import FileTable from "../components/FileTable";
import QRSection from "../components/QRSection";
import { RefreshCcw } from "lucide-react";
import { useParams } from "react-router-dom";

const ShopDashboard = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    todayUploads: 0,
    totalPrints: 0,
  });

    const { shopId } = useParams();

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/files/shop/${shopId}`
      );
      setFiles(res.data.files);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome to Shop Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Uploads Today" value={stats.todayUploads} />
        <StatsCard title="Total Prints Today" value={stats.totalPrints} />
        <StatsCard title="Room Status" value="Active" />
      </div>

      {/* QR Section */}
      <QRSection shopId={shopId} />

      {/* Files Section */}
      <div className="bg-white p-6 rounded-xl shadow-md mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Uploaded Files</h2>
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCcw size={18} /> Refresh
          </button>
        </div>
        <FileTable files={files} />
      </div>
    </div>
  );
};

export default ShopDashboard;