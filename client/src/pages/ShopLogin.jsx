import React from "react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ShopLogin() {
    const [shopId, setShopId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // VERY IMPORTANT

        try {
         const res = await axios.post("http://localhost:5000/shop/login", {
    shopId,
    password,
});

localStorage.setItem("token", res.data.token);

navigate(`/dashboard/${res.data.shopId}`);

            navigate(`/dashboard/${res.data.shopId}`);
        } catch (err) {
            alert("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow w-96"
            >
                <h2 className="text-xl font-bold mb-4 text-center">
                    Shop Login
                </h2>

                <input
                    type="text"
                    placeholder="Shop ID"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                    required
                    autoComplete="username"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                    required
                    autoComplete="current-password"
                />
                <button
                    type="submit"
                    className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700"
                >
                    Login
                </button>
            </form>
        </div>
    );
}

export default ShopLogin;