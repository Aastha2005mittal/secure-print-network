import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserUpload from "./pages/UserUpload";
import AdminLogin from "./pages/AdminLogin";
import ShopLogin from "./pages/ShopLogin";
import ShopDashboard from "./pages/ShopDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload/:shopId" element={<UserUpload />} />
        <Route path="/api/admin/login" element={<AdminLogin />} />
        <Route path="/shop/login" element={<ShopLogin />} />
         <Route path="/dashboard/:shopId" element={<ShopDashboard/>} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;