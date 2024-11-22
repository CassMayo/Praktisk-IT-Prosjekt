import React, { useContext, useState } from "react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import MyOrder from "../Order/MyOrder";
import './UserPage.css';
import placeholderImage from '../../Assets/profilepicture_placeholder.png'; 

const UserPage = () => {
    const { user, token } = useContext(UserContext);
    const navigate = useNavigate();
    const [showProfile, setShowProfile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const imageUrl = user?.Image
        ? `http://localhost:5078${user.Image}`
        : placeholderImage;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
        }
    };

    const handlePictureUpdate = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("ImageFile", selectedFile);

        try {
            const response = await fetch(
                "http://localhost:5078/api/user/update-profile",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || "Failed to update profile.");
            }

            const data = await response.json();
            setSelectedFile(null);
            window.location.reload(); // Refresh the page to reflect changes
        } catch (err) {
            console.error("Error updating profile picture:", err);
            setError(err.message || "An error occurred while updating the profile picture.");
        } finally {
            setUploading(false);
        }
    };

    const toggleProfile = () => {
        setShowProfile(!showProfile);
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <>
            <NavBar />
            <div className="userpage-container">
                <div className="user-content-wrapper">
                    {/* Profile Section */}
                    <button className="toggle-profile-button" onClick={toggleProfile}>
                            {showProfile ? "Close Profile" : "Open Profile"}
                        </button>
                        <div className={`profile-section ${showProfile ? "show" : ""}`}>
                        <div className="profile-card">
                            <div className="profile-header">
                                <div className="profile-picture-container">
                                <img
                                        src={imageUrl}
                                        alt={user?.name}
                                        className="profile-picture"
                                    />
                                    <input
                                        id="update-profile"
                                        name="imageFile"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: "none" }} // Hide the input
                                    />
                                      <label htmlFor="update-profile">
                                        <button
                                            className="change-picture-button"
                                            onClick={() => {
                                                if (!selectedFile) {
                                                    document.getElementById("update-profile").click();
                                                } else {
                                                    handlePictureUpdate();
                                                }
                                            }}
                                            disabled={uploading}
                                        >
                                            {selectedFile
                                                ? uploading
                                                    ? "Uploading..."
                                                    : "Upload"
                                                : "Change Photo"}
                                        </button>
                                    </label>
                                    </div>
                                {error && <p className="error-message">{error}</p>}
                            </div>
                            <div className="profile-info">
                                <h2>Welcome! {user.name}</h2>
                                <p>Email: {user.email}</p>
                            </div>
                            <div className="edit-info">
                               
                            </div>
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div className="orders-section">
                        <MyOrder />
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserPage;