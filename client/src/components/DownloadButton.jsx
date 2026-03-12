import axios from "axios";

const DownloadButton = ({ file, onDelete }) => {

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/files/download/${file.id}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const newWindow = window.open(url);

      newWindow.onload = () => {
        newWindow.print();
      };

      // remove file from UI
      onDelete(file.id);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-500 text-black px-3 py-1 rounded"
    >
      Download and Print
    </button>
  );
};

export default DownloadButton;