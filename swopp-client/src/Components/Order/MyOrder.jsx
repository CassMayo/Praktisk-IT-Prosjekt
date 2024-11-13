import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import EditItemModal from './Modal/EditItemModal';
import './Modal/OrderDetailsCard.css';

const RequestStatus = {
  0: 'Draft',
  1: 'Pending',
  2: 'Accepted',
  3: 'Completed',
  4: 'Cancelled',
  5: 'Lost'
};

const ItemCard = ({ item }) => {
  const imageUrl = item.image 
    ? `http://localhost:5078${item.image}` 
    : '/api/placeholder/200/150';

  return (
    <div className="item-card">
      <div className="item-card-inner">
        <div className="item-image-container">
          <img
            src={imageUrl}
            alt={item.itemName}
            className="item-image"
          />
        </div>
        <div className="item-info">
          <div className="item-dimensions">
            {item.width || "50"} x {item.height || "50"} x {item.depth || "50"} cm
          </div>
          <div className="item-weight">
            {item.weight || "70"} KG
          </div>
        </div>
      </div>
    </div>
  );
};

const MyOrder = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [showItems, setShowItems] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

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
        `${process.env.REACT_APP_API_URL || 'http://localhost:5078'}/api/request/user/${encodeURIComponent(user.email)}`,
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
              `${process.env.REACT_APP_API_URL || 'http://localhost:5078'}/api/item/request/${order.requestId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (!itemsResponse.ok) {
              console.warn(`Failed to fetch items for order ${order.requestId}`);
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

      setOrders(ordersWithItems);
      setError(null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      setLoading(false);

      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchOrders();
        }, 3000);
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5078'}/api/request/${orderId}`,
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
    navigate(`/order/${orderId}/add-item`);
  };

  const toggleShowItems = (orderId) => {
    setShowItems(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString('en-SE', {
      day: 'numeric',
      month: 'short',
    }) : 'Anytime';
  };

  // Only show edit button for drafts with no items
  const shouldShowEditButton = (order) => {
    return order.status === 0 && (!order.items || order.items.length === 0);
  };

  // Only show add item button for drafts
  const shouldShowAddItem = (order) => {
    return order.status === 0;
  };

  // Show cancel button for both drafts and pending
  const shouldShowCancel = (order) => {
    return order.status === 0 || order.status === 1;
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.email, token]);

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
        <button 
          onClick={() => {
            setRetryCount(0);
            fetchOrders();
          }}
          className="btn-retry"
        >
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
          className="btn-create-order"
        >
          Create New Order
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders-container">
      <h2>My Orders</h2>
      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.requestId} className="order-card">
            <div className="order-card-header">
              <div className="order-info">
                <h3 className="order-number">Order #{order.requestId}</h3>
                <span className={`status-badge status-${RequestStatus[order.status]?.toLowerCase()}`}>
                  {RequestStatus[order.status]}
                </span>
                {shouldShowEditButton(order) && (
                  <button
                    onClick={() => handleEditOrder(order.requestId)}
                    className="btn-edit-request"
                  >
                    Edit request
                  </button>
                )}
              </div>
              <div className="order-actions">
                {shouldShowAddItem(order) && (
                  <button
                    onClick={() => handleAddItem(order.requestId)}
                    className="btn-add-item"
                  >
                    Add Item
                  </button>
                )}
                {shouldShowCancel(order) && (
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
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
        ))}
      </div>
    </div>
  );
};

export default MyOrder;