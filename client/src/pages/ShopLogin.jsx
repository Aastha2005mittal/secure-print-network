import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Store,
  LogIn,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react";

function ShopLogin() {
  const [shopName, setShopName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/shop/login", {
        shopName: shopName.trim(),
        password: password.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("shopId", res.data.shopId);
      navigate(`/dashboard/${res.data.shopId}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid shop name or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 px-8 py-12 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Shop Login</h1>
            <p className="text-blue-100 text-sm">Access your print shop dashboard</p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Shop Name Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Shop Name
              </label>
              <input
                type="text"
                placeholder="Enter your shop name"
                value={shopName}
                onChange={(e) => {
                  setShopName(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition bg-slate-50 hover:bg-white"
                required
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition bg-slate-50 hover:bg-white"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin">⟳</div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Login to Dashboard
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">or</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              to="/shop/create"
              className="w-full border-2 border-indigo-200 text-indigo-600 py-3 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              Create New Shop Account
              <ArrowRight size={18} />
            </Link>

            {/* Security Footer */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-2">
                <Shield size={16} className="text-blue-600 flex-shrink-0 mt-1" />
                <p className="text-xs text-blue-700">
                  Your login is secured with industry-standard encryption
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShopLogin;