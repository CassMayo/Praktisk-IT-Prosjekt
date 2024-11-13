import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import CreateOrderModal from './Modal/CreateOrderModal';
import AddItemModal from './Modal/AddItemModal';
import OrderDetailsCard from './Modal/OrderDetailsCard';
import { useNavigate } from 'react-router-dom';
import './Order.css';

const RequestStatus = {
    Draft: 0,
    Pending: 1,
    Accepted: 2,
    Completed: 3,
    Cancelled: 4,
    Lost: 5,
};

const Order = () => {
    const { user, token } = useContext(UserContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [createdRequestId, setCreatedRequestId] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [userOrderCount, setUserOrderCount] = useState(0);

    useEffect(() => {
        // Fetch orders here and set them in `orders` state
        const fetchOrders = async () => {
            try {
                const response = await fetch('http://localhost:5078/api/request/user/' + encodeURIComponent(user.email), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch orders');

                const ordersData = await response.json();
                setOrders(ordersData);

                // Set the order count based on the number of orders fetched
                setUserOrderCount(ordersData.length + 1); // Add 1 to show the next order number
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        if (user && token) {
            fetchOrders();
        }
    }, [user, token]);

    const handleCreateOrder = async (formData) => {
        setIsLoading(true);
        try {
            const requestData = {
                senderEmail: user.email,
                pickupLocation: formData.pickupLocation,
                dropoffLocation: formData.dropoffLocation,
                scheduledAt: formData.scheduledAt,
                alternateDate: formData.alternateDate,
                description: formData.description || '',
                status: RequestStatus.Draft,
            };

            const response = await fetch('http://localhost:5078/api/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const responseData = await response.json();
                setCreatedRequestId(responseData.requestId);
                setOrderData({ ...formData, requestId: responseData.requestId });
                setShowCreateModal(false);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create order');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddItem = () => setShowAddItemModal(true);

    const handleSaveDraft = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                alert('Draft Saved');
            } else {
                throw new Error('Failed to save draft');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify("Pending"),
            });

            if (response.ok) {
                navigate('Order-success');
            } else {
                throw new Error('Failed to publish order');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
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
                <OrderDetailsCard
                    orderData={orderData}
                    items={items}
                    onAddItem={handleAddItem}
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                    isLoading={isLoading}
                    userOrderCount={userOrderCount}
                    onEditRequest={() => setShowCreateModal(true)}
                    onEditItem={() => {}}
                />
            )}

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
                    onItemAdded={(newItem) => setItems((prev) => [...prev, newItem])}
                />
            )}
        </div>
    );
};

export default Order;
