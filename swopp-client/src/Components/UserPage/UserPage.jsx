import React, { useContext, useState } from "react";
import { UserContext } from "../Context/UserContext";
import { useNavigate } from "react-router-dom";
import NavBar from "../Navigation/NavBar";
import MyOrder from "../Order/MyOrder";
import usePfp from "../customHooks/Pfp";
import './UserPage.css';

const UserPage = () => {
    const { user, token } = useContext(UserContext);
    const navigate = useNavigate();
    const { Pfp, uploading, uploadError } = usePfp();
    const [profilePicture, setProfilePicture] = useState(user?.Pfp);
    const [showProfile, setShowProfile] = useState(false); // toggle profile section

    const handlePfpChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const profilePictureUrl = await Pfp(file, token);
                setProfilePicture(profilePictureUrl);
            } catch (error) {
                console.error('Error uploading profile picture:', error);
            }
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
                                        src={profilePicture || user?.Pfp} 
                                        alt={user?.name} 
                                        className="profile-picture"
                                    />
                                    <label className="upload-button" htmlFor="profile-upload">
                                        <input
                                            id="profile-upload"
                                            type="file"
                                            onChange={handlePfpChange}
                                            disabled={uploading}
                                            hidden
                                        />
                                        {uploading ? 'Uploading...' : 'Change Picture'}
                                    </label>
                                </div>
                                {uploadError && (
                                    <p className="error-message">{uploadError}</p>
                                )}
                            </div>
                            <div className="profile-info">
                                <h2>{user?.name}</h2>
                                <p>{user?.email}</p>
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
