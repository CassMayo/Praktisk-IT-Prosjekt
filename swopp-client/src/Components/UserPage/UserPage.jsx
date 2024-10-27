import React, { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";

const UserPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Swopp</h1>
                <p className="text-xl">Welcome, {user?.name}!</p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Your Orders</h2>
                <button 
                    onClick={() => navigate('/order')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                    Create New Order
                </button>
                
            </div>
        </div>
    );
};

export default UserPage;