import React from "react";
import { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useParams } from "react-router-dom";

function UserUpload() {
    const [file, setFile] = useState(null);
     const { shopId } = useParams();
    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("file", file);

        await axios.post(`http://localhost:5000/upload`, formData);

        alert("File uploaded successfully!");
    };
 
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex justify-center items-center h-[70vh]">
                <div className="bg-white p-8 rounded-xl shadow w-96">
                    <h2 className="text-xl font-semibold mb-4">
                        Upload Your Document
                    </h2>

                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="mb-4"
                    />

                    <button
                        onClick={handleUpload}
                        className="bg-blue-600 text-white px-6 py-2 rounded w-full"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserUpload;