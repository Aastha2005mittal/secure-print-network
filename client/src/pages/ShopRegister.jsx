import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Lock,
  Store,
  UserPlus,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
} from "lucide-react";

function ShopRegister() {
  const [shopName, setShopName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!shopName.trim()) {
      setError("Shop name is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/shop/create", {
        shopName: shopName.trim(),
        password,
      });

      if (res?.data?.success) {
        navigate("/shop/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (() => {
    if (password.length === 0) return "none";
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  })();

  const passwordMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 flex items-center justify-center p-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <form
          onSubmit={handleRegister}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 px-8 py-12 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Store size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Shop</h1>
            <p className="text-green-100 text-sm">Set up your print shop account</p>
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
              <div className="relative">
                <Store
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="My Print Shop"
                  value={shopName}
                  onChange={(e) => {
                    setShopName(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition bg-slate-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition bg-slate-50 hover:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordStrength === "weak"
                          ? "w-1/3 bg-red-500"
                          : passwordStrength === "medium"
                          ? "w-2/3 bg-yellow-500"
                          : "w-full bg-green-500"
                      }`}
                    >.</div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">
                    {passwordStrength === "weak"
                      ? "Weak"
                      : passwordStrength === "medium"
                      ? "Medium"
                      : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-10 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:outline-none transition bg-slate-50 hover:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordMatch && (
                <div className="mt-2 flex items-center gap-2 text-green-600">
                  <CheckCircle size={16} />
                  <span className="text-xs font-medium">Passwords match</span>
                </div>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin">⟳</div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Shop Account
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">have account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/shop/login"
              className="w-full border-2 border-green-200 text-green-600 py-3 rounded-xl hover:bg-green-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              Login Instead
              <ArrowRight size={18} />
            </Link>

            {/* Security Note */}
            <div className="mt-6 bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-2">
                <Shield size={16} className="text-green-600 flex-shrink-0 mt-1" />
                <p className="text-xs text-green-700">
                  Your data is encrypted and secured
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ShopRegister;