import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // import Link

function ShopLogin() {
    const [shopId, setShopId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); // VERY IMPORTANT

        try {
            const res = await axios.post("http://localhost:5000/shop/login", {
               shopId: shopId.trim(),
    password: password.trim(),
            
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("shopId", res.data.shopId);
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
                <h2 className="text-xl font-bold mb-4 text-center">Shop Login</h2>

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

                {/* New Sign-up link */}
                <p className="text-center mt-4 text-sm text-gray-600">
                    Don't have a shop account?{" "}
                    <Link
                        to="/shop/register"
                        className="text-indigo-600 hover:underline"
                    >
                        Create one
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default ShopLogin;