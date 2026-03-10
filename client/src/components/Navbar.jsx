import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">
        Secure Network Print
      </h1>

      <div className="space-x-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/api/upload/a2ec693a-204f-4dc9-877f-e1f0c7009dd2" className="hover:text-blue-600">Upload</Link>
        <Link to="/shop/login" className="hover:text-blue-600">Shop Login</Link>
        <Link to="/api/admin/login" className="hover:text-blue-600">Admin Login</Link>
        <Link to="/about" className="hover:text-blue-600">About</Link>
      </div>
    </nav>
  );
}

export default Navbar;