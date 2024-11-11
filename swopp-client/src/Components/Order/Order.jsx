import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import CreateOrderModal from './Modal/CreateOrderModal';
import AddItemModal from './Modal/AddItemModal';
import OrderDetailsCard from './Modal/OrderDetailsCard';
import EditRequestModal from './Modal/EditRequestModal';
import EditItemModal from './Modal/EditItemModal';
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

    const [showEditRequestModal, setShowEditRequestModal] = useState(false);
    const [showEditItemModal, setShowEditItemModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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
        setIsLoading(true);
        try {
            // Determine the status based on whether there are items
            const newStatus = items.length > 0 ? RequestStatus.Pending : RequestStatus.Draft;

            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...orderData,
                    status: newStatus
                })
            });

            if (response.ok) {
                // Different messages based on status
                if (newStatus === RequestStatus.Pending) {
                    alert('Order submitted successfully!');
                    navigate('/user');
                } else {
                    alert('Order saved as draft. Please add items before submitting.');
                }
            } else {
                throw new Error('Failed to update order');
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

    const handleEditRequest = async (updatedData) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...updatedData,
                    status: RequestStatus.Draft
                })
            });

            if (response.ok) {
                setOrderData(updatedData);
                setShowEditRequestModal(false);
            } else {
                throw new Error('Failed to update request');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemUpdated = (updatedItem) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            )
        );
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
                            onEditRequest={() => setShowEditRequestModal(true)}
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
            {showEditRequestModal && (
                <EditRequestModal
                    show={showEditRequestModal}
                    onHide={() => setShowEditRequestModal(false)}
                    onSubmit={handleEditRequest}
                    isLoading={isLoading}
                    initialData={orderData}
                />
            )}

            {showEditItemModal && selectedItem && (
                <EditItemModal
                    show={showEditItemModal}
                    onHide={() => {
                        setShowEditItemModal(false);
                        setSelectedItem(null);
                    }}
                    item={selectedItem}
                    onItemUpdated={handleItemUpdated}
                />
            )}
        </>
    );
};

export default Order;
