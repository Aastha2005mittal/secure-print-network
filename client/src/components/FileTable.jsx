const FileTable = ({ files }) => {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b">
          <th className="p-2">File Name</th>
          <th className="p-2">Uploaded At</th>
          <th className="p-2">Download</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr key={file.id} className="border-b hover:bg-gray-50">
            <td className="p-2">{file.file_name}</td>
            <td className="p-2">
              {new Date(file.uploaded_at).toLocaleString()}
            </td>
            <td className="p-2">
              <a
                href={`http://localhost:5000/api/uploads/${file.file_path}`}
                className="text-blue-600 hover:underline"
                download
              >
                Download
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FileTable;