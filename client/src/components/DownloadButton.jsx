import axios from "axios";

const DownloadButton = ({ file }) => {

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/files/download/${file.id}`,
        {
          responseType: "blob",
        }
      );

      // create PDF blob
      const blob = new Blob([response.data], { type: "application/pdf" });

      const fileURL = URL.createObjectURL(blob);

      const newWindow = window.open(fileURL);

      // auto open print dialog
      newWindow.onload = () => {
        newWindow.print();
      };

    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed");
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-600"
    >
      Download & Print
    </button>
  );
};

export default DownloadButton;