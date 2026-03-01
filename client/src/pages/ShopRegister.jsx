import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function ShopRegister() {
    const [shopId, setShopId] = useState("");
    const [shopName, setShopName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const res = await axios.post("http://localhost:5000/shop/create", {
                shopId,
                shopName,
                password,
            });

            if (res.data.success) {
                alert("Shop account created successfully!");
                navigate("/shop/login"); // redirect to login
            } else {
                alert("Failed to create account. Try again.");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Server error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={handleRegister}
                className="bg-white p-8 rounded-xl shadow w-96"
            >
                <h2 className="text-xl font-bold mb-4 text-center">Create Shop Account</h2>

                <input
                    type="text"
                    placeholder="Shop ID"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                    required
                />

                <input
                    type="text"
                    placeholder="Shop Name"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                    required
                    autoComplete="new-password"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border p-2 rounded w-full mb-4"
                    required
                    autoComplete="new-password"
                />

                <button
                    type="submit"
                    className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700"
                >
                    Register
                </button>

                <p className="text-center mt-4 text-sm text-gray-600">
                    Already have a shop account?{" "}
                    <Link
                        to="/shop/login"
                        className="text-indigo-600 hover:underline"
                    >
                        Login here
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default ShopRegister;