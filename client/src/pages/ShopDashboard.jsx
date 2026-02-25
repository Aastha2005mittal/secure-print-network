import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function ShopDashboard() {
    const { shopId } = useParams();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await API.get(
                    `/shop/${shopId}/uploads`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } catch (error) {
                console.error("Error fetching files:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [shopId]);

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">
                    Shop Dashboard
                </h2>

                {loading ? (
                    <p>Loading...</p>
                ) : files.length === 0 ? (
                    <p>No files uploaded yet.</p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">File Name</th>
                                <th className="p-2 border">Upload Time</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.uploadId}>
                                    <td className="p-2 border">{file.fileName}</td>
                                    <td className="p-2 border">
                                        {new Date(file.uploadTime).toLocaleString()}
                                    </td>
                                    <td className="p-2 border text-center">
                                        <button
                                            onClick={() =>
                                                window.open(
                                                    `http://localhost:5000/shop/download/${file.uploadId}`,
                                                    "_blank"
                                                )
                                            }
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ShopDashboard;