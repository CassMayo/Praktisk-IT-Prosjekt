import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import the useNavigate hook

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
    setLoading(true); // Show loading state when submitting

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
        setError(errorData.message || 'Registration failed.'); // Handle error
      }
    } catch (err) {
      setError('Something went wrong. Please try again.'); // Handle network or server errors
    } finally {
      setLoading(false); // Hide loading state when done
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading} // Disable during loading
          />
        </div>
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
  );
};

export default Register;
