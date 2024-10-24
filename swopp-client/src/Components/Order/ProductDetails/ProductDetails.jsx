import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const initialData = location.state;

    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Combine initial data with product details
        const requestData = {
            ...initialData,
            productName,
            productDescription
        };

        console.log('Final Request Data:', requestData);

        try {
            const response = await fetch('http://localhost:5000/api/Request/CreateRequest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${initialData.senderEmail}` // Adjust as needed for authorization
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Request created successfully:', responseData);
                alert('Request created successfully!');
                navigate('/success'); // Navigate to a success page or back to the dashboard
            } else {
                console.error('Failed to create request:', response.statusText);
                alert('Failed to create request.');
            }
        } catch (error) {
            console.error('Error creating request:', error);
            alert('An error occurred while creating the request.');
        }
    };

    return (
        <div className="product-details">
            <h1>Enter Product Details</h1>
            <form onSubmit={handleSubmit}>
                <label>Product Name</label>
                <input 
                    type="text" 
                    placeholder="Product Name" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required 
                />

                <label>Product Description</label>
                <textarea 
                    placeholder="Product Description" 
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    required 
                />

                <button type="submit">Submit Request</button>
            </form>
        </div>
    );
};

export default ProductDetails;
