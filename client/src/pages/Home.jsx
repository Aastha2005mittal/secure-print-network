import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Shield,
  Zap,
  Lock,
  Cloud,
  FileUp,
  Users,
  ArrowRight,
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full mb-6 border border-blue-200">
            <Shield size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Enterprise-Grade Security
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
            Anonymous & Secure<br />Printing System
          </h1>

          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload documents securely without sharing personal information. Complete
            privacy with bank-level encryption and automatic cleanup.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/api/upload/c6982d95-db05-4ab2-ba81-34db93fc8a0a"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 font-semibold text-lg group"
            >
              <FileUp size={20} />
              Start Uploading
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>

            <Link
              to="/api/admin/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 font-semibold text-lg"
            >
              <Users size={20} />
              Admin Dashboard
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/60 backdrop-blur px-4 py-3 rounded-lg border border-white/80">
              <p className="text-sm font-medium text-slate-900">🔒 End-to-End Encrypted</p>
            </div>
            <div className="bg-white/60 backdrop-blur px-4 py-3 rounded-lg border border-white/80">
              <p className="text-sm font-medium text-slate-900">⚡ Lightning Fast</p>
            </div>
            <div className="bg-white/60 backdrop-blur px-4 py-3 rounded-lg border border-white/80">
              <p className="text-sm font-medium text-slate-900">🗑️ Auto-Cleanup</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Features Built for Privacy
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need for secure, anonymous document printing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-xl transition-all duration-300 border border-blue-200 hover:border-blue-400">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Instant QR Upload
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Scan shop QR code and upload instantly. No logins, no identity
                verification. Just upload and go.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-200 hover:border-purple-400">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Bank-Level Security
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Military-grade encryption ensures your documents are protected
                from unauthorized access and breaches.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl hover:shadow-xl transition-all duration-300 border border-green-200 hover:border-green-400">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Cloud size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Auto Cleanup
              </h3>
              <p className="text-slate-700 leading-relaxed">
                Files automatically delete every night. We don't store your data
                longer than necessary. Complete peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Simple, secure, and completely anonymous
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "1", title: "Scan QR", desc: "Find your shop's unique QR code" },
              {
                num: "2",
                title: "Upload",
                desc: "Select PDF and upload securely",
              },
              {
                num: "3",
                title: "Encrypted",
                desc: "Files are encrypted instantly",
              },
              { num: "4", title: "Print", desc: "Shop prints your document safely" },
            ].map((step) => (
              <div key={step.num} className="relative">
                <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                    {step.num}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-slate-600 text-sm">{step.desc}</p>
                </div>
                {step.num !== "4" && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-indigo-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Print Securely?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Upload your documents anonymously right now.
          </p>
          <Link
            to="/api/upload/c6982d95-db05-4ab2-ba81-34db93fc8a0a"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-indigo-600 rounded-xl hover:shadow-2xl transition-all duration-300 font-bold text-lg group"
          >
            <FileUp size={20} />
            Start Upload
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-slate-300">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2">
            Secure Network Print © 2024 | All rights reserved
          </p>
          <p className="text-sm text-slate-400">
            Built with privacy first. MERN stack with MySQL & JWT authentication.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;