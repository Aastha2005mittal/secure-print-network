import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({});
  const [shops, setShops] = useState([]);
  const [shopName, setShopName] = useState("");

  const fetchStats = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/admin/stats",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setStats(res.data);
  };

  const fetchShops = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/shops/all",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setShops(res.data);
  };

  useEffect(() => {
    fetchStats();
    fetchShops();
  }, []);

  const createShop = async () => {
    await axios.post(
      "http://localhost:5000/api/shops/create",
      { shopName },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setShopName("");
    fetchShops();
    fetchStats();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/api/admin/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">
        Secure Network Print Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Shops</h2>
          <p className="text-2xl font-bold">{stats.totalShops}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Files</h2>
          <p className="text-2xl font-bold">{stats.totalFiles}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Pending</h2>
          <p className="text-2xl font-bold text-yellow-500">
            {stats.pendingFiles}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Printed</h2>
          <p className="text-2xl font-bold text-green-500">
            {stats.printedFiles}
          </p>
        </div>
      </div>

      {/* Create Shop */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Shop</h2>
        <div className="flex gap-4">
          <input
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Enter Shop Name"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={createShop}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Create
          </button>
        </div>
      </div>

      {/* Shop List */}
      <div className="grid grid-cols-3 gap-6">
        {shops.map((shop) => (
          <div
            key={shop.id}
            className="bg-white p-6 rounded-xl shadow"
          >
            <h3 className="text-lg font-semibold mb-2">
              {shop.shop_name}
            </h3>

            <QRCodeCanvas
              value={`http://localhost:5173/api/upload/${shop.id}`}
              size={120}
            />
          </div>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-8 bg-red-500 text-white px-6 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default AdminDashboard;