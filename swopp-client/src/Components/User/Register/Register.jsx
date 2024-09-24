import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook
import './Register.css';
import RegistrationIllustration from '../../../Assets/RegistrationIllustration.png';  // Import the registration illustration


const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  const navigate = useNavigate();  // Initialize the useNavigate hook

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error or success messages when user starts typing
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch('http://localhost:5078/api/sender/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message); // Show success message
  
        // Redirect to the login page after 2 seconds
        setTimeout(() => {
          navigate('/login');  // Redirect to login page
        }, 2000);
      } else {
        const errorData = await response.json();
        console.log(errorData); // Debugging: Log the error response
  
        // Check if there are validation errors returned from the backend
        if (errorData.errors) {
          // Collect all validation error messages into a single array
          const allErrors = Object.values(errorData.errors).flat();
          setError(allErrors.join(', ')); // Display all errors as a single message
        } else if (errorData.message) {
          setError(errorData.message); // Show the specific error message
        } else {
          setError('Registration failed.'); // Fallback error message
        }
      }
    } catch (err) {
      console.error('An error occurred:', err); // Debugging: Log any caught errors
      setError('Something went wrong. Please try again.'); // Handle network or server errors
    } finally {
      setLoading(false); // Hide loading state when done
    }
  };
  

  return (
    <div className="main-container">
      <article>
        <div className="tittle">
          <h1>Welcome!</h1>
          <h2>Ready to make sending easier?</h2>
        </div>
        <div className="registration-container">
          {message && <p className='SuccessMessage'>{message}</p>}
          {error && <p className='ErrorMessage'>{error}</p>}
          <form onSubmit={handleSubmit}>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading} // Disable during loading
            />
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading} // Disable during loading
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading} // Disable during loading
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Registering...' : 'Register'} {/* Button text changes based on loading state */}
            </button>
          </form>
        </div>
      </article>
      <div className="illustration">
        <img src={RegistrationIllustration} alt="Illustration" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
    </div>
  );
};

export default Register;
