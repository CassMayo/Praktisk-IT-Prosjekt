import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import CreateOrderModal from './Modal/CreateOrderModal';
import AddItemModal from './Modal/AddItemModal';
import OrderDetailsCard from './Modal/OrderDetailsCard';
import './Order.css';
import NavBar from '../Navigation/NavBar';

const RequestStatus = {
    Draft: 0,
    Pending: 1,
    Accepted: 2,
    Completed: 3,
    Cancelled: 4,
    Lost: 5
};

const Order = () => {
    const { user, token } = useContext(UserContext);
    const navigate = useNavigate();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);

    const [orderData, setOrderData] = useState(null);
    const [createdRequestId, setCreatedRequestId] = useState(null);
    const [items, setItems] = useState([]);
    const [userOrderCount, setUserOrderCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUserOrders = async () => {
            if (!user?.email || !token) return;
            try {
                const response = await fetch(
                    `http://localhost:5078/api/request/user/${encodeURIComponent(user.email)}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (response.ok) {
                    const orders = await response.json();
                    setUserOrderCount(orders.length + 1);
                }
            } catch (error) {
                console.error('Error fetching user orders:', error);
            }
        };
        fetchUserOrders();
    }, [user?.email, token]);

    useEffect(() => {
        const fetchItems = async () => {
            if (!createdRequestId) return;
            try {
                const response = await fetch(
                    `http://localhost:5078/api/item/request/${createdRequestId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                if (response.ok) {
                    const data = await response.json();
                    setItems(data);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, [createdRequestId, token]);

    const handleCreateOrder = async (formData) => {
        setIsLoading(true);
        try {
            const requestData = {
                senderEmail: user.email,
                pickupLocation: formData.pickupLocation,
                dropoffLocation: formData.dropoffLocation,
                scheduledAt: formData.scheduledAt,
                description: formData.description || '',
                status: RequestStatus.Draft
            };

            const response = await fetch('http://localhost:5078/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            const responseData = await response.json();

            if (response.ok && responseData.requestId) {
                setCreatedRequestId(responseData.requestId);
                setOrderData(formData);
                setShowCreateModal(false);
            } else {
                throw new Error(responseData.message || 'Failed to create request');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwoopAway = async () => {
        if (items.length === 0) {
            alert('Please add at least one item before submitting the order');
            return;
        }

        if (!window.confirm('Are you sure you want to submit this order? You won\'t be able to edit it after submission.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...orderData,
                    status: RequestStatus.Pending
                })
            });

            if (response.ok) {
                alert('Order submitted successfully!');
                navigate('/user');
            } else {
                throw new Error('Failed to submit order');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemAdded = (newItem) => {
        setItems(prev => [...prev, newItem]);
        setShowAddItemModal(false);
    };

    if (!user || !token) {
        navigate('/login');
        return null;
    }

    return (
        <>
            <NavBar />
            <div className="main-container">
                <div className="order-title-container">
                    <h1 className="order-title">Order Registration</h1>
                    {!orderData && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            disabled={isLoading}
                            className="btn-create"
                        >
                            {isLoading ? 'Creating...' : 'Create New Order'}
                        </button>
                    )}
                </div>

                {orderData && createdRequestId && (
                    <div className="order-container">
                        <OrderDetailsCard
                            orderData={orderData}
                            items={items}
                            onAddItem={() => setShowAddItemModal(true)}
                            onSwoopAway={handleSwoopAway}
                            isLoading={isLoading}
                            userOrderCount={userOrderCount}
                        />
                    </div>
                )}
            </div>


            {showCreateModal && (
                <CreateOrderModal
                    show={showCreateModal}
                    onHide={() => setShowCreateModal(false)}
                    onSubmit={handleCreateOrder}
                    isLoading={isLoading}
                />
            )}

            {showAddItemModal && (
                <AddItemModal
                    show={showAddItemModal}
                    onHide={() => setShowAddItemModal(false)}
                    requestId={createdRequestId}
                    onItemAdded={handleItemAdded}
                />
            )}
        </>
    );
};

export default Order;
