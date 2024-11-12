import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="success-page-container">
      <div className="success-card">
        <div className="logo-container">
          <span className="logo-text">pp</span>
        </div>

        <div className="success-message">
          <h1>Your shipment has been posted!</h1>
        </div>

        <div className="illustration-container">
          <div className="illustration-content">
            <div className="location-marker">
          <p>HEEEEYYYy</p>
            </div>
            <div className="phone-container">
              <div className="phone">
                <div className="phone-content">
                  <div className="loading-bar"></div>
                  <div className="loading-bar"></div>
                </div>
              </div>
            </div>
            <div className="package-box"></div>
          </div>
        </div>

        <div className="notification-message">
          <p>We are notifying our transporters</p>
          <p>Get ready for your package's epic journey!</p>
        </div>

        <div className="button-container">
          <button 
            onClick={() => navigate('/user')}
            className="btn-primary"
          >
            Sounds Good!
          </button>
          <button 
            onClick={() => navigate('/user')}
            className="btn-secondary"
          >
            Back to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
