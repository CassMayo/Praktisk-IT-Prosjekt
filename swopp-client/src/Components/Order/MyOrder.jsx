import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import ItemCard from './Modal/Details/Item/ItemCard';
import AddItemModal from './Modal/Create/Item/AddItemModal';
import './Modal/Details/Order/OrderDetailsCard.css';
import './MyOrder.css';

const RequestStatus = {
  0: 'Draft',
  1: 'Pending',
  2: 'Accepted',
  3: 'Completed',
  4: 'Cancelled',
  5: 'Lost'
};

const MyOrder = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [showItems, setShowItems] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchOrders = async () => {
    if (!user?.email || !token) {
      setError("Please log in to view your orders");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const ordersResponse = await fetch(
        `http://localhost:5078/api/request/user/${encodeURIComponent(user.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!ordersResponse.ok) {
        throw new Error(`Failed to fetch orders: ${ordersResponse.statusText}`);
      }

      const ordersData = await ordersResponse.json();
      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const itemsResponse = await fetch(
              `http://localhost:5078/api/item/request/${order.requestId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (!itemsResponse.ok) {
              return { ...order, items: [] };
            }

            const items = await itemsResponse.json();
            return { ...order, items };
          } catch (itemError) {
            console.error(`Error fetching items for order ${order.requestId}:`, itemError);
            return { ...order, items: [] };
          }
        })
      );

      // Sort orders by creation date and add user-specific order numbers
      const sortedOrders = ordersWithItems
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((order, index) => ({
          ...order,
          userOrderNumber: index + 1
        }));

      setOrders(sortedOrders);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');

      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchOrders();
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.email, token]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePublishOrder = async (orderId) => {
    const order = orders.find(o => o.requestId === orderId);
    
    if (!order.items || order.items.length === 0) {
        alert('Please add at least one item before publishing');
        return;
    }

    if (!window.confirm('Are you sure you want to publish this order?')) {
        return;
    }

    setIsPublishing(true);
    try {
        const response = await fetch(
            `http://localhost:5078/api/request/${orderId}/status`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify("Pending")
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to publish order');
        }

        setOrders(currentOrders =>
            currentOrders.map(ord => 
                ord.requestId === orderId
                    ? { ...ord, status: 1 }
                    : ord
            )
        );

        await fetchOrders();

    } catch (error) {
        console.error('Error publishing order:', error);
        setError('Failed to publish order. Please try again later.');
    } finally {
        setIsPublishing(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `http://localhost:5078/api/request/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }

      setOrders(orders.filter((order) => order.requestId !== orderId));
    } catch (error) {
      console.error('Error canceling order:', error);
      setError('Failed to cancel order. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOrder = (orderId) => {
    navigate(`/order/edit/${orderId}`);
  };

  const handleAddItem = (orderId) => {
    setSelectedOrderId(orderId);
    setShowAddItemModal(true);
  };

  const handleItemAdded = (newItem) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.requestId === selectedOrderId
          ? {
            ...order,
            items: [...(order.items || []), newItem]
          }
          : order
      )
    );
    setShowAddItemModal(false);
  };

  const toggleShowItems = (orderId) => {
    setShowItems(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleItemUpdate = (orderId) => (updatedItem) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.requestId === orderId
          ? {
            ...order,
            items: order.items.map(item =>
              item.itemId === updatedItem.itemId ? updatedItem : item
            )
          }
          : order
      )
    );
  };

  const handleItemDelete = (orderId) => (itemId) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.requestId === orderId
          ? {
            ...order,
            items: order.items.filter(item => item.itemId !== itemId)
          }
          : order
      )
    );
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.requestId === orderId
          ? { ...order, status: newStatus }
          : order
      )
    );
  };

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-error">
        <p>{error}</p>
        <button onClick={fetchOrders} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="my-orders-empty">
        <h2>My Orders</h2>
        <p>You don't have any orders yet.</p>
        <button
          onClick={() => navigate('/order')}
          className="btn-create"
        >
          Create New Order
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <div className="order-title">
        <h2>My Orders</h2>
        <button
          onClick={() => navigate('/order')}
          className="btn-create"
        >
          Create New Order
        </button>
      </div>
      <div className="orders-grid">
        {orders.map((order) => {
          const isDraft = order.status === 0;
          const isPending = order.status === 1;

          return (
            <div key={order.requestId} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <div className="order-header-details">
                    <h3 className="order-number">Your Order #{order.userOrderNumber}</h3>
                    <span className="order-created-at">
                      Created: {formatDate(order.createdAt)}
                    </span>
                  </div>
                  <span className={`status-badge status-${RequestStatus[order.status]?.toLowerCase()}`}>
                    {RequestStatus[order.status]}
                  </span>
                  {isDraft && !order.items?.length && (
                    <button
                      onClick={() => handleEditOrder(order.requestId)}
                      className="btn-edit-request"
                    >
                      Edit request
                    </button>
                  )}
                </div>
                <div className="order-actions">
                  {isDraft && (
                    <>
                      <button
                        onClick={() => handleAddItem(order.requestId)}
                        className="btn-add-item"
                      >
                        Add Item
                      </button>
                      <button
                        onClick={() => handlePublishOrder(order.requestId)}
                        className="btn-swoop btn-publish"
                        disabled={isPublishing || !order.items?.length}
                        title={!order.items?.length ? 'Add at least one item to publish' : ''}
                      >
                        {isPublishing ? 'Publishing...' : 'Publish Order'}
                      </button>
                    </>
                  )}
                  {(isDraft || isPending) && (
                    <button
                      onClick={() => handleDeleteOrder(order.requestId)}
                      className="btn-swoop"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {order.items?.length > 0 && (
                <div className="items-section">
                  <div className="items-header">
                    <div className="packages-count">
                      <div className="packages-icon">📦</div>
                      <span>{order.items.length} packages</span>
                    </div>
                    <button
                      className="btn-toggle"
                      onClick={() => toggleShowItems(order.requestId)}
                    >
                      {showItems[order.requestId] ? 'Hide Items' : 'Show Items'}
                    </button>
                  </div>

                  {showItems[order.requestId] && (
                    <div className="items-container">
                      <div className="items-grid">
                        {order.items.map((item) => (
                          <ItemCard
                            key={item.itemId}
                            item={item}
                            isDraft={isDraft}
                            onItemUpdated={handleItemUpdate(order.requestId)}
                            onItemDeleted={handleItemDelete(order.requestId)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="location-details">
                <div className="location-point">
                  <div className="point"></div>
                  <span>{order.pickupLocation}</span>
                </div>
                <div className="connection-line"></div>
                <div className="location-point">
                  <div className="point"></div>
                  <span>{order.dropoffLocation}</span>
                </div>
              </div>

              <div className="order-info-grid">
                <div className="info-item">
                  <label>Scheduled Dates</label>
                  <span>
                    {formatDate(order.scheduledAt)} - {formatDate(order.alternateDate)}
                  </span>
                </div>
                {order.description && (
                  <div className="info-item">
                    <label>Description</label>
                    <span>{order.description}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddItemModal && (
        <AddItemModal
          show={showAddItemModal}
          onHide={() => setShowAddItemModal(false)}
          requestId={selectedOrderId}
          onItemAdded={handleItemAdded}
          onStatusChange={(newStatus) => handleStatusChange(selectedOrderId, newStatus)}
        />
      )}
    </div>
  );
};

export default MyOrder;