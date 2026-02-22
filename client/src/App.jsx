import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UploadPage from "./pages/UploadPage";
import ShopDashboard from "./pages/ShopDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload/:shopId" element={<UploadPage />} />
        <Route path="/shop/:shopId/dashboard" element={<ShopDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;