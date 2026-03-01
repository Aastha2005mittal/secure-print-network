import { QRCodeCanvas } from "qrcode.react";

const QRSection = ({ shopId }) => {
  const qrValue = `http://localhost:5173/upload/${shopId}`;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold mb-2">
          Your Unique Print QR Code
        </h2>
        <p className="text-gray-500">
          Customers scan this QR to upload files anonymously.
        </p>
      </div>

      <div className="mt-4 md:mt-0">
        <QRCodeCanvas value={qrValue} size={160} />
      </div>
    </div>
  );
};

export default QRSection;