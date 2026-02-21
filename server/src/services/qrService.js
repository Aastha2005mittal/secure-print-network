const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const generateShopQRCode = async (shopId) => {
  try {
    const url = `http://localhost:5000/upload/${shopId}`;
    const qrPath = path.join(__dirname, "../../qrcodes");
    
    // Create folder if not exists
    if (!fs.existsSync(qrPath)) fs.mkdirSync(qrPath);

    const filePath = path.join(qrPath, `${shopId}.png`);
    await QRCode.toFile(filePath, url);
    return filePath; // save this path in DB
  } catch (err) {
    console.error("QR code generation error:", err);
  }
};

module.exports = { generateShopQRCode };