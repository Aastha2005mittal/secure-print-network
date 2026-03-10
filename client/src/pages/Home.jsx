import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="text-center py-20 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-4xl font-bold mb-4">
          Anonymous & Secure Printing System
        </h1>
        <p className="text-lg mb-6">
          Upload documents securely without sharing phone numbers or email.
        </p>

        <div className="space-x-4">
         <Link
        to="/api/upload/c6982d95-db05-4ab2-ba81-34db93fc8a0a"
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
      >
        Upload File
      </Link>

          <Link
            to="/api/admin/login"
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-8 grid md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">QR Based Upload</h2>
          <p>Scan shop QR and upload instantly without identity exposure.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Secure Storage</h2>
          <p>Files auto-delete every night using cron system.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Multi-Shop Dashboard</h2>
          <p>Admin can manage multiple print shops easily.</p>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-200 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">About Secure Network Print</h2>
        <p className="max-w-2xl mx-auto">
          This platform ensures anonymous document printing through QR-based
          upload system. Designed using MERN stack with MySQL and secure JWT
          authentication.
        </p>
      </div>
    </div>
  );
}

export default Home;