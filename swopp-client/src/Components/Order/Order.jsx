import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import CreateOrderModal from './Modal/Create/Order/CreateOrderModal';
import AddItemModal from './Modal/Create/Item/AddItemModal';
import OrderDetailsCard from './Modal/Details/Order/OrderDetailsCard';
import EditRequestModal from './Modal/Edit/Requeest/EditRequestModal';
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
    const [showEditRequestModal, setShowEditRequestModal] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [createdRequestId, setCreatedRequestId] = useState(null);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(RequestStatus.Draft);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [userOrderCount, setUserOrderCount] = useState(0);

    // Fetch orders and user order count
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:5078/api/request/user/${encodeURIComponent(user.email)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch orders');

                const ordersData = await response.json();
                setOrders(ordersData);
                setUserOrderCount(ordersData.length + 1);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        if (user && token) {
            fetchOrders();
        }
    }, [user, token]);

    // Fetch items whenever createdRequestId changes
    useEffect(() => {
        const fetchItems = async () => {
            if (!createdRequestId) return;

            try {
                const response = await fetch(
                    `http://localhost:5078/api/item/request/${createdRequestId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch items');
                }

                const itemsData = await response.json();
                setItems(itemsData);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [createdRequestId, token]);

    const handleAddNewItem = async (newItem) => {
        try {
            // After successfully adding the item, fetch all items again
            const response = await fetch(
                `http://localhost:5078/api/item/request/${createdRequestId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch updated items');
            }

            const updatedItems = await response.json();
            setItems(updatedItems);
            setShowAddItemModal(false);
        } catch (error) {
            console.error('Error updating items:', error);
            alert('Failed to update items. Please try again.');
        }
    };

    const handleAddItem = () => {
        if (orderStatus === RequestStatus.Draft && createdRequestId) {
            setShowAddItemModal(true);
        } else {
            alert("Items can only be added when the order is in Draft status");
        }
    };

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
                setOrderStatus(RequestStatus.Draft);
                setItems([]); // Initialize items array
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

    const handleSaveDraft = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify("Draft"),
            });

            if (response.ok) {
                setOrderStatus(RequestStatus.Draft);
                navigate('/user');
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
        if (!items || items.length === 0) {
            alert('Please add at least one item before publishing');
            return;
        }

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
                setOrderStatus(RequestStatus.Pending);
                navigate('/Order-success');
            } else {
                throw new Error('Failed to publish order');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditOrder = async (formData) => {
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

            const response = await fetch(`http://localhost:5078/api/request/${createdRequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const updatedData = await response.json();
                setOrderData({ ...formData, requestId: createdRequestId });
                setShowEditRequestModal(false);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemUpdate = async (updatedItem) => {
        try {
            // After successfully updating the item, fetch all items again
            const response = await fetch(
                `http://localhost:5078/api/item/request/${createdRequestId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch updated items');
            }

            const updatedItems = await response.json();
            setItems(updatedItems);
        } catch (error) {
            console.error('Error updating items:', error);
        }
    };

    const handleItemDelete = async (itemId) => {
        try {
            const response = await fetch(`http://localhost:5078/api/item/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            // After successfully deleting the item, fetch all items again
            const itemsResponse = await fetch(
                `http://localhost:5078/api/item/request/${createdRequestId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!itemsResponse.ok) {
                throw new Error('Failed to fetch updated items');
            }

            const updatedItems = await itemsResponse.json();
            setItems(updatedItems);
        } catch (error) {
            console.error('Error handling item deletion:', error);
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
                    onEditRequest={() => setShowEditRequestModal(true)}
                    onItemUpdate={handleItemUpdate}
                    onItemDelete={handleItemDelete}
                    status={orderStatus}
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

            {showEditRequestModal && (
                <EditRequestModal
                    show={showEditRequestModal}
                    onHide={() => setShowEditRequestModal(false)}
                    onSubmit={handleEditOrder}
                    isLoading={isLoading}
                    initialData={orderData}
                />
            )}

            {showAddItemModal && (
                <AddItemModal
                    show={showAddItemModal}
                    onHide={() => setShowAddItemModal(false)}
                    requestId={createdRequestId}
                    onItemAdded={handleAddNewItem}
                />
            )}
        </div>
    );
};

export default Order;