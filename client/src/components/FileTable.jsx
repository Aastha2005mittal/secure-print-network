import DownloadButton from "./DownloadButton";

const FileTable = ({ files, onDelete }) => {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="p-2">File Name</th>
          <th className="p-2">Uploaded At</th>
          <th className="p-2">Status</th>
          <th className="p-2">Action</th>
        </tr>
      </thead>

      <tbody>
        {files.map((file) => (
          <tr key={file.id} className="border-b hover:bg-gray-50">
            
            <td className="p-2">{file.file_name}</td>

            <td className="p-2">
              {new Date(file.uploaded_at).toLocaleString()}
            </td>

            {/*  STATUS COLUMN */}
            <td className="p-2">
              <span
                className={
                  file.status === "Pending"
                    ? "text-yellow-600 font-semibold"
                    : file.status === "Printing"
                    ? "text-blue-600 font-semibold"
                    : "text-green-600 font-semibold"
                }
              >
                {file.status}
              </span>
            </td>

            <td className="p-2">
              <DownloadButton file={file} onDelete={onDelete} />
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FileTable;