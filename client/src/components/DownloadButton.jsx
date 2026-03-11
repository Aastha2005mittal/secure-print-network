import React from "react";
import axios from "axios";

const DownloadButton = ({ file }) => {
    const handleDownload = async () => {
        try {
            // Fetch file as blob
           const response = await axios.get(
  `http://localhost:5000/api/files/download/${file.id}`,
  { responseType: "blob" }
);
            const blob = new Blob([response.data]);
            const blobUrl = window.URL.createObjectURL(blob);

            // Trigger download
            const link = document.createElement("a");
            link.href = blobUrl;
            link.setAttribute("download", file.file_name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Open new tab and trigger print
            const printWindow = window.open(blobUrl);
            if (printWindow) {
                printWindow.focus();
                printWindow.print();
            }
        } catch (err) {
            console.error("Download failed:", err);
            alert("Failed to download file.");
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Download & Print
        </button>
    );
};

export default DownloadButton;